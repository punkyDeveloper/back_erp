const Role = require("../../moduls/rol");

// Crear un rol
exports.role = (req, res) => {
  try {
    const { rol, descripcion, permisos } = req.body;
    if (!rol || !descripcion || !permisos) {
      return res.status(400).json({ msg: "Ingresa los datos completos" });
    }
    const newRole = new Role({
      rol,
      descripcion,
      permisos,
    });
    newRole.save();
    res.json({ msg: "Rol creado" });
  } catch (error) {
    console.log(Error)
  }
};

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.log(Error)
  }
};

