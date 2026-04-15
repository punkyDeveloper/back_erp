const mongoose = require('../db/mongodb');

const servicioItemSchema = new mongoose.Schema({
  servicioId:    { type: mongoose.Schema.Types.ObjectId, ref: "Servicio",    default: null },
  supServicioId: { type: mongoose.Schema.Types.ObjectId, ref: "SubServicio", default: null },
  nombre:        { type: String, required: true, trim: true },
  precio:        { type: Number, default: 0, min: 0 },
}, { _id: false });

const productoItemSchema = new mongoose.Schema({
  nombre:      { type: String, required: true, trim: true },
  precioVenta: { type: Number, default: 0, min: 0 }, // lo que paga el cliente
  costo:       { type: Number, default: 0, min: 0 }, // costo real del mecánico
}, { _id: false });

const mecanicaSchema = new mongoose.Schema({
  companiaId: { type: String, required: true, index: true },

  // ── Vehículo ────────────────────────────────────────────────────────────────
  cedula:      { type: String, required: true, trim: true },
  placa:       { type: String, required: true, trim: true, uppercase: true },
  vehiculo:    { type: String, required: true, trim: true },
  tipo:        { type: String, enum: ["Preventivo","Correctivo","Predictivo","Garantía"], default: "Preventivo" },
  descripcion: { type: String, required: true, trim: true },
  kilometraje: { type: Number, default: 0, min: 0 },
  fecha:       { type: Date, default: Date.now },
  estado:      { type: String, enum: ["Pendiente","En progreso","En espera","Finalizado","Cancelado"], default: "Pendiente" },
  taller:      { type: String, default: "", trim: true },

  // ── Snapshot del cliente (para factura, independiente de si existe en BD) ───
  clienteId:            { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", default: null },
  nombreCliente:        { type: String, default: "", trim: true },
  emailCliente:         { type: String, default: "", trim: true, lowercase: true },
  telefonoCliente:      { type: String, default: "" },
  ciudadCliente:        { type: String, default: "" },
  tipoDocumentoCliente: { type: String, default: "CC" },

  // ── Items ───────────────────────────────────────────────────────────────────
  servicios: [servicioItemSchema],
  productos:  [productoItemSchema],

  // ── Totales (calculados en el servicio, nunca desde el front) ───────────────
  costoCliente:  { type: Number, default: 0, min: 0 },  // servicios + precioVenta productos
  gananciaTotal: { type: Number, default: 0 },           // servicios + (precioVenta - costo) productos

  // ── Referencias financieras (se llenan al finalizar) ────────────────────────
  movimientoId: { type: mongoose.Schema.Types.ObjectId, ref: "Movimiento", default: null },
  facturaId:    { type: mongoose.Schema.Types.ObjectId, ref: "Factura",    default: null },

}, { timestamps: true });

mecanicaSchema.index({ companiaId: 1, estado: 1 });
mecanicaSchema.index({ companiaId: 1, cedula:  1 });
mecanicaSchema.index({ companiaId: 1, placa:   1 });

module.exports = mongoose.model("Mecanica", mecanicaSchema);