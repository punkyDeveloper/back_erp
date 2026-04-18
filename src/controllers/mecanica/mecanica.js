const Mecanica          = require("../../moduls/mecanica");
const MovimientoService = require("../tipo_movimiento/movimineto");

// ─── Helper: calcula totales desde items ──────────────────────────────────────
const calcularTotales = (servicios = [], productos = []) => {
  const totalServicios  = servicios.reduce((s, x) => s + (Number(x.precio) || 0), 0);
  const totalVentaProds = productos.reduce((s, p) => s + (Number(p.precioVenta) || 0) * (Number(p.cantidad) || 1), 0);
  const totalCostoProds = productos.reduce((s, p) => s + (Number(p.costo) || 0) * (Number(p.cantidad) || 1), 0);

  const costoCliente  = totalServicios + totalVentaProds;
  const gananciaTotal = totalServicios + (totalVentaProds - totalCostoProds);

  return { costoCliente, gananciaTotal };
};

// ─── GET paginado ─────────────────────────────────────────────────────────────
const getMantenimientos = async ({ companiaId, estado, page = 1, limit = 20 }) => {
  const filtro = { companiaId };
  if (estado && estado !== "Todos") filtro.estado = estado;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Mecanica.countDocuments(filtro);
  const data  = await Mecanica.find(filtro)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Stats globales (siempre sobre toda la compañía, sin filtro de estado)
  const [statsAgg] = await Mecanica.aggregate([
    { $match: { companiaId: String(companiaId) } },
    {
      $group: {
        _id: null,
        totalRegistros:  { $sum: 1 },
        finalizados:     { $sum: { $cond: [{ $eq: ["$estado", "Finalizado"] }, 1, 0] } },
        enProceso:       { $sum: { $cond: [{ $eq: ["$estado", "En progreso"] }, 1, 0] } },
        ingresos:        {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$estado", "Finalizado"] }, { $ne: ["$tipo", "Garantía"] }] },
              "$gananciaTotal",
              0,
            ],
          },
        },
      },
    },
  ]);

  const stats = statsAgg
    ? { totalRegistros: statsAgg.totalRegistros, finalizados: statsAgg.finalizados, enProceso: statsAgg.enProceso, ingresos: statsAgg.ingresos }
    : { totalRegistros: 0, finalizados: 0, enProceso: 0, ingresos: 0 };

  return { data, total, page: Number(page), limit: Number(limit), stats };
};

// ─── GET uno ──────────────────────────────────────────────────────────────────
const getMantenimientoById = async ({ id, companiaId }) => {
  return await Mecanica.findOne({ _id: id, companiaId });
};

// ─── CREAR — recibe los datos ya resueltos desde el controlador ───────────────
const crearMantenimiento = async ({ companiaId, datos }) => {
  const { costoCliente, gananciaTotal } = calcularTotales(
    datos.servicios,
    datos.productos
  );

  // Filtrar items vacíos antes de guardar
  const serviciosLimpios = (datos.servicios || []).filter(s => s.nombre && s.nombre.trim());
  const productosLimpios  = (datos.productos  || []).filter(p => p.nombre && p.nombre.trim());

  // Recalcular con items limpios
  const totalesLimpios = calcularTotales(serviciosLimpios, productosLimpios);

  return await Mecanica.create({
    companiaId,
    cedula:               datos.cedula,
    placa:                (datos.placa || "").toUpperCase(),
    vehiculo:             datos.vehiculo,
    tipo:                 datos.tipo        || "Preventivo",
    descripcion:          datos.descripcion,
    kilometraje:          Number(datos.kilometraje) || 0,
    fecha:                datos.fecha       || new Date(),
    estado:               datos.estado      || "Pendiente",
    taller:               datos.taller      || "",
    clienteId:            datos.clienteId            || null,
    nombreCliente:        datos.nombreCliente         || "",
    emailCliente:         datos.emailCliente          || "",
    telefonoCliente:      datos.telefonoCliente        || "",
    ciudadCliente:        datos.ciudadCliente          || "",
    tipoDocumentoCliente: datos.tipoDocumentoCliente   || "CC",
    servicios:  serviciosLimpios,
    productos:  productosLimpios,
    abonos:     (datos.abonos || []).filter(a => Number(a.monto) > 0).map(a => ({ monto: Number(a.monto), nota: a.nota || '', fecha: a.fecha || new Date() })),
    costoCliente:  totalesLimpios.costoCliente,
    gananciaTotal: totalesLimpios.gananciaTotal,
  });
};

