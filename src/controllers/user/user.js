const User = require('../../moduls/user');
const { enviarCredenciales } = require('../../middleware/email');

require('dotenv').config();

/**
 * Crear un nuevo usuario
 */
async function createUser({ name, email, rol_id, user, apellido, compania, hashedPassword, passwordPlain }) {
  try {
    
    // Crear un nuevo usuario
    const newUser = new User({
      nombre: name,
      email,
      password: hashedPassword,
      rol: rol_id,
      user,
      apellido,
      estado: true,
      compania
    });

    // Guardar el usuario en la base de datos
    const savedUser = await newUser.save();

    // Enviar correo con las credenciales (solo si se proporciona la contraseña en texto plano)
    if (passwordPlain) {
      try {
        await enviarCredenciales({
          email: savedUser.email,
          nombre: savedUser.nombre,
          apellido: savedUser.apellido,
          usuario: savedUser.user,
          password: passwordPlain
        });
        // no envia correo aun 
        console.log('✅ Correo de credenciales enviado a:', email);
      } catch (emailError) {
        console.error('⚠️ Usuario creado pero no se pudo enviar el correo:', emailError);
        // No lanzar error aquí para que no falle la creación del usuario
      }
    }

    return savedUser;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw new Error('Error interno del servidor');
  }
}


// Obtener todos los usuarios

async function getUsers() {
    try {
        const users = await User.find({}, {
            _id: 1,
            nombre: 1,
            apellido: 1,
            user: 1,
            estado: 1,
            rol: 1,
            email: 1,
            createdAt: 1,
            compania: 1
        });
        return users;
    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener los usuarios');
    }
} 


async function updateUser(id, { name, email, rol_id, user, apellido, compania, estado, hashedPassword }) {
  try {
    const updateData = {};
    if (name) updateData.nombre = name;
    if (email) updateData.email = email;
    if (rol_id) updateData.rol = rol_id;
    if (user) updateData.user = user;
    if (apellido) updateData.apellido = apellido;
    if (compania) updateData.compania = compania;
    if (estado !== undefined) updateData.estado = estado;
    if (hashedPassword) updateData.password = hashedPassword;

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { $set: updateData },
      {
        new: true,
        runValidators: false
      }
    );

    return updatedUser;
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw error;
  }
}
async function deleteUser(id) {
    try {
        await User.findByIdAndDelete(id);
        
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        throw error;
    }
}
// solo administradores ver

async  function getAdministradores() {
    try {
        const admins = await User.find({ rol: 'Administrador' }, {
            _id: 1,
            nombre: 1,
            apellido: 1,
            user: 1,
            estado: 1,
            rol: 1,
            email: 1,
            createdAt: 1,
            compania: 1
        });
        return admins;
    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener los administradores');
    }
}

// Controladores para las rutas
module.exports = {
    createUser,
    updateUser,
    getUsers,
    deleteUser,
    getAdministradores
};