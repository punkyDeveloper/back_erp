const mongoose = require('../db/mongodb');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // "factura_<companiaId>"
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
