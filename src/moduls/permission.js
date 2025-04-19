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
  acciones: {
    type: [String],
    enum: ['Ver', 'Editar', 'Eliminar'],
    required: true,
  },
}, {timestamps: true});

const newPermiso = mongoose.model('Permiso', SchemaPermiso);

module.exports = newPermiso;