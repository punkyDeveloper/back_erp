const User = require('../../moduls/user'); // Ajusta la ruta si es necesario
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: "Por favor ingresa todos los campos" 
      });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        msg: "El usuario no existe" 
      });
    }

    // Verificar contraseña (si quieres activarlo con bcrypt)
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ 
    //     success: false,
    //     msg: "Contraseña incorrecta" 
    //   });
    // }

    const payload = {
      user: { id: user.id }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;

      // Guardar el token en cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600 * 1000 // 1 hora
      });

      // Enviar token + estado en JSON
      res.json({
        success: true,
        msg: "Login exitoso",
        token
      });
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false,
      msg: "Error en el servidor" 
    });
  }
};
