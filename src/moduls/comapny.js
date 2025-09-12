const mongodb = require('../db/mongodb');

const SchemaCompani = new mongodb.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    nit: {
        type: String,
        required: true,
        trim: true,
    },

    nombreCompany: {
        type: String,
        required: true,
        trim: true,
    },
    
}, {timestamps: true});

const newCompani = mongodb.model('compani', SchemaCompani);

module.exports = newCompani;  