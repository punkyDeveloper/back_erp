const mongoose = require('../db/mongodb');

const SchemaEntry = new mongoose.Schema({

  // id del usuario  hora de entrada y hora de salida 
  
}, {timestamps: true});

const nuevoEntry = mongoose.model('Entry', SchemaEntry);

module.exports = nuevoEntry;