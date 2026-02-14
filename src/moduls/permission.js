const mongoose = require('../db/mongodb');

const SchemaPermiso = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
    // Ejemplo: 'ver_productos', 'crear_usuarios', 'editar_ventas'
  },
  modulo: {
    type: String,
    required: true,
    trim: true
    // Ejemplo: 'productos', 'usuarios', 'ventas', 'reportes'
  },
  descripcion: {
    type: String,
    required: true,
  },
  accion: {
    type: String,
    enum: ['Ver', 'Editar', 'Eliminar', 'Crear', 'Exportar', 'Importar'],
    required: true,
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto para asegurar que no se repita la combinación módulo + acción
SchemaPermiso.index({ modulo: 1, accion: 1 }, { unique: true });

const Permiso = mongoose.model('Permiso', SchemaPermiso);

module.exports = Permiso;