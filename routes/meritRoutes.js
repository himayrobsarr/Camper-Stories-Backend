const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const CamperMeritController = require('../controllers/meritController');
const limit = require('../limit/meritLimit');

// Obtener todos los méritos de un camper
router.get('/:camperId', limit.getMeritsByCamperLimiter, CamperMeritController.get);

// Asignar un mérito a un camper
router.post('/', limit.assignMeritToCamperLimiter, CamperMeritController.assignMerit);

// Actualizar un mérito asignado a un camper
router.put('/:camperId', limit.updateMeritForCamperLimiter, CamperMeritController.updateMerit);

module.exports = router;
