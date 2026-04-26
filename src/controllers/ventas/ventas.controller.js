const VentasService = require('./ventas.service');

// ─── GET /v1/ventas?estado=borrador ──────────────────────────────────────────
const getVentas = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    if (!companiaId) return res.status(403).json({ ok: false, msg: 'Sin compañía en el token' });

    const { estado } = req.query;

    const ventas = await VentasService.getVentas({ companiaId, estado });
    return res.json({ ok: true, data: ventas });
  } catch (error) {
    console.error('[getVentas]', error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener las ventas' });
  }
};

// ─── POST /v1/ventas ──────────────────────────────────────────────────────────
const createVenta = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    if (!companiaId) return res.status(403).json({ ok: false, msg: 'Sin compañía en el token' });

    const venta = await VentasService.crearVenta({ companiaId, datos: req.body, user: req.user });
    return res.status(201).json({ ok: true, data: venta });
  } catch (error) {
    console.error('[createVenta]', error);
    return res.status(500).json({ ok: false, msg: 'Error al crear la venta' });
  }
};

// ─── PUT /v1/ventas/:id ───────────────────────────────────────────────────────
const updateVenta = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    if (!companiaId) return res.status(403).json({ ok: false, msg: 'Sin compañía en el token' });

    const { id } = req.params;
    const venta = await VentasService.actualizarVenta({ id, companiaId, datos: req.body, user: req.user });

    if (!venta) return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });

    return res.json({ ok: true, data: venta });
  } catch (error) {
    console.error('[updateVenta]', error);
    if (error.code === 'ESTADO_INVALIDO') {
      return res.status(400).json({ ok: false, msg: error.message });
    }
    return res.status(500).json({ ok: false, msg: 'Error al actualizar la venta' });
  }
};

// ─── DELETE /v1/ventas/:id — cancela la venta (no elimina el registro) ────────
const cancelVenta = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    if (!companiaId) return res.status(403).json({ ok: false, msg: 'Sin compañía en el token' });

    const { id } = req.params;
    const venta = await VentasService.cancelarVenta({ id, companiaId });

    if (!venta) return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });

    return res.json({ ok: true, data: venta });
  } catch (error) {
    console.error('[cancelVenta]', error);
    if (error.code === 'ESTADO_INVALIDO') {
      return res.status(400).json({ ok: false, msg: error.message });
    }
    return res.status(500).json({ ok: false, msg: 'Error al cancelar la venta' });
  }
};

module.exports = { getVentas, createVenta, updateVenta, cancelVenta };
