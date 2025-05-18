const User = require('../../moduls/user');

// Crear un nuevo usuario

exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
    
        // Validar que se reciban todos los datos necesarios
        if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Ingresa los datos completos' });
        }
    
        // Crear un nuevo usuario
        const newUser = new User({
        name,
        email,
        password,
        });
    
        // Guardar el usuario en la base de datos
        await newUser.save();
    
        res.json({ msg: 'Usuario creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear el usuario' });
    }
    }