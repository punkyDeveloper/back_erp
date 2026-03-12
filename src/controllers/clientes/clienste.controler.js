const ClientesService = require("./cliente");

// ─── GET /v1/clientes ────────────────────────────────────────────────────────
const getClientes = async (req, res) => {
  try {
    const empresa = req.user.compania || req.user.empresa;
    const { activo, buscar } = req.query;

    const clientes = await ClientesService.getClientes({ empresa, activo, buscar });

    return res.json({ ok: true, data: clientes });
  } catch (error) {
    console.error("[getClientes]", error);
    return res.status(500).json({ ok: false, msg: "Error al obtener clientes" });
  }
};

// ─── GET /v1/clientes/:id ────────────────────────────────────────────────────
const getClienteById = async (req, res) => {
  try {
    const empresa = req.user.compania || req.user.empresa;
    const { id } = req.params;

    const cliente = await ClientesService.getClienteById({ id, empresa });

    if (!cliente) {
      return res.status(404).json({ ok: false, msg: "Cliente no encontrado" });
    }

    return res.json({ ok: true, data: cliente });
  } catch (error) {
    console.error("[getClienteById]", error);
    return res.status(500).json({ ok: false, msg: "Error al obtener el cliente" });
  }
};

// ─── POST /v1/clientes ───────────────────────────────────────────────────────
const createCliente = async (req, res) => {
  try {
    const empresa = req.user.compania || req.user.empresa;

    const cliente = await ClientesService.createCliente({ empresa, datos: req.body });

    return res.status(201).json({ ok: true, data: cliente });
  } catch (error) {
    console.error("[createCliente]", error);
    if (error.code === "DUPLICADO") {
      return res.status(400).json({ ok: false, msg: error.message });
    }
    return res.status(500).json({ ok: false, msg: "Error al crear el cliente" });
  }
};

// ─── PUT /v1/clientes/:id ────────────────────────────────────────────────────
const updateCliente = async (req, res) => {
  try {
    const empresa = req.user.compania || req.user.empresa;
    const { id } = req.params;

    const cliente = await ClientesService.updateCliente({ id, empresa, datos: req.body });

    if (!cliente) {
      return res.status(404).json({ ok: false, msg: "Cliente no encontrado" });
    }

    return res.json({ ok: true, data: cliente });
  } catch (error) {
    console.error("[updateCliente]", error);
    if (error.code === "DUPLICADO") {
      return res.status(400).json({ ok: false, msg: error.message });
    }
    return res.status(500).json({ ok: false, msg: "Error al actualizar el cliente" });
  }
};

// ─── DELETE /v1/clientes/:id ─────────────────────────────────────────────────
const deleteCliente = async (req, res) => {
  try {
    const empresa = req.user.compania || req.user.empresa;
    const { id } = req.params;

    const cliente = await ClientesService.deleteCliente({ id, empresa });

    if (!cliente) {
      return res.status(404).json({ ok: false, msg: "Cliente no encontrado" });
    }

    return res.json({ ok: true, msg: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("[deleteCliente]", error);
    return res.status(500).json({ ok: false, msg: "Error al eliminar el cliente" });
  }
};

// ─── PATCH /v1/clientes/:id/permiso ──────────────────────────────────────────
const updatePermiso = async (req, res) => {
  try {
    const empresa = req.user.compania || req.user.empresa;
    const { id } = req.params;
    const { permiso } = req.body;

    // Acepta boolean o string "ver_web"/""
    const permisoBoolean = permiso === true || permiso === "ver_web";

    const cliente = await ClientesService.updatePermiso({ id, empresa, permiso: permisoBoolean });

    if (!cliente) {
      return res.status(404).json({ ok: false, msg: "Cliente no encontrado" });
    }

    return res.json({ ok: true, data: cliente });
  } catch (error) {
    console.error("[updatePermiso]", error);
    return res.status(500).json({ ok: false, msg: "Error al actualizar el permiso" });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  updatePermiso,
};