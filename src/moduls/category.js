const mongoose = require('../db/mongodb');

const SchemaEntry = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Se requiere un el nombre'],
    unique: true,
  },
  // id 
  
}, {timestamps: true});

const nuevoEntry = mongoose.model('Entry', SchemaEntry);

module.exports = nuevoEntry;