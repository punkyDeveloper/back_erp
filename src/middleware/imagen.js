
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('./cloudinary');

// Carpeta destino
const uploadDir = path.join(__dirname, '../uploads/products');

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const productName = req.body.name
      ? req.body.name.replace(/\s+/g, '_').toLowerCase()
      : 'producto';

    const ext = path.extname(file.originalname);

    // Usar timestamp para asegurar nombres únicos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    cb(null, `${productName}_${uniqueSuffix}${ext}`);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // máximo 5MB
});

// 🔹 Middleware para subir la imagen a Cloudinary después de multer
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'productos'
    });

    // Borrar imagen local después de subir
    fs.unlinkSync(req.file.path);

    // Guardar info en request para usar en el controlador
    req.file.cloudinaryUrl = result.secure_url;
    req.file.public_id = result.public_id;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al subir la imagen a Cloudinary' });
  }
};

module.exports = { upload, uploadToCloudinary };
