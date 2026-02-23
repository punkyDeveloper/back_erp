const mongodb = require('../db/mongodb');

const SchemaSupServicios = new mongodb.Schema({
    supnombre: {
        type: String,
        required: [true, 'Se requiere un nombre para el subservicio'],
    },
    suptiempo: {
        type: Number,
        required: [true, 'Se requiere un tiempo para el subservicio'],
    },
    supvalor: {
        type: Number,
        required: [true, 'Se requiere un valor para el subservicio'],
    }
}, { timestamps: true });

const SupServicios = mongodb.model('SupServicios', SchemaSupServicios);

module.exports = SupServicios;
