const { Clientes } = require('../../controllers/clientes/cliente');
// crear 
exports.createMecanica = async (req, res) => {
  try {
    const { placa, vehículo, tipo, estado, kilometraje, fecha, taller, sercios, repuestos , descripcion } = req.body;
    const empresaId = req.user.compania;
    const mecanico = req.user.nombre; // viene del token JWT         
    // Validaciones
    if (!empresaId) {
      return res.status(400).json({ msg: 'No se encontró la empresa del usuario' });
    }

    if (!mecanico) {
      return res.status(400).json({ msg: 'No se encontró el nombre del mecánico en el token' });
    }

    if (!placa || !vehículo || !tipo || !estado || !kilometraje || !fecha || !taller) {
      return res.status(400).json({ msg: 'Ingresa los datos completos' });
    }   
    const nuevaMecanica = new Mecanica({
      placa,
      vehículo,
        tipo,
        estado,
        kilometraje,
        fecha,
        taller, 
        sercios,
        repuestos,
        descripcion,
        compania: empresaId,
        mecanico
    }); 
    const mecanicaGuardada = await nuevaMecanica.save();
    res.status(201).json({ msg: 'Mecánica creada exitosamente', data: mecanicaGuardada });
  } catch (error) {
    console.error('Error al crear mecánica:', error);
    res.status(500).json({ msg: 'Error al crear mecánica', error: error.message });
  } 
};

// ver todas las mecanicas