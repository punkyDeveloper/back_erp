const { createUser, getUsers, updateUser, getAdministradores } = require('./user');
const argon2 = require('argon2');

/**
 * Crear un nuevo usuario
 */
exports.createUser = async (req, res) => {
  try {

      const { name, email, rol_id, user, apellido, compania } = req.body;
  
      // Validar que se reciban todos los datos necesarios
      if (!name || !email || !rol_id || !user || !apellido || !compania) {
        return res.status(400).json({ msg: 'Ingresa los datos completos' });
      }
      // validar que no exista el email en la db
      const existingUsers = await getUsers();
      const emailExists = existingUsers.some(u => u.email === email);
      if (emailExists) {
        console.log('El correo ya está en uso:', email);
        return res.status(400).json({ msg: 'El correo ya está en uso' });
      }

  
      // Crear contraseña aleatoria
      function generateRandomPassword(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          password += characters[randomIndex];
        }
        return password;
      }
      
      const password = generateRandomPassword(8);
  
      // Encriptar la contraseña con Argon2id
      const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
  
      // Crear el usuario y enviar el correo
      await createUser({ 
        name, 
        email, 
        rol_id, 
        user, 
        apellido, 
        compania, 
        hashedPassword,
        passwordPlain: password // Pasar la contraseña en texto plano para el correo
      });
  
      res.send({ 
        msg: 'Usuario creado y correo enviado', 
        password, 
        email 
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear el usuario' });
  }
};
// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await getUsers();

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los usuarios' });
    }
}

// update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, rol_id, user, apellido, compania, estado, password } = req.body;

        // encriptar la contraseña con Argon2id si se proporciona
        let hashedPassword;
        if (password) {
            hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
        }

        await updateUser(id, { name, email, rol_id, user, apellido, compania, estado, hashedPassword });

        res.json({ msg: 'Usuario actualizado' });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el usuario' });
    }
}
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteUser(id);

        res.json({ msg: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar el usuario' });
    }
}

// solo ver administradores
exports.getAdministradores = async (req, res) => {
    try {
        const users = await getAdministradores();

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los administradores' });
    }
}