const Permiso = require('../../moduls/permission');

// Crear un permiso
exports.permiso = async (req, res) => {
  try {
    const { nombre, modulo, descripcion, accion } = req.body;

    if (!nombre || !modulo || !descripcion || !accion) {
      return res.status(400).json({ msg: 'Ingresa los datos completos' });
    }

    const newPermiso = new Permiso({
      nombre,
      modulo,
      descripcion,
      accion,
    });

    await newPermiso.save();
    res.json({ msg: 'Permiso creado' });
  } catch (error) {
    console.error('[permiso]', error);
    // No exponer detalles internos del error al cliente
    res.status(500).json({ msg: 'Error al crear el permiso' });
  }
};
// Obtener todos los permisos
exports.getPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.find();
    res.json(permisos);
  } catch (error) {
    console.error('[getPermisos]', error);
    res.status(500).json({ msg: 'Error al obtener los permisos' });
  }
};
// Obtener todos permiso por el nombre
exports.getPermisoByName = async (req, res) => {
  try {
    const permiso = await Permiso.find({}, { nombre: 1, _id: 0 });
    res.json(permiso);
  } catch (error) {
    console.error('[getPermisoByName]', error);
    res.status(500).json({ msg: 'Error al obtener los permisos' });
  }
};
