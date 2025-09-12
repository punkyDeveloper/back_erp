const Role = require("../../moduls/rol");

// Crear un rol
exports.roleCreate = (req, res) => {

  try {
    const { rol, describe, permisos } = req.body;
   
    console.log(req.body);
    if (!rol || !describe || !permisos) {
      return res.status(400).json({ msg: "Ingresa los datos completos" });
    }
    const newRole = new Role({
      rol,
      descripcion: describe, 
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
    res.json({ msg: "Error al obtener los roles" });
    console.log(Error)
  }
};


