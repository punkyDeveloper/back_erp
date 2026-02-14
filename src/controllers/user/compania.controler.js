const argon2 = require('argon2');
const { Compania } = require('./companias');
const { createUser } = require('./user');

exports.createCompany = async (req, res) => {
  try {
    const { email, password, nombre, nit, nombreCompany, dv, apellido } = req.body;

    if (!email || !nit || !nombreCompany || !nombre || !password || !apellido || !dv) {
      return res.status(400).json({ msg: 'Ingresa los datos completos' });
    }
    // Guardar compañía y obtener el documento creado
    const nuevaCompania = await Compania({ email, nit, nombreCompany, dv });

    // Validación de seguridad
    if (!nuevaCompania || !nuevaCompania._id) {
      console.error('Compania no creada:', nuevaCompania);
      return res.status(500).json({ msg: 'No se pudo crear la compañía' });
    }
    // incriptar password
    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });



    // Crear usuario administrador con referencia a la compañía
    await createUser({
      name: nombre,
      email,
      rol_id: 'Administrador',
      user: nit,
      apellido,
      compania: nuevaCompania._id,
      hashedPassword,
      passwordPlain: password
    });

    res.json({msg: 'Compañía creada'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear la compañía' });
  }
};

// Validar ID de compañía
exports.validarCompaniaId = async (req, res) => {
  try {
    const { companiaId } = req.params;
    const isValid = await Compania.validarCompaniaId(companiaId);
    res.json({ valid: isValid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al validar la compañía' });
  }
}