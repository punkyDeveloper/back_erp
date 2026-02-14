const Movimiento = require('../../moduls/movimiento');
const { validarCompaniaId } = require('../user/companias');

exports.createMovimiento = async (req, res) => {
  try {
    const { tipo_movimiento, fecha, valor, tipo, descripcion } = req.body;
    const empresaId = req.user.compania; // viene del token JWT
    const nombre = req.user.nombre; // viene del token JWT
    console.log("nombre:", nombre);
    console.log("USER:", req.user);
    console.log("datos empresaId", empresaId);
    // Validaciones
    if (!empresaId) {
      return res.status(400).json({ msg: 'No se encontró la empresa del usuario' });
    }

    if (!tipo_movimiento || !fecha || !valor || !tipo || !descripcion) {
      return res.status(400).json({ msg: 'Ingresa los datos completos' });
    }

    if (!['ingreso', 'egreso'].includes(tipo_movimiento)) {
      return res.status(400).json({ msg: 'tipo_movimiento debe ser "ingreso" o "egreso"' });
    }

    if (valor <= 0) {
      return res.status(400).json({ msg: 'El valor debe ser mayor a 0' });
    }

    // Validar ID de compañía exista en la db
    const empresaValida = await validarCompaniaId(empresaId);
    if (!empresaValida) {
      return res.status(400).json({ msg: 'ID de empresa no válido' });
    }

    // Referencia única POR EMPRESA y sea auto ingremental
    const prefijo = tipo_movimiento === 'ingreso' ? 'ING' : 'EGR';
    const count = await Movimiento.countDocuments({ tipo_movimiento, compania: empresaId });
    const referencia = `${prefijo}-${String(count + 1).padStart(4, '0')}`;
    console.log("referencia generada:", referencia);

    const nuevoMovimiento = new Movimiento({
      nombre,
      compania: empresaId,
      tipo_movimiento,
      referencia,
      fecha,
      valor,
      tipo,
      descripcion,
    });

    await nuevoMovimiento.save();
    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ msg: 'Referencia duplicada, intenta de nuevo' });
    }
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ msg: 'Error al crear movimiento' });
  }
};


// ver los ingresos o egresos segun el modulo 
//  va a hacer el get segun la compañia que venga con jwt
// quiero que si el front dice que es in egreso solo consulte los egresos de esa compañia 

exports.getMovimientos = async (req, res) => {
  try {
    const empresaId = req.user.compania; // viene del token JWT
    const tipo_movimiento = req.query.tipo_movimiento; // se espera que el front envíe ?tipo_movimiento=ingreso o ?tipo_movimiento=egreso

    if (!empresaId) {
      return res.status(400).json({ msg: 'No se encontró la empresa del usuario' });
    }

    if (tipo_movimiento && !['ingreso', 'egreso'].includes(tipo_movimiento)) {
      return res.status(400).json({ msg: 'tipo_movimiento debe ser "ingreso" o "egreso"' });
    }

    const filtro = { compania: empresaId };
    if (tipo_movimiento) {
      filtro.tipo_movimiento = tipo_movimiento;
    }

    const movimientos = await Movimiento.find(filtro).sort({ fecha: -1 });
    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ msg: 'Error al obtener movimientos' });
  }
}