const Oganizacion = require("../../moduls/comapny");
// const Company = require("../../moduls/comapny");


// exports.createCompany = async (req, res) => {
//     try {
//         const { email, password, nombre, nit, nombreCompany } = req.body;

//         // Validar que todos los campos requeridos estén presentes
//         if (!nombre || !password || !email || !nit || !nombreCompany) {
//             return res.status(400).json({ message: 'Todos los campos son obligatorios' });
//         }

//         // guardar comapñia despues el usuario admin



//         // Crear una nueva compañía
//         const nuevaCompania = new Oganizacion({
//             email,
//             password,
//             nombre,
//             nit,
//             nombreCompany,
//             role: 'admin',
//             estado: true,
//         });

//         // Guardar la compañía en la base de datos
//         const nn = await nuevaCompania.save();
// console.log("hola", nn);


//         res.status(201).json({ message: 'Compañía creada exitosamente', compania: nuevaCompania });
//     } catch (error) {
//         console.error('Error al crear la compañía:', error);
//         res.status(500).json({ message: 'Error interno del servidor' });
//     }
// };

function Compania({ email, nit, nombreCompany }) {
    try {
        // Crear una nueva compañía
        const nuevaCompania = new Oganizacion({
            email,
            nit,
            nombreCompany,
            estado: true,
        });

        // Guardar la compañía en la base de datos
        return nuevaCompania.save();
    } catch (error) {
        console.error('Error al crear la compañía:', error);
        throw new Error('Error interno del servidor');
    }
}

module.exports = { Compania };