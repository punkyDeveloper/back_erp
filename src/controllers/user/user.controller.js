const { createUser, getUsers, updateUser, deleteUser, getAdministradores } = require('./user');
const argon2 = require('argon2');
const { body, validationResult } = require('express-validator');
const User = require('../../moduls/user');

// ── Validaciones de creación de usuario ────────────────────────────────────────
const createUserValidations = [
  body('name')
    .trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('Nombre: entre 2 y 50 caracteres')
    .escape(),
  body('apellido')
    .trim().notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('Apellido: entre 2 y 50 caracteres')
    .escape(),
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('user')
    .trim().notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 30 }).withMessage('Usuario: entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Usuario solo puede tener letras, números y _.-')
    .escape(),
  body('rol_id')
    .notEmpty().withMessage('El rol es obligatorio')
    .isMongoId().withMessage('rol_id inválido'),
  body('compania')
    .notEmpty().withMessage('La compañía es obligatoria')
    .isMongoId().withMessage('compania inválida'),
];

/**
 * Crear un nuevo usuario
 */
exports.createUser = [
  ...createUserValidations,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ msg: 'Datos inválidos', errors: errors.array() });
      }

      const { name, email, rol_id, user, apellido, compania } = req.body;

      // Validar que no exista el email en la db
      const existingUsers = await getUsers();
      const emailExists = existingUsers.some(u => u.email === email);
      if (emailExists) {
        return res.status(400).json({ msg: 'El correo ya está en uso' });
      }

      // Crear contraseña aleatoria con crypto seguro
      const { randomBytes } = require('crypto');
      const password = randomBytes(12).toString('base64').slice(0, 12);

      // Encriptar la contraseña con Argon2id
      const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

      // Crear el usuario y enviar el correo
      await createUser({
        name,
        email,
        rol_id,
        user,
        apellido,
        compania,
        hashedPassword,
        passwordPlain: password, // Solo se usa internamente para enviarlo por email
      });

      // No se devuelve la contraseña en la respuesta
      return res.status(201).json({
        msg: 'Usuario creado y correo enviado con las credenciales',
        email,
      });

    } catch (error) {
      console.error('[createUser]', error);
      return res.status(500).json({ msg: 'Error al crear el usuario' });
    }
  },
];

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    console.error('[getUsers]', error);
    res.status(500).json({ msg: 'Error al obtener los usuarios' });
  }
};

// Actualizar usuario — requiere contraseña actual si el propio usuario cambia su password
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, rol_id, user, apellido, compania, estado, currentPassword, newPassword } = req.body;

    let hashedPassword;
    if (newPassword) {
      // Si el usuario está cambiando su propia contraseña, exigir la actual
      if (req.user.id === id) {
        if (!currentPassword) {
          return res.status(400).json({ msg: 'Debes proporcionar tu contraseña actual para cambiarla' });
        }
        const userDoc = await User.findById(id).select('+password');
        if (!userDoc) {
          return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        const valid = await argon2.verify(userDoc.password, currentPassword);
        if (!valid) {
          return res.status(401).json({ msg: 'La contraseña actual es incorrecta' });
        }
      }
      // Longitud mínima
      if (newPassword.length < 8) {
        return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 8 caracteres' });
      }
      hashedPassword = await argon2.hash(newPassword, { type: argon2.argon2id });
    }

    await updateUser(id, { name, email, rol_id, user, apellido, compania, estado, hashedPassword });

    return res.json({ msg: 'Usuario actualizado' });

  } catch (error) {
    console.error('[updateUser]', error);
    return res.status(500).json({ msg: 'Error al actualizar el usuario' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    return res.json({ msg: 'Usuario eliminado' });
  } catch (error) {
    console.error('[deleteUser]', error);
    return res.status(500).json({ msg: 'Error al eliminar el usuario' });
  }
};

// Solo ver administradores
exports.getAdministradores = async (req, res) => {
  try {
    const users = await getAdministradores();
    return res.json(users);
  } catch (error) {
    console.error('[getAdministradores]', error);
    return res.status(500).json({ msg: 'Error al obtener los administradores' });
  }
};
