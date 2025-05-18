const mongoose = require('../db/mongodb');

const SchemaRole = new mongoose.Schema({
 nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  permisos: {
    type: [String],
    enum: [permisos],
    required: true,
  }
}, {timestamps: true});

const newRole = mongoose.model('Role', SchemaRole);

module.exports = newRole;