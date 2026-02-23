const Servicio = require('../../moduls/servicios');

// Función interna para crear
exports.nuevoServicio = async (data, userId, company) => {
  const nuevoServicio = new Servicio({
    ...data,
    createdBy: userId,
    company: company
  });
  await nuevoServicio.save();
  return nuevoServicio;
};

// POST /api/servicios
exports.postServicios = async (req, res) => {
  try {
    const { nombre, tiempo, valor, idSupservicios } = req.body;

    if (!nombre || !tiempo || !valor) {
      return res.status(400).json({ success: false, error: 'Campos incompletos' });
    }

    const nuevoServicio = new Servicio({
      nombre,
      tiempo,
      valor,
      idSupservicios: idSupservicios || [],
      createdBy: req.user._id,
      company: req.user.nombreCompany
    });

    await nuevoServicio.save();
    await nuevoServicio.populate('idSupservicios');

    res.status(201).json({ success: true, data: nuevoServicio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/servicios
exports.getServicios = async (req, res) => {
  try {
    const filtro = req.user.rol === 'master' ? {} : { company: req.user.nombreCompany };
    const servicios = await Servicio.find(filtro)
      .populate('idSupservicios')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: servicios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 GET /api/servicios/:id - OBTENER UNO POR ID
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

// PUT /api/servicios/:id
exports.putServicios = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('idSupservicios');
    if (!servicio) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.status(200).json({ success: true, data: servicio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/servicios/:id
exports.deleteServicios = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndDelete(req.params.id);
    if (!servicio) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};