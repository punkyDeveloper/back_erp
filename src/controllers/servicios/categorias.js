const { nuevoServicio, getServicios, actualizarServicio } = require('./sercios');
const { crearSupServicio, actualizarSupServicio } = require('./supServicios');

// ✅ CREAR servicio con subservicios
exports.crearServiciosSupservicio = async (req, res) => {
  try {
    const { nombre, tiempo, valor, subservicios } = req.body;
    const compania = req.user.compania;

    if (!nombre || !compania) {
      return res.status(400).json({ 
        success: false,
        error: 'Por favor, completa todos los campos' 
      });
    }

    const idsSubServicios = [];

    for (const sub of subservicios || []) {
      const subCreado = await crearSupServicio({
        supnombre: sub.supnombre,
        suptiempo: sub.suptiempo,
        supvalor: sub.supvalor,
        descripcion: sub.descripcion || '',
        compania
      });
      idsSubServicios.push(subCreado._id);
    }

    const servicioCreado = await nuevoServicio({
      nombre,
      tiempo,
      valor,
      idSupservicios: idsSubServicios,
      compania
    });

    res.status(201).json({ success: true, data: servicioCreado });

  } catch (error) {
    console.error('❌ Error al crear servicio:', error);
    res.status(500).json({ success: false, error: 'Error al crear servicio', details: error.message });
  }
};

// ✅ GET servicios por compania (master trae todos)
exports.getServicios = async (req, res) => {  
  try {
    const servicios = await getServicios(req.user);
    res.status(200).json({ success: true, data: servicios });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ success: false, error: error.message });          
  } 
};


exports.editarServicioSupservicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tiempo, valor, subservicios } = req.body;
    const compania = req.user.compania;

    console.log('📥 Editando servicio:', { id, nombre, tiempo, valor, subservicios });

    // 1️⃣ Actualizar cada subservicio por su ID
    for (const sub of subservicios || []) {
      if (sub._id) {
        // ✅ Subservicio existente — actualizar
        await actualizarSupServicio(sub._id, {
          supnombre: sub.supnombre,
          suptiempo: sub.suptiempo,
          supvalor: sub.supvalor,
          descripcion: sub.descripcion || ''
        });
      } else {
        // ✅ Subservicio nuevo — crear
        const subCreado = await crearSupServicio({
          supnombre: sub.supnombre,
          suptiempo: sub.suptiempo,
          supvalor: sub.supvalor,
          descripcion: sub.descripcion || '',
          compania
        });
        sub._id = subCreado._id;
      }
    }

    // 2️⃣ Actualizar el servicio con los IDs
    const idsSubServicios = (subservicios || []).map(sub => sub._id);
    const servicioActualizado = await actualizarServicio(id, {
      nombre,
      tiempo,
      valor,
      idSupservicios: idsSubServicios
    });

    res.status(200).json({ success: true, data: servicioActualizado });

  } catch (error) {
    console.error('❌ Error al editar servicio:', error);
    res.status(500).json({ success: false, error: 'Error al editar servicio', details: error.message });
  }
};