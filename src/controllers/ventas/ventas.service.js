const Venta      = require('../../moduls/venta');
const Counter    = require('../../moduls/counter');
const Product    = require('../../moduls/product');
const Movimiento = require('../../moduls/movimiento');

// ─── Decrementar stock (reserva o venta directa) ─────────────────────────────
async function decrementarStock(items) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.producto, {
      $inc: { stock: -Math.abs(Number(item.cantidad)) },
    });
  }
}

// ─── Liberar stock reservado (al cancelar borrador) ──────────────────────────
async function liberarStock(items) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.producto, {
      $inc: { stock: Math.abs(Number(item.cantidad)) },
    });
  }
}

// ─── Ajustar stock al modificar un borrador (delta entre items viejos y nuevos)
async function ajustarStockBorrador(oldItems, newItems) {
  const oldMap = {};
  for (const it of oldItems) {
    const id = it.producto.toString();
    oldMap[id] = (oldMap[id] || 0) + Number(it.cantidad);
  }
  const newMap = {};
  for (const it of newItems) {
    const id = it.producto.toString();
    newMap[id] = (newMap[id] || 0) + Number(it.cantidad);
  }
  const allIds = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
  for (const id of allIds) {
    const delta = (newMap[id] || 0) - (oldMap[id] || 0);
    if (delta !== 0) {
      await Product.findByIdAndUpdate(id, { $inc: { stock: -delta } });
    }
  }
}

// ─── Crear movimiento de ingreso por venta POS ────────────────────────────────
async function crearIngresoVenta(venta, companiaId, user) {
  await Movimiento.create({
    tipo_movimiento: 'ingreso',
    referencia:      venta.numeroFactura,
    fecha:           new Date(),
    valor:           venta.total,
    tipo:            'Venta de producto',
    descripcion:     `Venta POS - Factura ${venta.numeroFactura}${venta.clienteNombre ? ` - ${venta.clienteNombre}` : ''}`,
    compania:        companiaId,
    nombre:          user?.nombre || 'POS',
    modulo:          'pos',
    referenciaId:    venta._id,
    metodo_pago:     venta.metodoPago,
    cliente_nombre:  venta.clienteNombre,
    numero_factura:  venta.numeroFactura,
  });
}

// ─── Calcular totales a partir de los items ───────────────────────────────────
function calcularTotales(items, descuento = 0) {
  const subtotal = items.reduce((acc, item) => {
    const sub = Number(item.cantidad) * Number(item.precioUnitario);
    item.subtotal = sub;
    return acc + sub;
  }, 0);
  const total = subtotal - Number(descuento);
  return { subtotal, total };
}

// ─── Listar ventas por estado ─────────────────────────────────────────────────
async function getVentas({ companiaId, estado }) {
  const filtro = { companiaId };
  if (estado) filtro.estado = estado;
  return Venta.find(filtro)
    .populate('items.producto', 'name price img')
    .sort({ createdAt: -1 });
}

// ─── Obtener una venta por id ─────────────────────────────────────────────────
async function getVentaById({ id, companiaId }) {
  return Venta.findOne({ _id: id, companiaId })
    .populate('items.producto', 'name price img');
}

