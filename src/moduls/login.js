const mongodb = require('../db/mongodb');

const SchemaCompanie = new mongodb.Schema({
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
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    nit: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,
        default: true,
    },
    nombreCompany: {
        type: String,
        required: true,
        trim: true,
    },
    
}, {timestamps: true});

const newCompanie = mongodb.model('companie', SchemaCompanie);

module.exports = newCompanie;