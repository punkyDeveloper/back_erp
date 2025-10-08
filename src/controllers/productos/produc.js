const Product = require('../../moduls/product');

// Crear un nuevo producto
async function crearProducto({ name, description, price, venta, alquiler, img, compania, stock }) {
  try {
    const newProduct = new Product({
      name,
      description,
      price,
      venta,
      alquiler,
      img,
      stock,
      compania
    });

    // Guardar el producto en la base de datos
    await newProduct.save();


    // return newProduct; // Retornar el producto creado
  } catch (error) {
    console.error('Error al crear el producto:', error);
    throw error; // Propagar el error para manejo externo
  }
}

function getProducts() {
  return Product.find();
}

function getProductsByCompany(companyId) {
  return Product.find({ compania: companyId });
}

module.exports = { crearProducto, getProducts, getProductsByCompany }; 