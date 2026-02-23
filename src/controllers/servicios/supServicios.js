const SubServicio = require('../../moduls/supServicios');

// Función interna para crear
exports.crearSupServicio = async (data, userId, company) => {
  const nuevoSupServicio = new SubServicio({
    ...data,
    createdBy: userId,
    company: company
  });
  await nuevoSupServicio.save();
  return nuevoSupServicio;
};

// POST /api/sub-servicios
exports.postSupServicios = async (req, res) => {
  try {
    const { supnombre, suptiempo, supvalor, descripcion } = req.body;

    if (!supnombre || !suptiempo || !supvalor) {
      return res.status(400).json({ success: false, error: 'Campos incompletos' });
    }

    const nuevoSupServicio = new SubServicio({
      supnombre,
      suptiempo,
      supvalor,
      descripcion,
      createdBy: req.user._id,
      company: req.user.nombreCompany
    });

    await nuevoSupServicio.save();

    res.status(201).json({ success: true, data: nuevoSupServicio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sub-servicios
exports.getSupServicios = async (req, res) => {
  try {
    const filtro = req.user.rol === 'master' ? {} : { company: req.user.nombreCompany };
    const subServicios = await SubServicio.find(filtro).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subServicios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 GET /api/sub-servicios/:id - OBTENER UNO POR ID
exports.getSupServicioPorId = async (req, res) => {
  try {
    const subServicio = await SubServicio.findById(req.params.id);
    if (!subServicio) {
      return res.status(404).json({ success: false, error: 'SubServicio no encontrado' });
    }
    res.status(200).json({ success: true, data: subServicio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/sub-servicios/:id
exports.putSupServicios = async (req, res) => {
  try {
    const subServicio = await SubServicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subServicio) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.status(200).json({ success: true, data: subServicio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/sub-servicios/:id
exports.deleteSupServicios = async (req, res) => {
  try {
    const subServicio = await SubServicio.findByIdAndDelete(req.params.id);
    if (!subServicio) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};