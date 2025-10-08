
const express = require('express');
const login = require('../controllers/login/login');
const Usaurios = require('../controllers/user/registrarUsuario');
const usuario = require('../controllers/user/user.controller');
const permisos = require('../controllers/permisos/permisos');
const Role = require('../controllers/roles/roles');
const Company = require('../controllers/user/compania.controler');
const Productos = require('../controllers/productos/productController');

const apiKeyMiddleware = require('../middleware/apiKey');
const {upload, uploadToCloudinary} = require('../middleware/imagen');
const router = express.Router();

// ====== Roles ======
router.post('/roleC', apiKeyMiddleware, Role.roleCreate);
router.get('/role', Role.getRoles);

// ====== Login ======
router.post('/login', apiKeyMiddleware, login.login);

// ====== Usuarios ======
router.post("/usuario", Usaurios.createUser);
router.get("/usuarios", usuario.getUsers);

// ====== Permisos ======
router.post("/permisos", permisos.permiso);
router.get("/permisos", permisos.getPermisos);
router.get("/permisosN", permisos.getPermisoByName);

// ====== Roles (alias) ======
router.post("/roles", Role.roleCreate);
router.get("/roles", Role.getRoles);

// ====== Compañías ======
router.post("/companias", Company.createCompany);

// ====== Productos ======
router.post("/productos", upload.single("img"),uploadToCloudinary ,Productos.createProduct);
router.get("/productos", Productos.getProducts);
router.get("/productos/:companyId", Productos.getProductsByCompany);


module.exports = router;
