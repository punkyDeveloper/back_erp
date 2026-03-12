const mongodb = require('../db/mongodb');

// ─── Sub-schema: Servicio aplicado ───────────────────────────────────────────
// Cada servicio que se le hace al vehículo: nombre + precio cobrado al cliente
const SchemaServicio = new mongodb.Schema({
  servicioId: {
    type: mongodb.Schema.Types.ObjectId,
    ref: 'servicio',   // referencia al catálogo de servicios
    default: null,
  },
  supServicioId: {
    type: mongodb.Schema.Types.ObjectId,
    ref: 'supServicio', // referencia al sub-servicio si aplica
    default: null,
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    default: 0,
  },
}, { _id: false }); // _id: false para que no genere _id por cada servicio

// ─── Sub-schema: Repuesto / Producto ─────────────────────────────────────────
// precioVenta → lo que ve y paga el cliente (aparece en factura)
// costo       → lo que le costó al taller (PRIVADO, nunca va al cliente)
// ganancia    → calculado automáticamente: precioVenta - costo
const SchemaRepuesto = new mongodb.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  precioVenta: {
    type: Number,
    required: true,
    default: 0,
  },
  costo: {
    type: Number,
    required: true,
    default: 0, // privado
  },
  ganancia: {
    type: Number,
    default: 0, // se calcula: precioVenta - costo
  },
}, { _id: false });

// ─── Schema principal de Mecánica ─────────────────────────────────────────────
const SchemaMecanica = new mongodb.Schema({

  // ── Datos del vehículo y cliente ──────────────────────────────────────────
  placa: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  vehiculo: {           // corregido de 'vehículo' (sin tilde para evitar problemas)
    type: String,
    required: true,
    trim: true,
  },
  cedula: {             // cédula del cliente
    type: String,
    required: true,
    trim: true,
  },
  kilometraje: {
    type: Number,
    required: true,
    default: 0,
  },

  // ── Clasificación del mantenimiento ──────────────────────────────────────
  // Preventivo | Correctivo | Predictivo → genera INGRESO al finalizar
  // Garantía                             → genera EGRESO  al finalizar
  tipo: {
    type: String,
    required: true,
    trim: true,
    enum: ['Preventivo', 'Correctivo', 'Predictivo', 'Garantía'],
    default: 'Preventivo',
  },

  // ── Estado del trabajo ────────────────────────────────────────────────────
  estado: {
    type: String,
    required: true,
    trim: true,
    enum: ['Pendiente', 'En progreso', 'En espera', 'Finalizado', 'Cancelado'],
    default: 'Pendiente',
  },

  // ── Fecha y taller ────────────────────────────────────────────────────────
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
  },
  taller: {
    type: String,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  mecanico: {
    type: String,
    trim: true,
  },

  // ── Servicios (mano de obra) → ARREGLO de objetos ────────────────────────
  // Cada elemento: { servicioId, nombre, precio }
  servicios: {
    type: [SchemaServicio],
    default: [],
  },

  // ── Repuestos / Productos → ARREGLO de objetos ───────────────────────────
  // Cada elemento: { nombre, precioVenta, costo (privado), ganancia }
  repuestos: {
    type: [SchemaRepuesto],
    default: [],
  },

  // ── Totales calculados (se llenan al guardar/finalizar) ───────────────────
  totalServicios: {
    type: Number,
    default: 0,                   // suma de servicios[].precio
  },
  totalRepuestosVenta: {
    type: Number,
    default: 0,                   // suma de repuestos[].precioVenta → va a factura
  },
  totalRepuestosCosto: {
    type: Number,
    default: 0,                   // suma de repuestos[].costo → PRIVADO
  },
  gananciaRepuestos: {
    type: Number,
    default: 0,                   // totalRepuestosVenta - totalRepuestosCosto
  },
  costoTotal: {
    type: Number,
    default: 0,                   // totalServicios + totalRepuestosVenta → lo que paga el cliente
  },

  // ── Referencias a otros módulos (se llenan al finalizar) ─────────────────
  movimientoId: {
    type: mongodb.Schema.Types.ObjectId,
    ref: 'movimiento',            // enlace al ingreso o egreso registrado
    default: null,
  },
  finanzasId: {
    type: mongodb.Schema.Types.ObjectId,
    ref: 'finanzasMecanica',      // enlace al resumen financiero privado
    default: null,
  },
  finalizadoEn: {
    type: Date,
    default: null,
  },

  // ── Relaciones ────────────────────────────────────────────────────────────
  compania: {
    type: mongodb.Schema.Types.ObjectId,
    ref: 'compani',
    required: true,
  },
  creadoPor: {
    type: mongodb.Schema.Types.ObjectId,
    ref: 'user',
    default: null,
  },

}, { timestamps: true });

// ─── Índices para búsquedas rápidas ──────────────────────────────────────────
SchemaMecanica.index({ compania: 1, estado: 1 });
SchemaMecanica.index({ compania: 1, placa: 1 });
SchemaMecanica.index({ compania: 1, cedula: 1 });
SchemaMecanica.index({ compania: 1, fecha: -1 });

const Mecanica = mongodb.model('mecanica', SchemaMecanica);

module.exports = Mecanica;