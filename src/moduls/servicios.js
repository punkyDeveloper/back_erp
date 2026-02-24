const mongodb = require('../db/mongodb');

const SchemaServicios = new mongodb.Schema({
    nombre: {
        type: String,

    },
    tiempo: {
        type: String, // ✅ String para valores como "2 semanas", "3 días"

    },
    valor: {
        type: Number,

    },
    idSupservicios: [{
        type: mongodb.Schema.Types.ObjectId,
        ref: 'SupServicios' // ✅ debe coincidir con el nombre del modelo en supServicios.js
    }],
    compania: { type: mongodb.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

const Servicios = mongodb.model('Servicios', SchemaServicios);

module.exports = Servicios;