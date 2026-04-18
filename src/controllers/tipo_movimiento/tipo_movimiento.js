const MovimientoService = require('./movimineto');

// ─── DELETE /v1/movimientos/:id ───────────────────────────────────────────────
exports.deleteMovimiento = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    if (!companiaId)
      return res.status(400).json({ msg: 'No se encontró la empresa del usuario' });

    const doc = await MovimientoService.deleteMovimiento({ id: req.params.id, companiaId });
    if (!doc)
      return res.status(404).json({ msg: 'Movimiento no encontrado' });

    return res.json({ ok: true, msg: 'Movimiento eliminado' });
  } catch (e) {
    console.error('[deleteMovimiento]', e);
    return res.status(500).json({ msg: 'Error al eliminar movimiento' });
  }
};

// ─── POST /v1/movimientos ─────────────────────────────────────────────────────
exports.createMovimiento = async (req, res) => {
  try {
    const { tipo_movimiento, fecha, valor, tipo, descripcion } = req.body;
    const companiaId = req.user.compania;
    const nombre     = req.user.nombre;

    if (!companiaId)
      return res.status(400).json({ msg: 'No se encontró la empresa del usuario' });

    if (!tipo_movimiento || !fecha || !valor || !tipo || !descripcion)
      return res.status(400).json({ msg: 'Ingresa los datos completos' });

    if (!['ingreso', 'egreso'].includes(tipo_movimiento))
      return res.status(400).json({ msg: 'tipo_movimiento debe ser "ingreso" o "egreso"' });

    if (valor <= 0)
      return res.status(400).json({ msg: 'El valor debe ser mayor a 0' });

    const movimiento = await MovimientoService.createMovimiento({
      companiaId, nombre, tipo_movimiento, fecha, valor, tipo, descripcion,
    });

    return res.status(201).json(movimiento);
  } catch (e) {
    if (e.code === 'EMPRESA_INVALIDA') return res.status(400).json({ msg: e.message });
    if (e.code === 11000)              return res.status(409).json({ msg: 'Referencia duplicada, intenta de nuevo' });
    console.error('[createMovimiento]', e);
    return res.status(500).json({ msg: 'Error al crear movimiento' });
  }
};

// ─── GET /v1/movimientos ──────────────────────────────────────────────────────
exports.getMovimientos = async (req, res) => {
  try {
    const companiaId      = req.user.compania;
    const tipo_movimiento = req.query.tipo_movimiento;
    const modulo          = req.query.modulo;

    if (!companiaId)
      return res.status(400).json({ msg: 'No se encontró la empresa del usuario' });

    if (tipo_movimiento && !['ingreso', 'egreso'].includes(tipo_movimiento))
      return res.status(400).json({ msg: 'tipo_movimiento debe ser "ingreso" o "egreso"' });

    const movimientos = await MovimientoService.getMovimientos({ companiaId, tipo_movimiento, modulo });
    return res.json(movimientos);
  } catch (e) {
    console.error('[getMovimientos]', e);
    return res.status(500).json({ msg: 'Error al obtener movimientos' });
  }
};