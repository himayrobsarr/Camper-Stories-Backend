const express = require("express");
const SponsorController = require("../controllers/sponsorController");

const router = express.Router();

// Rutas para el CRUD de usuarios
router.get("/", SponsorController.getAll); // Obtener todos los usuarios
router.get("/:id", SponsorController.getById); // Obtener un usuario por ID
router.post("/", SponsorController.create); // Crear un nuevo usuario
router.put("/:id", SponsorController.update); // Actualizar un usuario existente
router.delete("/:id", SponsorController.delete); // Eliminar un usuario

module.exports = router;
