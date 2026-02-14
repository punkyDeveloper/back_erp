const Role = require("../../moduls/rol");

// Crear un rol
exports.roleCreate = async (req, res) => {
  try {
    const { rol, descripcion, permisos } = req.body;  // Cambiar describe por descripcion
   
    console.log('Body recibido:', req.body);
    
    if (!rol || !descripcion || !permisos || !Array.isArray(permisos)) {
      return res.status(400).json({ msg: "Ingresa los datos completos" });
    }

    const newRole = new Role({
      rol,
      descripcion,
      permisos,                
    });
    
    await newRole.save();  // Agregar await
    
    res.json({ msg: "Rol creado exitosamente", role: newRole });
    
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ msg: "Error al crear rol: " + error.message });
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

// Actualizar un rol

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, descripcion, permisos } = req.body;

    console.log('Datos recibidos para actualizar rol:', { id, rol, descripcion, permisos });
    // Validaciones
    if (
      !rol ||
      !descripcion ||
      !Array.isArray(permisos) ||
      permisos.length === 0
    ) {
      return res.status(400).json({
        msg: "Ingresa los datos completos"
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        rol,
        descripcion,
        permisos
      },
      { new: true }
    );

    if (!updatedRole) {
      return res.status(404).json({
        msg: "Rol no encontrado"
      });
    }

    return res.json({
      msg: "Rol actualizado correctamente",
      role: updatedRole
    });

  } catch (error) {
    console.error("updateRole error:", error);
    return res.status(500).json({
      msg: "Error interno del servidor"
    });
  }
};