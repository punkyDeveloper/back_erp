const { nuevoServicio } = require('./sercios');
const { crearSupServicio } = require('./supServicios');

exports.postServicios = async (req, res) => {
    try {
        const { nombre, tiempo, valor, supnombre, suptiempo, supvalor } = req.body;

        // Validar que lleguen los datos requeridos
        if (!nombre || !tiempo || !supnombre || !suptiempo || !supvalor) {
            return res.status(400).json({ 
                success: false,
                error: 'Por favor, completa todos los campos' 
            });
        }

        // 1️⃣ Crear el subservicio primero y CAPTURAR el resultado
        const subServicioCreado = await crearSupServicio({
            supnombre,
            suptiempo,
            supvalor
        });

        console.log('✅ SubServicio creado con ID:', subServicioCreado._id);

        // 2️⃣ Luego crear el servicio con el ID del subservicio
        const servicioCreado = await nuevoServicio({
            nombre,
            tiempo,
            valor,
            idSupservicios: [subServicioCreado._id] // ✅ Usar el _id del MongoDB
        });

        console.log('✅ Servicio creado con ID:', servicioCreado._id);

        res.status(201).json({ 
            success: true,
            message: 'Servicio y SubServicio creados exitosamente',
            data: {
                servicio: servicioCreado,
                subServicio: subServicioCreado
            }
        });

    } catch (error) {
        console.error('❌ Error al crear servicio:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al crear servicio',
            details: error.message 
        });
    }
};
// Traer todos los servisios son supservicios de la comapania  y si master  traer todas las comapnias

exports.getServicios = async (req, res) => {  

  try{
    const servicios = await nuevoServicio.getServicios();
    res.status(200).json({ success: true, data: servicios });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ success: false, error: 'Error al obtener servicios' });          
  } 
};