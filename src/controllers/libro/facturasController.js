const Movimiento = require('../../moduls/movimiento');
const Mecanica   = require('../../moduls/mecanica');
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

    // Fetch mecanica details for movimientos that reference a mecanica order
    const mecanicaIds = ingresos
      .filter(m => m.modulo === 'mecanica' && m.referenciaId)
      .map(m => m.referenciaId);

    const mecanicaMap = {};
    if (mecanicaIds.length > 0) {
      const mecanicaDocs = await Mecanica.find({ _id: { $in: mecanicaIds } }).lean();
      for (const doc of mecanicaDocs) {
        mecanicaMap[doc._id.toString()] = doc;
      }
    }

    const facturas = ingresos.map(m => {
      const base = {
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
      };

      if (m.modulo === 'mecanica' && m.referenciaId) {
        const mec = mecanicaMap[m.referenciaId.toString()];
        if (mec) {
          base.servicios = mec.servicios || [];
          base.productos  = mec.productos  || [];
        }
      }

      return base;
    });

    return res.json({ facturas });
  } catch (e) {
    console.error('[getFacturas]', e);
    return res.status(500).json({ msg: 'Error al obtener facturas' });
  }
};
