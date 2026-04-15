const Product = require('../../moduls/product');

async function crearProducto({ name, description, price, venta, alquiler, img, compania, stock }) {
  const newProduct = new Product({ name, description, price, venta, alquiler, img, stock, compania });
  await newProduct.save();
  return newProduct;
}

function getProducts() {
  return Product.find();
}

function getProductsByCompany(companyId) {
  return Product.find({ compania: companyId });
}

async function editarProducto(id, data) {
  return Product.findByIdAndUpdate(id, data, { new: true });
}

async function eliminarProducto(id) {
  return Product.findByIdAndDelete(id);
}

module.exports = { crearProducto, getProducts, getProductsByCompany, editarProducto, eliminarProducto };
