const mongoose = require('../db/mongodb');

const productSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  price: { type: Number },
  precio_costo: { type: Number, default: 0 },
  venta: { type: Boolean },
  alquiler: { type: Boolean },
  img: { type: String },
  stock: { type: Number, default: 0 },
  compania: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
