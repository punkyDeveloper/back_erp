const mongoose = require('../db/mongodb');

const SchemaPermiso = new mongoose.Schema({
 nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  accion: {
    type: [String],
    enum: ['Ver', 'Editar', 'Eliminar', 'Crear'],
    required: true,
  },
}, {timestamps: true});

const newPermiso = mongoose.model('Permiso', SchemaPermiso);

module.exports = newPermiso;