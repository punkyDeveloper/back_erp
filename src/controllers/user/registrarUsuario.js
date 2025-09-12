const User = require('../../moduls/user');


// Crear un nuevo usuario
// exports.createUser = async (req, res) => {
//     try {
//         const { name, email, rol_id, user,apellido } = req.body;
    
//         // Validar que se reciban todos los datos necesarios
//         if (!name || !email || !rol_id || !user || !apellido) {
//             // Si falta algún dato, devolver un error
//         return res.status(400).json({ msg: 'Ingresa los datos completos back' });
//         }
//         // Crear contraseña aleatoria
// function generateRandomPassword(length) {
//             const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//             let password = '';
//             for (let i = 0; i < length; i++) {
//                 const randomIndex = Math.floor(Math.random() * characters.length);
//                 password += characters[randomIndex];
//             }
//             return password;
//         }
//         const password = generateRandomPassword(8);

    
//         // Crear un nuevo usuario
//         const newUser = new User({
//         nombre :name,
//         email,
//         password,
//         rol : rol_id,
//         user,
//         apellido
//         });
    
//         // Guardar el usuario en la base de datos
//         await newUser.save();
    
//         res.send({ msg: 'Usuario creado',password,email });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: 'Error al crear el usuario' });
//     }
//     }
    
async function registrar({ nombre :name,email,password,rol : rol_id,user,apellido}) {

    try {
        // Crear un nuevo usuario
        const newUser = new User({
            nombre: name,
            email,
            password,
            rol: rol_id,
            user,
            apellido
        });

        // Guardar el usuario en la base de datos
        return newUser.save();

    } catch (error) {
        console.error(error);
        throw new Error('Error al crear el usuario');
    }


    
}
module.exports = {
    registrar
};