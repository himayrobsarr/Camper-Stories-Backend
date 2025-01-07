const express = require("express");
const SponsorController = require("../controllers/sponsorController");
const limit = require('../limit/sponsorLimit');

const router = express.Router();

// Rutas para el CRUD de usuarios
router.get("/", limit.getAllSponsorsLimiter, SponsorController.getAll); // Obtener todos los usuarios
router.get("/:id", limit.getSponsorByIdLimiter, SponsorController.getById); // Obtener un usuario por ID
router.post("/", limit.createSponsorLimiter, SponsorController.create); // Crear un nuevo usuario
router.put("/:id", limit.updateSponsorLimiter, SponsorController.update); // Actualizar un usuario existente
router.delete("/:id", limit.deleteSponsorLimiter, SponsorController.delete); // Eliminar un usuario

module.exports = router;
