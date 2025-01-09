const express = require("express");
const ProjectController = require("../controllers/projectController");
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get("/:camperid", ProjectController.getProjectsByCamperId); // Obtener un projecto por ID

// Rutas protegidas
router.post("/", authMiddleware, ProjectController.addProjectForCamper); // Crear un nuevo projecto
router.put("/:id", authMiddleware, ProjectController.updateProjectForCamper); // Actualizar un projecto existente

module.exports = router;