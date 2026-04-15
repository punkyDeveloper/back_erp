const express = require('express');
const rateLimit = require('express-rate-limit');
const login = require('../controllers/login/login');
const usuario = require('../controllers/user/user.controller');
const permisosController = require('../controllers/permisos/permisos');
const permisosMiddleware = require('../middleware/permisos');
const Role = require('../controllers/roles/roles');
const Company = require('../controllers/user/compania.controler');
const Productos = require('../controllers/productos/productController');
// dashboard
const DashboardController = require('../controllers/dashboard/dashboardController');
// mecanica
const ctrl= require("../controllers/mecanica/mecanicaControler");
// movimientos
const Movimientos = require('../controllers/tipo_movimiento/tipo_movimiento');
// servicios
const servicios = require('../controllers/servicios/categorias');
const apiKeyMiddleware = require('../middleware/apiKey');
const authMiddleware = require('../middleware/authMiddleware');
const {upload, uploadToCloudinary} = require('../middleware/imagen');
// clientes
const Clientes = require('../controllers/clientes/clienste.controler');
// ventas (POS)
const Ventas = require('../controllers/ventas/ventas.controller');
// libro contable
const Libro    = require('../controllers/libro/libroController');
const Facturas = require('../controllers/libro/facturasController');
const Egresos  = require('../controllers/libro/egresosController');

const router = express.Router();

// ── Rate limiting para login: máx 10 intentos cada 15 min ─────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { success: false, message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ====== Login (con rate limiting) ======
router.post('/login', loginLimiter, login.login);

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
router.post("/productos",     authMiddleware, permisosMiddleware.hasPermission('crear_productos'),    upload.single("img"), uploadToCloudinary, Productos.createProduct);
router.get("/productos",      authMiddleware, permisosMiddleware.hasPermission('ver_productos'),      Productos.getProducts);
router.get("/productos/:companyId", authMiddleware, permisosMiddleware.hasPermission('ver_productos'), Productos.getProductsByCompany);
router.put("/productos/:id",  authMiddleware, permisosMiddleware.hasPermission('editar_productos'),   upload.single("img"), uploadToCloudinary, Productos.updateProduct);
router.delete("/productos/:id", authMiddleware, permisosMiddleware.hasPermission('eliminar_productos'), Productos.deleteProduct);

// ====== Movimientos ======
router.post("/movimientos", authMiddleware, permisosMiddleware.hasPermission('crear_movimientos'), Movimientos.createMovimiento);
router.get("/movimientos", authMiddleware, permisosMiddleware.hasPermission('ver_movimientos'), Movimientos.getMovimientos);

// ====== Servicios ======
router.post("/servicios", authMiddleware, permisosMiddleware.hasPermission('crear_servicios'), servicios.crearServiciosSupservicio);
router.get("/servicios", authMiddleware, permisosMiddleware.hasPermission('ver_servicios'), servicios.getServicios);
router.put("/servicios/:id", authMiddleware, permisosMiddleware.hasPermission('editar_servicios'), servicios.editarServicioSupservicio);

// ====== Ventas (POS) ======
router.get   ("/ventas",     authMiddleware, permisosMiddleware.hasPermission('ver_ventas'),      Ventas.getVentas);
router.post  ("/ventas",     authMiddleware, permisosMiddleware.hasPermission('crear_ventas'),    Ventas.createVenta);
router.put   ("/ventas/:id", authMiddleware, permisosMiddleware.hasPermission('editar_ventas'),   Ventas.updateVenta);
router.delete("/ventas/:id", authMiddleware, permisosMiddleware.hasPermission('eliminar_ventas'), Ventas.cancelVenta);

//  ====== Dashboard ======
router.get("/dashboard/finanzas",  authMiddleware, permisosMiddleware.hasPermission('ver_dashboard'), DashboardController.getDashboardFinanzas);
router.get("/dashboard/mecanica", authMiddleware, permisosMiddleware.hasPermission('ver_mecanica'),   DashboardController.getDashboardMecanica);

// ====== Libro contable ======
router.get("/libro/resumen",  authMiddleware, permisosMiddleware.hasPermission('ver_movimientos'), Libro.getResumen);
router.get("/libro/asientos", authMiddleware, permisosMiddleware.hasPermission('ver_movimientos'), Libro.getAsientos);

// ====== Facturas ======
router.get("/facturas", authMiddleware, permisosMiddleware.hasPermission('ver_movimientos'), Facturas.getFacturas);

// ====== Egresos ======
router.get   ("/egresos",           authMiddleware, permisosMiddleware.hasPermission('ver_movimientos'),   Egresos.getEgresos);
router.post  ("/egresos",           authMiddleware, permisosMiddleware.hasPermission('crear_movimientos'), Egresos.createEgreso);
router.patch ("/egresos/:id/anular",authMiddleware, permisosMiddleware.hasPermission('crear_movimientos'), Egresos.anularEgreso);

// ====== Clientes  ======
router.post("/clientes", authMiddleware, permisosMiddleware.hasPermission('crear_cliente'), Clientes.createCliente);
router.get("/clientes", authMiddleware, permisosMiddleware.hasPermission('ver_clientes'), Clientes.getClientes);
router.put("/clientes/:id", authMiddleware, permisosMiddleware.hasPermission('editar_cliente'), Clientes.updateCliente);
router.delete("/clientes/:id", authMiddleware, permisosMiddleware.hasPermission('eliminar_cliente'), Clientes.deleteCliente);

//  ====== Mecanica  ======
router.get   ("/mecanica/catalogo",        authMiddleware, permisosMiddleware.hasPermission('ver_mecanica'),      ctrl.getCatalogo);
router.get   ("/mecanica", authMiddleware,permisosMiddleware.hasPermission('ver_mecanica'), ctrl.getMantenimientos);
router.get   ("/mecanica/detalle/:id",  authMiddleware, permisosMiddleware.hasPermission('ver_mecanica'),      ctrl.getMantenimientoById);
router.post  ("/mecanica",              authMiddleware, permisosMiddleware.hasPermission('crear_mecanica'),    ctrl.crearMantenimiento);
router.put   ("/mecanica/:id",          authMiddleware, permisosMiddleware.hasPermission('editar_mecanica'),   ctrl.actualizarMantenimiento);
router.delete("/mecanica/:id",          authMiddleware, permisosMiddleware.hasPermission('eliminar_mecanica'), ctrl.eliminarMantenimiento);
router.patch("/mecanica/:id/finalizar",authMiddleware,permisosMiddleware.hasPermission('editar_mecanica'),ctrl.finalizarMantenimiento);
module.exports = router;