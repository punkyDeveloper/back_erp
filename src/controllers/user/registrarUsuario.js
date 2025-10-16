const User = require('../../moduls/user');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
        const { name, email, rol_id, user,apellido, compania } = req.body;
    
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
        const password2 = await argon2.hash(password, { type: argon2.argon2id });

        console.log(password2);

    

        // Crear un nuevo usuario
        const newUser = new User({
        nombre :name,
        email,
        password: password2,
        rol : rol_id,
        user,
        apellido,
        estado: true,
        compania
        });
    
        // Guardar el usuario en la base de datos
        await newUser.save();
    
        res.send({ msg: 'Usuario creado',password,email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear el usuario' });
    }
    }
    