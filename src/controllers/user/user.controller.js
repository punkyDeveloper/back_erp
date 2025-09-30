const {registrar, getUsers } = require('./user');
// Crear un nuevo usuario

exports.createUser = async (req, res) => {
    try {
        const { name, email, rol_id, user, apellido } = req.body;

        // Validar que se reciban todos los datos necesarios
        if (!name || !email || !rol_id || !user || !apellido) {
            // Si falta algún dato, devolver un error
            return res.status(400).json({ msg: 'Ingresa los datos completos back' });
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

        // Crear un nuevo usuario
        await registrar({ nombre: name, email, password, rol: rol_id, user, apellido,estado:true });

        // Guardar el usuario en la base de datos});

        res.send({ msg: 'Usuario creado', password, email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear el usuario' });
    }
}

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