// ─── ACTUALIZAR ───────────────────────────────────────────────────────────────
const actualizarMantenimiento = async ({ id, companiaId, datos }) => {
  const actual = await Mecanica.findOne({ _id: id, companiaId });
  if (!actual) return null;

  const servicios = (datos.servicios ?? actual.servicios).filter(s => s.nombre && s.nombre.trim());
  const productos  = (datos.productos  ?? actual.productos ).filter(p => p.nombre && p.nombre.trim());
  const abonos     = (datos.abonos     ?? actual.abonos    ).filter(a => Number(a.monto) > 0).map(a => ({ monto: Number(a.monto), nota: a.nota || '', fecha: a.fecha || new Date() }));
  const { costoCliente, gananciaTotal } = calcularTotales(servicios, productos);
  datos.servicios = servicios;
  datos.productos  = productos;
  datos.abonos     = abonos;

  if (datos.placa) datos.placa = datos.placa.toUpperCase();

  return await Mecanica.findOneAndUpdate(
    { _id: id, companiaId },
    { $set: { ...datos, costoCliente, gananciaTotal } },
    { new: true, runValidators: true }
  );
};

// ─── ELIMINAR ─────────────────────────────────────────────────────────────────
const eliminarMantenimiento = async ({ id, companiaId }) => {
  return await Mecanica.findOneAndDelete({ _id: id, companiaId });
};

// ─── FINALIZAR ────────────────────────────────────────────────────────────────
// Solo responsabilidad: crear Movimiento + marcar Finalizado
// La factura la gestiona el módulo de Facturación
const finalizarMantenimiento = async ({ id, companiaId }) => {
  const mecanica = await Mecanica.findOne({ _id: id, companiaId });

  if (!mecanica) {
    const err = new Error("Mantenimiento no encontrado");
    err.code = "NOT_FOUND"; throw err;
  }
  if (mecanica.estado === "Finalizado") {
    const err = new Error("El mantenimiento ya está finalizado");
    err.code = "YA_FINALIZADO"; throw err;
  }

  // Validar que el total abonado cubra el costo al cliente
  if (mecanica.costoCliente > 0) {
    const totalAbonado = (mecanica.abonos || []).reduce((s, a) => s + (Number(a.monto) || 0), 0);
    if (totalAbonado < mecanica.costoCliente) {
      const err = new Error(`El cliente aún debe $${(mecanica.costoCliente - totalAbonado).toLocaleString('es-CO')}. Registra el pago completo antes de finalizar.`);
      err.code = "PAGO_INCOMPLETO"; throw err;
    }
  }

  const esGarantia = mecanica.tipo === "Garantía";

  const movimiento = await MovimientoService.createMovimiento({
    companiaId,
    tipo_movimiento: esGarantia ? "egreso" : "ingreso",
    modulo:          "mecanica",
    tipo:            mecanica.tipo,
    descripcion:     `${mecanica.vehiculo} (${mecanica.placa}) — ${mecanica.descripcion}`,
    valor:           esGarantia ? mecanica.costoCliente : mecanica.gananciaTotal,
    ganancia:        esGarantia ? mecanica.costoCliente : mecanica.gananciaTotal,
    fecha:           new Date(),
    nombre:          mecanica.nombreCliente || mecanica.cedula,
    referenciaId:    mecanica._id,
  });

  const actualizado = await Mecanica.findByIdAndUpdate(
    id,
    { $set: { estado: "Finalizado", movimientoId: movimiento._id } },
    { new: true }
  );

  return { mecanica: actualizado, movimiento };
};

module.exports = {
  getMantenimientos,
  getMantenimientoById,
  crearMantenimiento,
  actualizarMantenimiento,
  eliminarMantenimiento,
  finalizarMantenimiento,
};