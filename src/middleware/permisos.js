// permisos de login y de visualisar modulos 

const Permiso = require('../moduls/permission');
const { check, validationResult } = require('express-validator');
const User = require('../moduls/user');
const RolModel = require('../moduls/rol');

// Middleware para validar permisos
exports.validatePermiso = [
    check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    check('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
    check('accion').notEmpty().withMessage('La acción es obligatoria'),
    check('modulo').notEmpty().withMessage('El módulo es obligatorio'),
];

// Middleware para verificar si el permiso existe
exports.checkPermisoExists = async (req, res, next) => {
    const { nombre } = req.body;
    try {
        const permiso = await Permiso.findOne({ nombre });
        if (permiso) {
            return res.status(400).json({ msg: 'El permiso ya existe' });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
}

// Middleware para manejar errores de validación
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// Middleware para verificar si el usuario tiene un permiso específico
exports.hasPermission = (permisoRequerido) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(403).json({ msg: 'Usuario no encontrado' });
            }

            const rol = await RolModel.findOne({ rol: user.rol });

            if (!rol) {
                return res.status(403).json({ msg: 'Rol no encontrado' });
            }

            // Extraer nombres de permisos si son objetos
            const permisos = rol.permisos.map(p => 
                typeof p === 'string' ? p : p.nombre
            );

            if (!permisos.includes(permisoRequerido)) {
                return res.status(403).json({ 
                    msg: 'No tienes permisos para esta acción',
                    permisoRequerido
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando permisos:', error);
            res.status(500).json({ msg: 'Error del servidor' });
        }
    };
};

// Obtener un permiso por ID
exports.getPermisoById = async (req, res) => {
    try {
        const { id } = req.params;
        const permiso = await Permiso.findById(id);
        if (!permiso) {
            return res.status(404).json({ msg: 'Permiso no encontrado' });
        }
        res.json(permiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
}

// Actualizar un permiso
exports.updatePermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, accion, modulo } = req.body;
        const permiso = await Permiso.findByIdAndUpdate(
            id, 
            { nombre, descripcion, accion, modulo }, 
            { new: true }
        );
        if (!permiso) {
            return res.status(404).json({ msg: 'Permiso no encontrado' });
        }
        res.json({ msg: 'Permiso actualizado', permiso });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
}