const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Configurar el transportador de correo
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER, // Tu correo
    pass: process.env.EMAIL_PASSWORD, // Tu contraseña de aplicación
  },
});

/**
 * Enviar correo de bienvenida con credenciales
 */
async function enviarCredenciales({ email, nombre, apellido, usuario, password }) {
  // La URL de la aplicación se toma de la variable de entorno; nunca hardcodeada
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  try {
    const mailOptions = {
      from: `"Sistema ERP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Credenciales de Acceso - Sistema ERP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .credentials { background-color: #f0f0f0; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
            .credential-item { margin: 10px 0; }
            .credential-label { font-weight: bold; color: #007bff; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenido al Sistema ERP</h1>
            </div>
            <div class="content">
              <h2>Hola ${nombre} ${apellido},</h2>
              <p>Tu cuenta ha sido creada exitosamente. A continuacion encontraras tus datos de acceso:</p>

              <div class="credentials">
                <div class="credential-item">
                  <span class="credential-label">Usuario:</span> ${usuario}
                </div>
                <div class="credential-item">
                  <span class="credential-label">Correo:</span> ${email}
                </div>
                <div class="credential-item">
                  <span class="credential-label">Contrasena temporal:</span> ${password}
                </div>
              </div>

              <div class="warning">
                <strong>IMPORTANTE:</strong> Esta es una contrasena temporal de un solo uso.
                Debes cambiarla inmediatamente despues de tu primer inicio de sesion.
                El correo electronico es el unico lugar donde recibiras esta contrasena.
              </div>

              <p>Accede al sistema en: <a href="${appUrl}">${appUrl}</a></p>

              <p>Si tienes alguna duda, contacta al administrador.</p>

              <p>Saludos,<br><strong>Equipo ERP</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automatico, por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error;
  }
}

/**
 * Verificar configuración del transportador
 */
async function verificarConfiguracion() {
  try {
    await transporter.verify();
    console.log('✅ Servidor de correo listo para enviar mensajes');
    return true;
  } catch (error) {
    console.error('❌ Error en la configuración del servidor de correo:', error);
    return false;
  }
}

module.exports = {
  enviarCredenciales,
  verificarConfiguracion,
};