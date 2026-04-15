const Movimiento = require('../../moduls/movimiento');
const mongoose   = require('mongoose');

// ─── GET /v1/facturas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD ──────────────────────
exports.getFacturas = async (req, res) => {
  try {
    const companiaId = new mongoose.Types.ObjectId(req.user.compania);
    const { desde, hasta } = req.query;

    const filtro = {
      compania:        companiaId,
      tipo_movimiento: 'ingreso',
    };
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(`${hasta}T23:59:59`);
    }

    const ingresos = await Movimiento.find(filtro).sort({ createdAt: -1 }).lean();

    const facturas = ingresos.map(m => ({
      id:                m._id,
      numero_factura:    m.numero_factura    || m.referencia,
      cliente_nombre:    m.cliente_nombre    || m.nombre,
      cliente_documento: m.cliente_documento || '',
      modulo:            m.modulo,
      metodo_pago:       m.metodo_pago       || '',
      subtotal:          m.iva ? m.valor - m.iva : m.valor,
      iva:               m.iva               || 0,
      total:             m.valor,
      estado:            m.estado            || 'activo',
      created_at:        m.createdAt,
    }));

    return res.json({ facturas });
  } catch (e) {
    console.error('[getFacturas]', e);
    return res.status(500).json({ msg: 'Error al obtener facturas' });
  }
};
