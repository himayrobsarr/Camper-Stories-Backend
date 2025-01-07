const express = require("express");
const DreamController = require("../controllers/dreamController");
const authMiddleware = require('../middlewares/authMiddleware');
const limit = require('../limit/dreamLimit');

const router = express.Router();

// Rutas públicas
router.get("/", limit.getAllDreamsLimiter, DreamController.getAll); // Obtener todos los Dreams
router.get("/:id", limit.getDreamByIdLimiter, DreamController.getById); // Obtener un sueño por Id
router.post("/", limit.createDreamLimiter, authMiddleware, DreamController.create); // Crear un nuevo Dream
router.put("/:id", limit.updateDreamLimiter, authMiddleware, DreamController.update); // Actualizar un Dream
router.delete("/:id", limit.deleteDreamLimiter, authMiddleware, DreamController.delete); // Eliminar un Dream

module.exports = router;