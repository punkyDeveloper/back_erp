const mongoose = require('../db/mongodb');

const itemVentaSchema = new mongoose.Schema({
  producto:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  cantidad:       { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true, min: 0 },
  subtotal:       { type: Number, required: true, min: 0 },
}, { _id: false });

const ventaSchema = new mongoose.Schema({
  companiaId:     { type: String, required: true, index: true },
  numeroFactura:  { type: String, default: '' },
  clienteNombre:  { type: String, default: '' },
  items:         { type: [itemVentaSchema], default: [] },
  subtotal:      { type: Number, required: true, default: 0 },
  descuento:     { type: Number, default: 0 },
  total:         { type: Number, required: true, default: 0 },
  metodoPago:    { type: String, enum: ['efectivo', 'tarjeta', 'transferencia'], default: 'efectivo' },
  notas:         { type: String, default: '' },
  estado:        { type: String, enum: ['borrador', 'finalizada', 'cancelada'], default: 'borrador', index: true },
}, { timestamps: true });

ventaSchema.index({ companiaId: 1, estado: 1, createdAt: -1 });

module.exports = mongoose.model('Venta', ventaSchema);
