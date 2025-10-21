const User = require('../../moduls/user');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Controlador de login de usuarios
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos"
      });
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido"
      });
    }

    // Buscar usuario por email (sin incluir password en la query)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas"
      });
    }

    // Verificar contraseña con Argon2id
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas"
      });
    }

    // Verificar si el usuario está activo
    if (!user.estado) {
      return res.status(403).json({
        success: false,
        message: "Usuario inactivo. Contacta al administrador"
      });
    }

    // Verificar que el usuario tenga una compañía asignada
    if (!user.compania) {
      return res.status(400).json({
        success: false,
        message: "El usuario no tiene una compañía asignada"
      });
    }

    // Crear payload para el token
    const payload = {
      id: user._id.toString(),
      compania: user.compania.toString(),
      rol: user.rol
    };

    // Generar token JWT (usando promesas)
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '1h' }
    );

    // Configuración de cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hora en milisegundos
    };

    // Establecer cookies
    res.cookie('token', token, cookieOptions);
    res.cookie('companiaId', user.compania.toString(), cookieOptions);

    // Respuesta exitosa (sin enviar el token en el body si ya está en cookie)
    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        id: user._id,
        nombre: user.nombre || user.user, // Adaptable según tu modelo
        email: user.email,
        rol: user.rol,
        companiaId: user.compania
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    
    // No exponer detalles del error en producción
    const message = process.env.NODE_ENV === 'production'
      ? "Error en el servidor"
      : error.message;

    return res.status(500).json({
      success: false,
      message
    });
  }
};