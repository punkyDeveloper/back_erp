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
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: String,
        trim: true,
    },
    rol: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,

    },
    compania: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }

}, {timestamps: true});

const nuevoUsuario = mongoose.model('usuario', SchemaUserl);

module.exports = nuevoUsuario;