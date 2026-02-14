const express = require('express');
const login = require('../controllers/login/login');
const usuario = require('../controllers/user/user.controller');
const permisosController = require('../controllers/permisos/permisos');
const permisosMiddleware = require('../middleware/permisos');
const Role = require('../controllers/roles/roles');
const Company = require('../controllers/user/compania.controler');
const Productos = require('../controllers/productos/productController');
const tokenController = require('../controllers/token/tokenController');
// movimientos
const Movimientos = require('../controllers/tipo_movimiento/tipo_movimiento');

const apiKeyMiddleware = require('../middleware/apiKey');
const authMiddleware = require('../middleware/authMiddleware');
const {upload, uploadToCloudinary} = require('../middleware/imagen');

const router = express.Router();

router.get("/token", tokenController.generateToken);

// ====== Login (sin protección) ======
router.post('/login', login.login);

// ====== Obtener permisos del usuario logueado ======
// En routers/router.js
router.get('/me/permisos', authMiddleware, async (req, res) => {
  try {
    const User = require('../moduls/user');
    const RolModel = require('../moduls/rol');
    
    const user = await User.findById(req.user.id);
    const rol = await RolModel.findOne({ rol: user.rol });
    
    // Extraer solo los nombres si son objetos
    const permisos = rol?.permisos.map(p => 
      typeof p === 'string' ? p : p.nombre
    ) || [];
    
    res.json({ 
      permisos,
      rol: user.rol 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'Error al obtener permisos' });
  }
});

// ====== Roles ======
router.post('/roleC', authMiddleware, permisosMiddleware.hasPermission('crear_roles'), Role.roleCreate);
router.get('/role', authMiddleware, permisosMiddleware.hasPermission('ver_roles'), Role.getRoles);
router.post("/roles", authMiddleware, permisosMiddleware.hasPermission('crear_roles'), Role.roleCreate);
router.get("/roles", authMiddleware, permisosMiddleware.hasPermission('ver_roles'), Role.getRoles);
router.post("/roles/:id", authMiddleware, permisosMiddleware.hasPermission('editar_roles'), Role.updateRole);

// ====== Usuarios ======
router.post("/usuario", authMiddleware, permisosMiddleware.hasPermission('crear_usuarios'), usuario.createUser);
router.get("/usuarios", authMiddleware, permisosMiddleware.hasPermission('ver_usuarios'), usuario.getUsers);
router.put("/usuario/:id", authMiddleware, permisosMiddleware.hasPermission('editar_usuarios'), usuario.updateUser);
router.delete("/usuario/:id", authMiddleware, permisosMiddleware.hasPermission('eliminar_usuarios'), usuario.deleteUser);
router.get("/administradores", authMiddleware, permisosMiddleware.hasPermission('ver_usuarios'), usuario.getAdministradores);

// ====== Permisos ======
router.post("/permisos", authMiddleware, permisosMiddleware.hasPermission('crear_permisos'), permisosController.permiso);
router.get("/permisos", authMiddleware, permisosMiddleware.hasPermission('ver_permisos'), permisosController.getPermisos);
router.get("/permisosN", authMiddleware, permisosMiddleware.hasPermission('ver_permisos'), permisosController.getPermisoByName);

// ====== Compañías ======
router.post("/companias", authMiddleware, permisosMiddleware.hasPermission('crear_companias'), Company.createCompany);

// ====== Productos ======
router.post("/productos", authMiddleware, permisosMiddleware.hasPermission('crear_productos'), upload.single("img"), uploadToCloudinary, Productos.createProduct);
router.get("/productos", authMiddleware, permisosMiddleware.hasPermission('ver_productos'), Productos.getProducts);
router.get("/productos/:companyId", authMiddleware, permisosMiddleware.hasPermission('ver_productos'), Productos.getProductsByCompany);

// ====== Movimientos ======
router.post("/movimientos", authMiddleware, permisosMiddleware.hasPermission('crear_movimientos'), Movimientos.createMovimiento);
router.get("/movimientos", authMiddleware, permisosMiddleware.hasPermission('ver_movimientos'), Movimientos.getMovimientos);
// router.get("/movimientos/:companyId", authMiddleware, permisosMiddleware.hasPermission('ver_movimientos'), Movimientos.getMovimientosByCompany);

module.exports = router;