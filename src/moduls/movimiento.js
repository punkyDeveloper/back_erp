const mongoose = require('../db/mongodb');

const SchemaMovimiento = new mongoose.Schema({
    tipo_movimiento: {
      type: String,
      required: true,
      enum: ['ingreso', 'egreso']
    },
    referencia: {
      type: String,
      required: true
    },
    fecha: {
      type: Date,
      required: true
    },
    valor: {
      type: Number,
      required: true,
      min: 1
    },
    tipo: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      required: true,
      trim: true
    },
    compania: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Compania', // Ajusta el nombre del modelo si es diferente
        required: true
    },
nombre: {
  type: String,
  required: true
},
}, {timestamps: true});

const nuevoMovimiento = mongoose.model('Movimiento', SchemaMovimiento);

module.exports = nuevoMovimiento;