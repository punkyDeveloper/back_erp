const Permiso = require('../../moduls/permission');
j
// Crear un permiso
exports.permiso = (req, res) => {
  try {
    const { nombre, descripcion, acciones } = req.body;
    if (!nombre || !descripcion || !acciones) {
      return res.status(400).json({ msg: 'Ingresa los datos completos' });
    }
    const newPermiso = new Permiso({
      nombre,
      descripcion,
      acciones,
    });
    newPermiso.save();
    res.json({ msg: 'Permiso creado' });
  } catch (error) {
    console.log(error);
  }
};