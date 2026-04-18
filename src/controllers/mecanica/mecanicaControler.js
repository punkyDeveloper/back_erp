const MecanicaService  = require("./mecanica");
const ClienteService   = require("../clientes/cliente");          // getClientes, createCliente
const { getServicios } = require("../servicios/sercios");         // catálogo de servicios

// ─── Helper: resolver cliente ─────────────────────────────────────────────────
// Busca el cliente por cédula. Si no existe y vienen datos, lo crea.
// Devuelve { clienteId, snapshot } para guardar en el mantenimiento.
const resolverCliente = async ({ empresa, cedula, datos }) => {
  const snapshot = {
    clienteId:            null,
    nombreCliente:        datos.nombreCliente        || "",
    emailCliente:         datos.emailCliente         || "",
    telefonoCliente:      datos.telefonoCliente       || "",
    ciudadCliente:        datos.ciudadCliente         || "",
    tipoDocumentoCliente: datos.tipoDocumentoCliente  || "CC",
  };

  // 1. Buscar por número de documento exacto
  const lista = await ClienteService.getClientes({ empresa, buscar: cedula });
  const encontrado = lista.find((c) => c.numeroDocumento === cedula);

  if (encontrado) {
    // Cliente existe → usar sus datos
    snapshot.clienteId            = encontrado._id;
    snapshot.nombreCliente        = encontrado.nombre;
    snapshot.emailCliente         = encontrado.email;
    snapshot.telefonoCliente      = encontrado.telefono || encontrado.celular || "";
    snapshot.ciudadCliente        = encontrado.ciudad   || "";
    snapshot.tipoDocumentoCliente = encontrado.tipoDocumento || "CC";
    return snapshot;
  }

  // 2. No existe — si vienen datos suficientes, crearlo
  if (datos.nombreCliente && datos.nombreCliente.trim().length > 1) {
    try {
      const nuevo = await ClienteService.createCliente({
        empresa,
        datos: {
          nombre:          datos.nombreCliente.trim(),
          tipoDocumento:   datos.tipoDocumentoCliente || "CC",
          numeroDocumento: cedula,
          email:           datos.emailCliente    || "sin@email.com",
          telefono:        datos.telefonoCliente || "",
          ciudad:          datos.ciudadCliente   || "",
          activo:          true,
        },
      });
      snapshot.clienteId = nuevo._id;
    } catch (e) {
      // Si falla (ej: duplicado por race condition), continuar sin clienteId
      console.warn("[resolverCliente] No se pudo crear cliente:", e.message);
    }
  }

  return snapshot;
};

// ─── Helper: filtra servicios con precio > 1 del objeto retornado ─────────────
const filtrarServiciosSinPrecio = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.servicios = (obj.servicios || []).filter(s => (s.precio || 0) > 1);
  return obj;
};

// ─── GET /v1/mecanica ─────────────────────────────────────────────────────────
const getMantenimientos = async (req, res) => {
  try {
    const companiaId = req.user.compania || req.user.empresa;
    const { estado, page, limit } = req.query;
    const resultado = await MecanicaService.getMantenimientos({ companiaId, estado, page, limit });
    resultado.data = resultado.data.map(filtrarServiciosSinPrecio);
    return res.json({ ok: true, ...resultado });
  } catch (e) {
    console.error("[getMantenimientos]", e);
    return res.status(500).json({ ok: false, msg: "Error al obtener mantenimientos" });
  }
};

// ─── GET /v1/mecanica/detalle/:id ─────────────────────────────────────────────
const getMantenimientoById = async (req, res) => {
  try {
    const companiaId = req.user.compania || req.user.empresa;
    const item = await MecanicaService.getMantenimientoById({ id: req.params.id, companiaId });
    if (!item) return res.status(404).json({ ok: false, msg: "Mantenimiento no encontrado" });
    return res.json({ ok: true, data: filtrarServiciosSinPrecio(item) });
  } catch (e) {
    console.error("[getMantenimientoById]", e);
    return res.status(500).json({ ok: false, msg: "Error al obtener el mantenimiento" });
  }
};

