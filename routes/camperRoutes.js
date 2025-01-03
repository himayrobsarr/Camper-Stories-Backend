const express = require("express");
const CamperController = require("../controllers/camperController");
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get("/", CamperController.getAll); // Obtener todos los campers
router.get("/:id", CamperController.getById); // Obtener un camper por ID

// Rutas protegidas
router.post("/", authMiddleware, CamperController.create); // Crear un nuevo camper
router.put("/:id", authMiddleware, CamperController.update); // Actualizar un camper existente
router.delete("/:id", authMiddleware, CamperController.delete); // Eliminar un camper

module.exports = router;