const User = require('../../moduls/user');

// Crear un nuevo usuario

// exports.createUser2 = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
    
//         // Validar que se reciban todos los datos necesarios
//         if (!name || !email || !password) {
//         return res.status(400).json({ msg: 'Ingresa los datos completos' });
//         }
    
//         // Crear un nuevo usuario
//         const newUser = new User({
//         name,
//         email,
//         password,
//         });
    
//         // Guardar el usuario en la base de datos
//         await newUser.save();
    
//         res.json({ msg: 'Usuario creado' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: 'Error al crear el usuario' });
//     }
// }

// // Obtener todos los usuarios
// exports.getUsers = async (req, res) => {    
//     try {
//         const users = await User.find({},{_id:0, __v:0, password:0});

//         res.json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: 'Error al obtener los usuarios' });
//     }
// }


async function registrar({ nombre :name,email,password,rol : rol_id,user,apellido,estado,companiaId}) {

    try {
        // Crear un nuevo usuario
        const newUser = new User({
            nombre: name,
            email,
            password,
            rol: rol_id,
            user,
            apellido,
            estado,
            compania: companiaId
        });

        // Guardar el usuario en la base de datos
        await newUser.save();

        return { msg: 'Usuario creado', password, email };
    } catch (error) {
        console.error(error);
        throw new Error('Error al crear el usuario');
    }
} 

// traer los usuarios
async function getUsers() {
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
        throw new Error('Error al obtener los usuarios');
    }
}

module.exports = { registrar , getUsers };
