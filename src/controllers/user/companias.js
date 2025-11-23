const Oganizacion = require("../../moduls/comapny");

function Compania({ email, nit, nombreCompany, dv }) {
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

module.exports = { Compania };