const mongodb = require('../db/mongodb');

const SchemaSupServicios = new mongodb.Schema({
    supnombre: {
        type: String,

    },
    suptiempo: {
        type: String,

    },
    supvalor: {
        type: Number,

    },
    descripcion: {
        type: String,
        default: ''
    },
    compania: { type: mongodb.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

const SupServicios = mongodb.model('SupServicios', SchemaSupServicios);

module.exports = SupServicios;
