const Servicio = require('../../moduls/servicios');

// ✅ Función interna para categorias.js - CREAR
exports.nuevoServicio = async (data) => {
  return await Servicio.create(data);
};

// ✅ Función interna para categorias.js - GET por compania
exports.getServicios = async (user) => {
  const filtro = user.rol === 'master' ? {} : { compania: user.compania };
  return await Servicio.find(filtro)
    .populate('idSupservicios')
    .sort({ createdAt: -1 });
};

// ✅ GET /v1/servicios/:id
exports.getServicioPorId = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id).populate('idSupservicios');
    if (!servicio) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }
    res.status(200).json({ success: true, data: servicio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ PUT /v1/servicios/:id
exports.actualizarServicio = async (id, data) => {
  return await Servicio.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('idSupservicios');
};

// ✅ DELETE /v1/servicios/:id
exports.deleteServicios = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndDelete(req.params.id);
    if (!servicio) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};