const  User = require('../../models/user');

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        // Validar que se reciban todos los datos necesarios
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Ingresa los datos completos' });
        }

        // Actualizar el usuario en la base de datos
        const updatedUser = await User.findByIdAndUpdate(id, { name, email, password }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({ msg: 'Usuario actualizado', user: updatedUser });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el usuario' });
    }
};