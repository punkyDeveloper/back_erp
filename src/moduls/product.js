import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  venta: { type: Boolean, default: false },   // 👈 true o false
  alquiler: { type: Boolean, default: false }, // 👈 true o false
  img: { type: String, required: true },       // ruta de la imagen subida
  compania: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
