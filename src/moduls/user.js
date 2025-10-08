const mongoose = require('../db/mongodb');

const SchemaUserl = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    apellido: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: String,
        required: true,
        trim: true,
    },
    rol: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,
        default: true
    },
    compania: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Compania', // Ajusta el nombre del modelo si es diferente
        required: true
    }
}, {
    timestamps: true
});

const nuevoUsuario = mongoose.model('usuario', SchemaUserl);

module.exports = nuevoUsuario;