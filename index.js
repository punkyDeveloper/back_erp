const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const router = require('./src/routers/router');
const { connectDB } = require('./src/db/mongodb');

// ── Seguridad: cabeceras HTTP (XSS, clickjacking, MIME sniffing, etc.) ─────────
app.use(helmet());

// ── CORS: solo orígenes autorizados ────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (ej. Postman en dev) solo fuera de prod
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origen no permitido → ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// ── Limitar tamaño de body para prevenir DoS ────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// ── Logging ─────────────────────────────────────────────────────────────────────
app.use(morgan('tiny'));

// ── Middleware: conectar a MongoDB antes de cada request (con caché) ────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error.message);
    res.status(503).json({ success: false, message: 'Servicio no disponible. Error de base de datos.' });
  }
});

// ── Rutas ────────────────────────────────────────────────────────────────────────
app.use('/v1/', router);

// ── Servidor local (no se ejecuta en Vercel) ─────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_SERVER === 'true') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Conectado en el puerto ${PORT}`);
  });
}

module.exports = app;
