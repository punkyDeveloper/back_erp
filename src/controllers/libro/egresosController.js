const Movimiento        = require('../../moduls/movimiento');
const MovimientoService = require('../tipo_movimiento/movimineto');
const mongoose          = require('mongoose');

// ─── GET /v1/egresos?desde=YYYY-MM-DD&hasta=YYYY-MM-DD ───────────────────────
exports.getEgresos = async (req, res) => {
  try {
    const companiaId = new mongoose.Types.ObjectId(req.user.compania);
    const { desde, hasta } = req.query;

    const filtro = {
      compania:        companiaId,
      tipo_movimiento: 'egreso',
    };
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(`${hasta}T23:59:59`);
    }

    const docs = await Movimiento.find(filtro).sort({ fecha: -1 }).lean();

    return res.json({
      egresos: docs.map(m => ({
        id:            m._id,
        concepto:      m.descripcion,
        categoria:     m.tipo,
        monto:         m.valor,
        metodo_pago:   m.metodo_pago    || '',
        proveedor:     m.proveedor      || '',
        referencia:    m.referencia_ext || m.referencia,
        notas:         m.notas          || '',
        fecha:         m.fecha,
        created_at:    m.createdAt,
        estado:        m.estado         || 'activo',
        usuario_nombre: m.nombre,
      })),
    });
  } catch (e) {
    console.error('[getEgresos]', e);
    return res.status(500).json({ msg: 'Error al obtener egresos' });
  }
};

// ─── POST /v1/egresos ─────────────────────────────────────────────────────────
exports.createEgreso = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    const nombre     = req.user.nombre;
    const { concepto, categoria, monto, metodo_pago, proveedor, referencia, notas, fecha } = req.body;

    if (!concepto || !categoria || !monto || !fecha)
      return res.status(400).json({ msg: 'concepto, categoria, monto y fecha son requeridos' });

    if (monto <= 0)
      return res.status(400).json({ msg: 'El monto debe ser mayor a 0' });

    const movimiento = await MovimientoService.createMovimiento({
      companiaId,
      nombre,
      tipo_movimiento: 'egreso',
      fecha,
      valor:       monto,
      tipo:        categoria,
      descripcion: concepto,
      modulo:      'manual',
    });

    // Guardar campos adicionales del egreso
    movimiento.metodo_pago    = metodo_pago  || '';
    movimiento.proveedor      = proveedor    || '';
    movimiento.referencia_ext = referencia   || '';
    movimiento.notas          = notas        || '';
    movimiento.estado         = 'activo';
    await movimiento.save();

    return res.status(201).json({
      id:            movimiento._id,
      concepto:      movimiento.descripcion,
      categoria:     movimiento.tipo,
      monto:         movimiento.valor,
      metodo_pago:   movimiento.metodo_pago,
      proveedor:     movimiento.proveedor,
      referencia:    movimiento.referencia_ext || movimiento.referencia,
      notas:         movimiento.notas,
      fecha:         movimiento.fecha,
      created_at:    movimiento.createdAt,
      estado:        movimiento.estado,
      usuario_nombre: movimiento.nombre,
    });
  } catch (e) {
    if (e.code === 'EMPRESA_INVALIDA') return res.status(400).json({ msg: e.message });
    console.error('[createEgreso]', e);
    return res.status(500).json({ msg: 'Error al crear egreso' });
  }
};

// ─── PATCH /v1/egresos/:id/anular ────────────────────────────────────────────
exports.anularEgreso = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: 'ID inválido' });

    const egreso = await Movimiento.findOne({
      _id:             id,
      compania:        companiaId,
      tipo_movimiento: 'egreso',
    });

    if (!egreso)
      return res.status(404).json({ msg: 'Egreso no encontrado' });

    if (egreso.estado === 'anulado')
      return res.status(400).json({ msg: 'El egreso ya está anulado' });

    egreso.estado = 'anulado';
    await egreso.save();

    return res.json({ msg: 'Egreso anulado correctamente', id: egreso._id });
  } catch (e) {
    console.error('[anularEgreso]', e);
    return res.status(500).json({ msg: 'Error al anular egreso' });
  }
};
