const mongodb = require('../db/mongodb');

const SchemaServicios = new mongodb.Schema({
    nombre: {
        type: String,
        required: [true, 'Se requiere un nombre para el servicio'],
    },
    tiempo: {
        type: Number,
        required: [true, 'Se requiere un tiempo para el servicio'],
    },
    valor: {
        type: Number,
        required: [true, 'Se requiere un valor para el servicio'],
    },
    idSupservicios: {
        type: Array,
        default: []
    }
}, { timestamps: true });

const Servicios = mongodb.model('Servicios', SchemaServicios);

module.exports = Servicios;