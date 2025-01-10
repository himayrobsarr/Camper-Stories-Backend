const express = require("express");
const MeritController = require("../controllers/meritController");
const authMiddleware = require("../middlewares/authMiddleware");
const limit = require('../limit/meritLimit');

const router = express.Router();

// Rutas públicas
router.get("/", limit.getMeritsByCamperLimiter, MeritController.getAll); // Obtener todos los méritos

// Rutas protegidas
router.get("/:userId", limit.getMeritsByCamperLimiter, MeritController.getByUserId); // Obtener méritos por usuario
router.post("/", authMiddleware, limit.assignMeritToCamperLimiter, MeritController.assignMerit); // Asignar un mérito
router.put("/", authMiddleware, limit.updateMeritForCamperLimiter, MeritController.updateMerit); // Actualizar mérito asignado


module.exports = router;
