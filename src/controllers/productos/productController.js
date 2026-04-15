const { crearProducto, getProductsByCompany, editarProducto, eliminarProducto } = require('./produc');

exports.createProduct = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    if (!companiaId) return res.status(403).json({ msg: 'Sin compañía en el token' });

    const { name, description, price, venta, alquiler, stock } = req.body;

    if (!name || !description || !price || !stock) {
      return res.status(400).json({ msg: 'name, description, price y stock son requeridos' });
    }

    const imageUrl     = req.file?.cloudinaryUrl || null;
    const ventaBool    = venta    === 'true' || venta    === true;
    const alquilerBool = alquiler === 'true' || alquiler === true;

    const producto = await crearProducto({
      name,
      description,
      price:    Number(price),
      stock:    Number(stock),
      venta:    ventaBool,
      alquiler: alquilerBool,
      img:      imageUrl,
      compania: companiaId,
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear el producto' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    if (!companiaId) return res.status(403).json({ msg: 'Sin compañía en el token' });

    const products = await getProductsByCompany(companiaId);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los productos' });
  }
};

exports.getProductsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const products = await getProductsByCompany(companyId);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los productos por compañía' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const companiaId = req.user.compania;
    const { id }     = req.params;
    const { name, description, price, venta, alquiler, stock } = req.body;

    const update = { compania: companiaId };
    if (name        !== undefined) update.name        = name;
    if (description !== undefined) update.description = description;
    if (price       !== undefined) update.price       = Number(price);
    if (stock       !== undefined) update.stock       = Number(stock);
    if (venta       !== undefined) update.venta       = venta    === 'true' || venta    === true;
    if (alquiler    !== undefined) update.alquiler    = alquiler === 'true' || alquiler === true;
    if (req.file?.cloudinaryUrl)   update.img         = req.file.cloudinaryUrl;

    const updated = await editarProducto(id, update);
    if (!updated) return res.status(404).json({ msg: 'Producto no encontrado' });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al editar el producto' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await eliminarProducto(id);
    if (!deleted) return res.status(404).json({ msg: 'Producto no encontrado' });
    res.json({ msg: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar el producto' });
  }
};
