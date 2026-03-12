const Cliente = require("../../moduls/cliente");

// ─── Obtener todos los clientes ──────────────────────────────────────────────
const getClientes = async ({ empresa, activo, buscar }) => {
  const filtro = { empresa };

  if (activo !== undefined) {
    filtro.activo = activo === "true";
  }

  if (buscar) {
    const regex = new RegExp(buscar, "i");
    filtro.$or = [
      { nombre:          regex },
      { numeroDocumento: regex },
      { email:           regex },
    ];
  }

  return await Cliente.find(filtro).sort({ createdAt: -1 });
};

// ─── Obtener un cliente por ID ───────────────────────────────────────────────
const getClienteById = async ({ id, empresa }) => {
  return await Cliente.findOne({ _id: id, empresa });
};

// ─── Crear cliente ───────────────────────────────────────────────────────────
const createCliente = async ({ empresa, datos }) => {
  const existe = await Cliente.findOne({ empresa, numeroDocumento: datos.numeroDocumento });
  if (existe) {
    const error = new Error(`Ya existe un cliente con el documento ${datos.numeroDocumento}`);
    error.code = "DUPLICADO";
    throw error;
  }

  // Normalizar permiso: true → "ver_web", false/cualquier otra cosa → ""
  const permisoNormalizado = datos.permiso === true || datos.permiso === "ver_web"
    ? "ver_web"
    : "";

  const cliente = new Cliente({ empresa, ...datos, permiso: permisoNormalizado });
  await cliente.save();
  return cliente;
};

// ─── Actualizar cliente ──────────────────────────────────────────────────────
const updateCliente = async ({ id, empresa, datos }) => {
  if (datos.numeroDocumento) {
    const duplicado = await Cliente.findOne({
      empresa,
      numeroDocumento: datos.numeroDocumento,
      _id: { $ne: id },
    });
    if (duplicado) {
      const error = new Error(`El documento ${datos.numeroDocumento} ya pertenece a otro cliente`);
      error.code = "DUPLICADO";
      throw error;
    }
  }

  // Normalizar permiso si viene en el body
  if (datos.permiso !== undefined) {
    datos.permiso = datos.permiso === true || datos.permiso === "ver_web"
      ? "ver_web"
      : "";
  }

  return await Cliente.findOneAndUpdate(
    { _id: id, empresa },
    { $set: datos },
    { new: true, runValidators: true }
  );
};

// ─── Eliminar cliente ────────────────────────────────────────────────────────
const deleteCliente = async ({ id, empresa }) => {
  return await Cliente.findOneAndDelete({ _id: id, empresa });
};

// ─── Actualizar solo permiso (acceso web) ────────────────────────────────────
const updatePermiso = async ({ id, empresa, permiso }) => {
  const permisoNormalizado = permiso === true ? "ver_web" : "";

  return await Cliente.findOneAndUpdate(
    { _id: id, empresa },
    { $set: { permiso: permisoNormalizado } },
    { new: true }
  );
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  updatePermiso,
};