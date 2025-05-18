const Permiso = require('../../moduls/permission');

// Crear un permiso
exports.permiso = (req, res) => {
  try {
    const { nombre, descripcion, accion } = req.body;
    if (!nombre || !descripcion || !accion) {
      return res.status(400).json({ msg: 'Ingresa los datos completos' });
    }
    const newPermiso = new Permiso({
      nombre,
      descripcion,
      accion,
    });
    newPermiso.save();
    res.json({ msg: 'Permiso creado' });
  } catch (error) {
    console.log(error);
  }
};

// Obtener todos los permisos
exports.getPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.find();
    res.json(permisos);
  } catch (error) {
    console.log(error);
  }
};
// Obtener todos permiso por el nombre
exports.getPermisoByName = async (req, res) => {
try {

  const permiso = await Permiso.find({},{nombre:1,_id:0});

  res.json(permiso);
  
} catch (error) {
  console.log(error);
}
};
