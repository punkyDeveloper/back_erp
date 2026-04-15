const Movimiento = require('../../moduls/movimiento');
const mongoose   = require('mongoose');

// ─── GET /v1/libro/resumen?desde=YYYY-MM-DD&hasta=YYYY-MM-DD ─────────────────
exports.getResumen = async (req, res) => {
  try {
    const companiaId = new mongoose.Types.ObjectId(req.user.compania);
    const { desde, hasta } = req.query;

    const match = {
      compania: companiaId,
      estado:   { $ne: 'anulado' },
    };
    if (desde || hasta) {
      match.fecha = {};
      if (desde) match.fecha.$gte = new Date(desde);
      if (hasta) match.fecha.$lte = new Date(`${hasta}T23:59:59`);
    }

    // Totales por tipo
    const totales = await Movimiento.aggregate([
      { $match: match },
      {
        $group: {
          _id:       '$tipo_movimiento',
          total:     { $sum: '$valor' },
          total_iva: { $sum: '$iva' },
          cantidad:  { $sum: 1 },
        },
      },
    ]);

    const ing = totales.find(t => t._id === 'ingreso') || { total: 0, total_iva: 0, cantidad: 0 };
    const egr = totales.find(t => t._id === 'egreso')  || { total: 0, total_iva: 0, cantidad: 0 };

    // Por categoría (campo tipo)
    const porCategoria = await Movimiento.aggregate([
      { $match: match },
      { $group: { _id: '$tipo', monto: { $sum: '$valor' } } },
      { $project: { _id: 0, categoria: '$_id', monto: 1 } },
      { $sort: { monto: -1 } },
    ]);

    // Por módulo
    const porModulo = await Movimiento.aggregate([
      { $match: match },
      { $group: { _id: '$modulo', monto: { $sum: '$valor' } } },
      { $project: { _id: 0, modulo: '$_id', monto: 1 } },
      { $sort: { monto: -1 } },
    ]);

    return res.json({
      resumen: {
        total_ingresos:    ing.total,
        total_egresos:     egr.total,
        total_iva:         ing.total_iva + egr.total_iva,
        cantidad_ingresos: ing.cantidad,
        cantidad_egresos:  egr.cantidad,
        por_categoria:     porCategoria,
        por_modulo:        porModulo,
      },
    });
  } catch (e) {
    console.error('[getResumen]', e);
    return res.status(500).json({ msg: 'Error al obtener resumen' });
  }
};

// ─── GET /v1/libro/asientos?desde=YYYY-MM-DD&hasta=YYYY-MM-DD ────────────────
exports.getAsientos = async (req, res) => {
  try {
    const companiaId = new mongoose.Types.ObjectId(req.user.compania);
    const { desde, hasta } = req.query;

    const filtro = { compania: companiaId };
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(`${hasta}T23:59:59`);
    }

    const movimientos = await Movimiento.find(filtro).sort({ fecha: -1 }).lean();

    const asientos = movimientos.map(m => ({
      id:             m._id,
      tipo:           m.tipo_movimiento,
      concepto:       m.descripcion,
      monto:          m.valor,
      fecha:          m.fecha,
      created_at:     m.createdAt,
      modulo:         m.modulo         || null,
      categoria:      m.tipo           || null,
      referencia:     m.referencia     || null,
      numero_factura: m.numero_factura || null,
      estado:         m.estado         || 'activo',
    }));

    return res.json({ asientos });
  } catch (e) {
    console.error('[getAsientos]', e);
    return res.status(500).json({ msg: 'Error al obtener asientos' });
  }
};
