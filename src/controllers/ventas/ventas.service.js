const Venta   = require('../../moduls/venta');
const Counter = require('../../moduls/counter');

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
async function crearVenta({ companiaId, datos }) {
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
  return venta;
}

// ─── Actualizar venta ─────────────────────────────────────────────────────────
async function actualizarVenta({ id, companiaId, datos }) {
  const venta = await Venta.findOne({ _id: id, companiaId });
  if (!venta) return null;

  // No permite editar una venta ya finalizada o cancelada
  if (venta.estado === 'finalizada' || venta.estado === 'cancelada') {
    const err = new Error('No se puede editar una venta finalizada o cancelada');
    err.code = 'ESTADO_INVALIDO';
    throw err;
  }

  const { clienteNombre, items, descuento, metodoPago, notas, estado } = datos;

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

  venta.estado = 'cancelada';
  await venta.save();
  return venta;
}

module.exports = { getVentas, getVentaById, crearVenta, actualizarVenta, cancelarVenta };
