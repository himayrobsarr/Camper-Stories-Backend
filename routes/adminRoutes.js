const express = require('express');
const AdminController = require('../controllers/adminController');

const router = express.Router();

// Ruta para obtener el total de registros
router.get('/', AdminController.getAllRegister);

// Ruta para obtener los registros incompletos
router.get('/incomplete', AdminController.getAllIncomplete);

module.exports = router;

