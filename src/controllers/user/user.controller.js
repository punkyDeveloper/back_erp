const {registrar, getUsers } = require('./user');
const argon2 = require('argon2');

// Crear un nuevo usuario

exports.createUser = async (req, res) => {
    try {
        const { name, email, rol_id, user,apellido, compania  } = req.body;


        // Validar que se reciban todos los datos necesarios
        if (!name || !email || !rol_id || !user || !apellido || !compania) {
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

        // incriptar la contraseña con Argon2id
        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
        // Crear un nuevo usuario
        await registrar({ name, email, rol_id, user, apellido, compania, hashedPassword });

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

        await actualizar(id, { name, email, rol_id, user, apellido, compania, estado, hashedPassword });


    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el usuario' });
    }
}