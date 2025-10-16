const User = require('../../moduls/user');

require('dotenv').config();

// Crear un nuevo usuario

function createUser({ name, email, rol_id, user, apellido, compania, hashedPassword }) {
    try {
        // Crear un nuevo usuario

console.log(name, email, rol_id, user, apellido, compania,hashedPassword);

        const newUser = new User({
            nombre: name,
            email,
            password:hashedPassword,
            rol: rol_id,
            user,
            apellido,
            estado: true,
            compania
        });

        // Guardar el usuario en la base de datos
        return newUser.save();
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw new Error('Error interno del servidor');
    }
}


// Obtener todos los usuarios
exports.getUsers = async (req, res) => {    
    try {
        const users = await User.find({}, {
            _id: 0,
            nombre: 1,
            apellido: 1,
            user: 1,
            estado: 1,
            rol: 1,
            email: 1,
            createdAt: 1
        });
        return users;
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los usuarios' });
    }
}
// actualizar usuario

exports.actualizar = async (id, { name, email, rol_id, user, apellido, compania, estado, hashedPassword }) => {
    try {
        // 1️⃣ Validar el email exista 
        const emailExistente = await User.findOne({ email });
        if (emailExistente) {
            throw new Error('El correo electrónico no existe');
        }

        // 2️⃣ Buscar el usuario
        const usuarioExistente = await User.findById(id);
        if (!usuarioExistente) {
            throw new Error('Usuario no encontrado');
        }

        // 3️⃣ Validar campos obligatorios
        if (!name || !email || !rol_id || !user) {
            throw new Error('Faltan campos obligatorios (nombre, email, rol o usuario)');
        }

        // 4️⃣ Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Formato de correo electrónico no válido');
        }

        // 5️⃣ Validar duplicidad de email (si cambia)
        const emailEnUso = await User.findOne({ email, _id: { $ne: id } });
        if (emailEnUso) {
            throw new Error('El correo electrónico ya está en uso por otro usuario');
        }

        // 6️⃣ Construir datos de actualización
        const updateData = {
            nombre: name,
            email,
            rol: rol_id,
            user,
            apellido: apellido || usuarioExistente.apellido,
            compania: compania || usuarioExistente.compania,
            estado: estado !== undefined ? estado : usuarioExistente.estado,
            updatedAt: new Date()
        };

        // 7️⃣ Si se proporciona nueva contraseña
        if (hashedPassword) {
            updateData.password = hashedPassword;
        }

        // 8️⃣ Ejecutar actualización
        const resultado = await User.updateOne({ _id: id }, { $set: updateData });

        if (resultado.matchedCount === 0) {
            throw new Error('No se pudo actualizar el usuario');
        }

        return { mensaje: 'Usuario actualizado correctamente' };

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw new Error(error.message || 'Error interno del servidor');
    }
};

exports.registrar = createUser;