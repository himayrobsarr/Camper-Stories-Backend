const express = require("express");
const CamperController = require("../controllers/camperController");
const authMiddleware = require('../middlewares/authMiddleware');
const limit = require('../limit/camperLimit');

const router = express.Router();

// Rutas públicas
router.get("/", limit.getAllCampersLimiter, CamperController.getAll); // Obtener todos los campers
router.get("/:status", limit.getAllCampersLimiter, CamperController.getAllByStatus); // Obtener todos los campers por status
router.get("/:id", limit.getCamperByIdLimiter, CamperController.getById); // Obtener un camper por ID

// Rutas protegidas
router.post("/", authMiddleware, limit.createCamperLimiter, CamperController.create); // Crear un nuevo camper
router.put("/:id", authMiddleware, limit.updateCamperLimiter, CamperController.update); // Actualizar un camper existente
router.delete("/:id", authMiddleware, limit.deleteCamperLimiter, CamperController.delete); // Eliminar un camper

module.exports = router;