const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Cache de la conexión para reutilizarla entre invocaciones serverless
let connectionPromise = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI no está definida en las variables de entorno.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then(() => {
        console.log('✅ Conexión a MongoDB exitosa');
        return mongoose;
      })
      .catch((error) => {
        connectionPromise = null; // reset para permitir reintento
        console.error('❌ Error conectando a MongoDB:', error.message);
        throw error;
      });
  }

  return connectionPromise;
};

// Retrocompatible: los modelos hacen `require('../db/mongodb')` y obtienen mongoose
// Para conectar explícitamente usar `.connectDB()`
module.exports = mongoose;
module.exports.connectDB = connectDB;
