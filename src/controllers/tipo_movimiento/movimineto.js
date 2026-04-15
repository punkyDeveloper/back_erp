const Movimiento        = require('../../moduls/movimiento');
const { validarCompaniaId } = require('../user/companias');

// ─── Helper: genera referencia única por empresa y tipo ───────────────────────
const generarReferencia = async (tipo_movimiento, companiaId) => {
  const prefijo = tipo_movimiento === 'ingreso' ? 'ING' : 'EGR';
  const count   = await Movimiento.countDocuments({ tipo_movimiento, compania: companiaId });
  return `${prefijo}-${String(count + 1).padStart(4, '0')}`;
};

// ─── Crear movimiento — usado por controlador HTTP y por otros servicios ──────
const createMovimiento = async ({ companiaId, nombre, tipo_movimiento, fecha, valor, tipo, descripcion, ganancia = 0, modulo = 'manual', referenciaId = null }) => {
  const empresaValida = await validarCompaniaId(companiaId);
  if (!empresaValida) {
    const err = new Error('ID de empresa no válido');
    err.code = 'EMPRESA_INVALIDA';
    throw err;
  }

  const referencia = await generarReferencia(tipo_movimiento, companiaId);

  const movimiento = await Movimiento.create({
    nombre,
    compania:        companiaId,
    tipo_movimiento,
    referencia,
    fecha:           fecha || new Date(),
    valor,
    ganancia,
    tipo,
    descripcion,
    modulo,
    referenciaId,
  });

  return movimiento;
};

// ─── Obtener movimientos filtrados por empresa y tipo ─────────────────────────
const getMovimientos = async ({ companiaId, tipo_movimiento, modulo }) => {
  const filtro = { compania: companiaId };
  if (tipo_movimiento) filtro.tipo_movimiento = tipo_movimiento;
  if (modulo)          filtro.modulo          = modulo;
  return await Movimiento.find(filtro).sort({ fecha: -1 });
};

module.exports = { createMovimiento, getMovimientos };