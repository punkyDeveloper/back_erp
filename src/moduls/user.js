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
    permisos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'permisos',
        required: true, 
    },
    rol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',
        required: true,
    },
}, {timestamps: true});

const nuevoUsuario = mongoose.model('usuario', SchemaUserl);

module.exports = nuevoUsuario;