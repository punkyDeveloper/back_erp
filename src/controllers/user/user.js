const User = require('../../moduls/user');

// Crear un nuevo usuario

function createUser({ name, email, rol_id, user, apellido, password }) {
    try {
        // Crear un nuevo usuario
        const newUser = new User({
            nombre: name,
            email,
            password,
            rol: rol_id,
            user,
            apellido,
            estado: true
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

exports.registrar = createUser;