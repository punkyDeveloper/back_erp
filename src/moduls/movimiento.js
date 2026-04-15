const mongoose = require('../db/mongodb');

const SchemaMovimiento = new mongoose.Schema({
  tipo_movimiento: {
    type: String,
    required: true,
    enum: ['ingreso', 'egreso'],
  },
  referencia: {
    type: String,
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
    min: 0,           // ← era min:1, Garantía necesita 0
  },
  ganancia: {
    type: Number,
    default: 0,       // ← NUEVO: ganancia real del negocio (puede ser negativa en garantía)
  },
  tipo: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  compania: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Compania',
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  modulo: {
    type: String,
    enum: ['mecanica', 'pos', 'restaurante', 'bodega', 'manual'],
    default: 'manual',
  },
  referenciaId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  // ─── Campos libro contable ────────────────────────────────────────────────
  estado: {
    type: String,
    enum: ['activo', 'anulado'],
    default: 'activo',
  },
  metodo_pago: { type: String, trim: true },
  proveedor:   { type: String, trim: true },
  notas:       { type: String, trim: true },
  iva:         { type: Number, default: 0 },
  numero_factura:    { type: String, trim: true },
  cliente_nombre:    { type: String, trim: true },
  cliente_documento: { type: String, trim: true },
  referencia_ext:    { type: String, trim: true },
}, { timestamps: true });

SchemaMovimiento.index({ compania: 1, tipo_movimiento: 1, fecha: -1 });
SchemaMovimiento.index({ compania: 1, modulo: 1, fecha: -1 });

const nuevoMovimiento = mongoose.model('Movimiento', SchemaMovimiento);

module.exports = nuevoMovimiento;