const mongoose = require('../db/mongodb');

const SchemaRol = new mongoose.Schema({
  rol: {
    type: String,
    required: [true, 'Se requiere un el rol'],
    unique: true,
  },
  descripcion: {
    type: String,
    required: [true, 'Se requiere una Descripcion'],
    
  },  
  permisos: {
    type: String,
    // required: [true, 'Se requiere una permisos'],
    
  },
}, {timestamps: true});

const nuevoRol = mongoose.model('Rol', SchemaRol);

module.exports = nuevoRol;