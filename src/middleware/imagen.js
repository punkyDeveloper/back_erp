const multer = require('multer');
const path = require('path');
const cloudinary = require('./cloudinary');

// Usar memoryStorage: Vercel tiene filesystem de solo lectura
const storage = multer.memoryStorage();

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
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
});

// Sube la imagen al buffer directamente a Cloudinary (sin escribir en disco)
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'productos',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          max_bytes: 5 * 1024 * 1024,
          overwrite: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    if (!result.secure_url) {
      throw new Error('Cloudinary no devolvió una URL segura');
    }

    req.file.cloudinaryUrl = result.secure_url;
    req.file.public_id = result.public_id;

    next();
  } catch (error) {
    console.error('[uploadToCloudinary]', error);
    return res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

module.exports = { upload, uploadToCloudinary };
