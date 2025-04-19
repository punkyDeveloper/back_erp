const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('Error: La URI de MongoDB no está definida en las variables de entorno.');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conexión a MongoDB exitosa');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

module.exports = mongoose;
