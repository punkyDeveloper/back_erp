const {crearProducto, getProducts, getProductsByCompany} = require('./produc');

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
      console.log(req.body);
        const { name, description, price,venta,alquiler, img, compania, stock } = req.body;
        // Validar que se reciban todos los datos necesarios
        if (!name || !description || !price || !venta || !alquiler || !compania || !stock) {
            return res.status(400).json({ msg: 'Ingresa los datos completos' });
        }
          // Multer te da acceso al archivo en req.file
        if (!req.file) {
          return res.status(400).json({ error: "Se requiere una imagen" });
        }
        // const imageUrl = req.file.path;
        const imageUrl = req.file?.cloudinaryUrl;
        // Crear un nuevo producto
        await crearProducto({ name, description, price,venta,alquiler, img: imageUrl, compania, stock });

        res.json({ msg: 'Producto creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear el producto' });
    }
}


// traer todos los productos

exports.getProducts = async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los productos' });
  }
}

// traer productos por id de compañia
exports.getProductsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const products = await getProductsByCompany(companyId);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los productos por compañía' });
  }
}
