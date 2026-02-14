// controllers/token/tokenController.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateToken = async (req, res) => {
  try {
    const payload = {
      id: "test-user-id",
      nombre: "Test nombre",
      compania: "test-compania-id",
      rol: "Admin",
      roleId: "test-role-id"
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      // { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al generar token"
    });
  }
};