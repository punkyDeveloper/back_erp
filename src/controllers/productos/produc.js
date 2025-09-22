const Productos = require('../../moduls/product');

// Crear un nuevo producto
async function productos({ name, description, price, venta, alquiler, img, compania }) {
  try {
    const newProduct = new Productos({
      name,
      description,
      price,
      venta,
      alquiler,
      img,
      compania
    });

    // Guardar el producto en la base de datos
    await newProduct.save();

    return newProduct; // Retornar el producto creado
  } catch (error) {
    console.error('Error al crear el producto:', error);
    throw error; // Propagar el error para manejo externo
  }
}

module.exports = { productos }; 