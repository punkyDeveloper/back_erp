const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema(
  {
    empresa: { type: String, required: true, index: true },

    nombre:             { type: String, required: [true, "El nombre es requerido"], trim: true },
    tipoDocumento:      { type: String, enum: ["NIT", "CC", "CE", "Pasaporte", "RUT"], required: true },
    numeroDocumento:    { type: String, required: [true, "El número de documento es requerido"], trim: true },
    digitoVerificacion: { type: String, default: "" },
    tipoPersona:        { type: String, enum: ["Natural", "Jurídica"], default: "Jurídica" },

    email:    { type: String, required: [true, "El email es requerido"], trim: true, lowercase: true },
    telefono: { type: String, default: "" },
    celular:  { type: String, default: "" },

    departamento: { type: String, default: "" },
    ciudad:       { type: String, default: "" },
    direccion:    { type: String, default: "" },
    codigoPostal: { type: String, default: "" },

    regimenFiscal:     { type: String, enum: ["Responsable de IVA","No Responsable de IVA","Gran Contribuyente","Régimen Simple"], default: "No Responsable de IVA" },
    tipoContribuyente: { type: String, enum: ["Ordinario","Gran Contribuyente","Autorretenedor","No Contribuyente"], default: "Ordinario" },
    responsableIVA:    { type: Boolean, default: false },
    nombreComercial:   { type: String,  default: "" },

    resolucionDian:    { type: String, default: "" },
    prefijoDian:       { type: String, default: "" },
    autorizacionDian:  { type: String, default: "" },
    fechaVigenciaDian: { type: Date,   default: null },
    rangoInicial:      { type: Number, default: null },
    rangoFinal:        { type: Number, default: null },
    consecutivoActual: { type: Number, default: null },

    correoFactura: { type: String, default: "" },
    notasFactura:  { type: String, default: "" },

    // "ver_web" cuando tiene acceso, "" cuando no
    permiso: { type: String, default: "" },

    // Vehículos / motos del cliente (pueden ser varios)
    motos: [
      {
        placa:    { type: String, default: "" },
        vehiculo: { type: String, default: "" }, // Marca, modelo y año. Ej: "Honda CB125F 2022"
      }
    ],

    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

clienteSchema.index({ empresa: 1, numeroDocumento: 1 }, { unique: true });

module.exports = mongoose.model("Cliente", clienteSchema);