const { Compania } = require('./companias');
const { registrar } = require('./user');

exports.createCompany = async (req, res) => {
  try {
    const { email, password, nombre, nit, nombreCompany } = req.body;

    if (!email || !nit || !nombreCompany || !nombre || !password) {
      return res.status(400).json({ msg: 'Ingresa los datos completos' });
    }

    // Guardar compañía y obtener el documento creado
    const nuevaCompania = await Compania({ email, nit, nombreCompany });

    // Validación de seguridad
    if (!nuevaCompania || !nuevaCompania._id) {
      console.error('Compania no creada:', nuevaCompania);
      return res.status(500).json({ msg: 'No se pudo crear la compañía' });
    }

    // Crear usuario administrador con referencia a la compañía
    await registrar({
      nombre,
      email,
      rol: 'Admin',
      user: nit,
      apellido: 'nn',
      estado: true,
      password,
      companiaId: nuevaCompania._id
    });

    res.json({
      msg: 'Compañía creada'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear la compañía' });
  }
};