// ─── POST /v1/mecanica ────────────────────────────────────────────────────────
const crearMantenimiento = async (req, res) => {
  try {
    const companiaId = req.user.compania || req.user.empresa;

    // 1. Resolver / crear cliente
    const clienteSnap = await resolverCliente({
      empresa: companiaId,
      cedula:  req.body.cedula,
      datos:   req.body,
    });

    // 2. Crear el mantenimiento con el snapshot del cliente
    const item = await MecanicaService.crearMantenimiento({
      companiaId,
      datos: { ...req.body, ...clienteSnap },
    });

    return res.status(201).json({ ok: true, data: item });
  } catch (e) {
    console.error("[crearMantenimiento]", e);
    return res.status(500).json({ ok: false, msg: "Error al crear el mantenimiento" });
  }
};

// ─── PUT /v1/mecanica/:id ─────────────────────────────────────────────────────
const actualizarMantenimiento = async (req, res) => {
  try {
    const companiaId = req.user.compania || req.user.empresa;

    // Si cambia la cédula, re-resolver cliente
    let datosExtra = {};
    if (req.body.cedula) {
      datosExtra = await resolverCliente({
        empresa: companiaId,
        cedula:  req.body.cedula,
        datos:   req.body,
      });
    }

    const item = await MecanicaService.actualizarMantenimiento({
      id:          req.params.id,
      companiaId,
      datos:       { ...req.body, ...datosExtra },
    });

    if (!item) return res.status(404).json({ ok: false, msg: "Mantenimiento no encontrado" });
    return res.json({ ok: true, data: item });
  } catch (e) {
    console.error("[actualizarMantenimiento]", e);
    return res.status(500).json({ ok: false, msg: "Error al actualizar el mantenimiento" });
  }
};

// ─── DELETE /v1/mecanica/:id ──────────────────────────────────────────────────
const eliminarMantenimiento = async (req, res) => {
  try {
    const companiaId = req.user.compania || req.user.empresa;
    const item = await MecanicaService.eliminarMantenimiento({ id: req.params.id, companiaId });
    if (!item) return res.status(404).json({ ok: false, msg: "Mantenimiento no encontrado" });
    return res.json({ ok: true, msg: "Mantenimiento eliminado" });
  } catch (e) {
    console.error("[eliminarMantenimiento]", e);
    return res.status(500).json({ ok: false, msg: "Error al eliminar el mantenimiento" });
  }
};

// ─── PATCH /v1/mecanica/:id/finalizar ────────────────────────────────────────
const finalizarMantenimiento = async (req, res) => {
  try {
    const companiaId = req.user.compania || req.user.empresa;
    const resultado  = await MecanicaService.finalizarMantenimiento({ id: req.params.id, companiaId });
    return res.json({ ok: true, data: resultado.mecanica, movimiento: resultado.movimiento });
  } catch (e) {
    console.error("[finalizarMantenimiento]", e);
    if (e.code === "NOT_FOUND")      return res.status(404).json({ ok: false, msg: e.message });
    if (e.code === "YA_FINALIZADO")  return res.status(400).json({ ok: false, msg: e.message });
    if (e.code === "PAGO_INCOMPLETO") return res.status(400).json({ ok: false, msg: e.message });
    return res.status(500).json({ ok: false, msg: "Error al finalizar el mantenimiento" });
  }
};

// ─── GET /v1/mecanica/catalogo ────────────────────────────────────────────────
// Reutiliza getServicios del módulo de categorías — sin duplicar código
const getCatalogo = async (req, res) => {
  try {
    const data = await getServicios(req.user, true);
    return res.json({ ok: true, data });
  } catch (e) {
    console.error("[getCatalogo]", e);
    return res.status(500).json({ ok: false, msg: "Error al obtener el catálogo" });
  }
};

module.exports = {
  getMantenimientos,
  getMantenimientoById,
  crearMantenimiento,
  actualizarMantenimiento,
  eliminarMantenimiento,
  finalizarMantenimiento,
  getCatalogo,
};