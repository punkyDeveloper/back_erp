const login = require('../controllers/login/login');
const usaurios = require('../controllers/registrarUsuario');
const permisos = require('../controllers/permisos/permisos')
// role
const Role = require('../controllers/roles/roles')
// eslint-disable-next-line no-unused-vars

const express = require('express');
// eslint-disable-next-line new-cap
const router =express.Router();
// role
router.post('/role',Role.role)
router.get('/role',Role.getRoles)
// login
router.post('/login', login.login);
// Usuarios
router.post("/usuario", usaurios.usuarioR)
// Permisos
router.post("/permisos", permisos.permiso)
// router.get("/permisos", permisos.getPermisos)
module.exports=router;