// ─── Generar número de factura correlativo por compañía ───────────────────────
async function getNextNumeroFactura(companiaId) {
  const counter = await Counter.findOneAndUpdate(
    { _id: `factura_${companiaId}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `FAC-${String(counter.seq).padStart(4, '0')}`;
}

// ─── Crear venta ──────────────────────────────────────────────────────────────
async function crearVenta({ companiaId, datos, user }) {
  const { clienteNombre, items = [], descuento = 0, metodoPago, notas, estado = 'borrador' } = datos;

  const itemsNorm = items.map(i => ({
    producto:       i.producto,
    cantidad:       Number(i.cantidad),
    precioUnitario: Number(i.precioUnitario),
    subtotal:       Number(i.cantidad) * Number(i.precioUnitario),
  }));

  const { subtotal, total } = calcularTotales(itemsNorm, descuento);

  const numeroFactura = await getNextNumeroFactura(companiaId);

  const venta = new Venta({
    companiaId,
    numeroFactura,
    clienteNombre: clienteNombre || '',
    items:         itemsNorm,
    subtotal,
    descuento:     Number(descuento),
    total,
    metodoPago:    metodoPago || 'efectivo',
    notas:         notas || '',
    estado,
  });

  await venta.save();

  if (estado === 'borrador') {
    // Reservar stock al crear un borrador nuevo
    await decrementarStock(itemsNorm);
  } else if (estado === 'finalizada') {
    // Venta directa sin pasar por borrador: decrementar y registrar ingreso
    await decrementarStock(itemsNorm);
    await crearIngresoVenta(venta, companiaId, user);
  }

  return venta;
}

// ─── Actualizar venta ─────────────────────────────────────────────────────────
async function actualizarVenta({ id, companiaId, datos, user }) {
  const venta = await Venta.findOne({ _id: id, companiaId });
  if (!venta) return null;

  // No permite editar una venta ya finalizada o cancelada
  if (venta.estado === 'finalizada' || venta.estado === 'cancelada') {
    const err = new Error('No se puede editar una venta finalizada o cancelada');
    err.code = 'ESTADO_INVALIDO';
    throw err;
  }

  const { clienteNombre, items, descuento, metodoPago, notas, estado } = datos;
  const seEstaFinalizando = estado === 'finalizada';

  // Guardar items anteriores antes de modificar (para calcular delta de reserva)
  const oldItems = venta.items.map(i => ({
    producto: i.producto.toString(),
    cantidad: i.cantidad,
  }));

  if (clienteNombre !== undefined) venta.clienteNombre = clienteNombre;
  if (metodoPago    !== undefined) venta.metodoPago    = metodoPago;
  if (notas         !== undefined) venta.notas         = notas;
  if (estado        !== undefined) venta.estado        = estado;

  if (items !== undefined) {
    venta.items = items.map(i => ({
      producto:       i.producto,
      cantidad:       Number(i.cantidad),
      precioUnitario: Number(i.precioUnitario),
      subtotal:       Number(i.cantidad) * Number(i.precioUnitario),
    }));
  }

  const desc = descuento !== undefined ? Number(descuento) : venta.descuento;
  const { subtotal, total } = calcularTotales(venta.items, desc);
  venta.subtotal  = subtotal;
  venta.descuento = desc;
  venta.total     = total;

  await venta.save();

  if (seEstaFinalizando) {
    // El stock ya estaba reservado desde que se guardó como borrador.
    // Solo se crea el ingreso, sin volver a decrementar.
    await crearIngresoVenta(venta, companiaId, user);
  } else if (estado === 'cancelada') {
    // Borrador cancelado: devolver el stock reservado al inventario
    await liberarStock(oldItems);
  } else if (items !== undefined) {
    // Sigue siendo borrador pero cambiaron los items: ajustar la reserva
    const newItems = venta.items.map(i => ({
      producto: i.producto.toString(),
      cantidad: i.cantidad,
    }));
    await ajustarStockBorrador(oldItems, newItems);
  }

  return venta;
}

// ─── Cancelar venta (cambia estado a "cancelada") ────────────────────────────
async function cancelarVenta({ id, companiaId }) {
  const venta = await Venta.findOne({ _id: id, companiaId });
  if (!venta) return null;

  if (venta.estado === 'finalizada') {
    const err = new Error('No se puede cancelar una venta ya finalizada');
    err.code = 'ESTADO_INVALIDO';
    throw err;
  }

  // Si era borrador, devolver el stock reservado al inventario
  if (venta.estado === 'borrador' && venta.items?.length) {
    await liberarStock(venta.items);
  }

  venta.estado = 'cancelada';
  await venta.save();
  return venta;
}

module.exports = { getVentas, getVentaById, crearVenta, actualizarVenta, cancelarVenta };
