// permisos de login y de visualisar modulos 

const Permiso = require('../moduls/permission');
const { check, validationResult } = require('express-validator');

// Middleware para validar permisos
exports.validatePermiso = [
    check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    check('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
    check('accion').notEmpty().withMessage('La acción es obligatoria'),
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
        const { nombre, descripcion, accion } = req.body;
        const permiso = await Permiso.find
ByIdAndUpdate(id, { nombre, descripcion, accion }, { new: true });
        if (!permiso) {
        return res.status(404).json({ msg: 'Permiso no encontrado' });
        }
        res.json({ msg: 'Permiso actualizado', permiso });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
}
