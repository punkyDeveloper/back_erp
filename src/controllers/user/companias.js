const Oganizacion = require("../../moduls/comapny");

function Compania({ email, nit, nombreCompany, dv }) {
    console.log("hola estoy aqui");
    
    try {
        // Crear una nueva compañía
        const nuevaCompania = new Oganizacion({
            email,
            nit,
            nombreCompany,
            estado: true,
            dv
        });

        // Guardar la compañía en la base de datos
        return nuevaCompania.save();
    } catch (error) {
        console.error('Error al crear la compañía:', error);
        throw new Error('Error interno del servidor');
    }
}

// validar compañia id
async function validarCompaniaId(companiaId) {
    try {
        const compania = await Oganizacion.findById(companiaId);
        return compania !== null;
    } catch (error) {
        console.error('Error al validar la compañía:', error);
        throw new Error('Error interno del servidor');
    }
}

module.exports = { Compania, validarCompaniaId };