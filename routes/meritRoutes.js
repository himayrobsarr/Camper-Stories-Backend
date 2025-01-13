const express = require("express");
const MeritController = require("../controllers/meritController");
const authMiddleware = require("../middlewares/authMiddleware");
const limit = require('../limit/meritLimit');

const router = express.Router();

// Rutas públicas
router.get("/", limit.getMeritsByCamperLimiter, MeritController.getAll); // Obtener todos los méritos

// Rutas protegidas
router.get("/:userId", MeritController.getByUserId); // Obtener méritos por usuario
router.post("/:camperId", authMiddleware, MeritController.updateCamperMerits); // Asignar un mérito


module.exports = router;
