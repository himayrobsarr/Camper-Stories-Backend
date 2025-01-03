const express = require("express");
const DreamController = require("../controllers/dreamController");
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get("/", DreamController.getAll); // Obtener todos los Dreams
router.get("/:id", DreamController.getById); // Obtener un sueño por Id
router.post("/", authMiddleware, DreamController.create); // Crear un nuevo Dream
router.put("/:id", authMiddleware, DreamController.update); // Actualizar un Dream
router.delete("/:id", authMiddleware, DreamController.delete); // Eliminar un Dream

module.exports = router;