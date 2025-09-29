const {Productos} = require('./produc');

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price,venta,alquiler, img, compania } = req.body;
        // Validar que se reciban todos los datos necesarios
        if (!name || !description || !price || !venta || !alquiler || !compania) {
            return res.status(400).json({ msg: 'Ingresa los datos completos' });
        }
          // Multer te da acceso al archivo en req.file
        if (!req.file) {
          return res.status(400).json({ error: "Se requiere una imagen" });
        }
        const imageUrl = req.file.path;

        // Crear un nuevo producto
        await Productos({ name, description, price,venta,alquiler, img: imageUrl, compania });

        res.json({ msg: 'Producto creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear el producto' });
    }
}