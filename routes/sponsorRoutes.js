const express = require("express");
const sponsorController = require("../controllers/sponsorController");


const router = express.Router();

// Rutas para el CRUD de usuarios
router.get("/", sponsorController.getAll); // Obtener todos los sponsor
router.get("/:id", sponsorController.getById); // Obtener un sponsor por ID
router.post("/",  sponsorController.create); // Crear un nuevo sponsor
router.post("/finalize-donation", sponsorController.finalizeDonation); // Crear un nuevo sponsor con contraseña generada
router.put("/:id", sponsorController.update); // Actualizar un usuario existente
router.delete("/:id", sponsorController.delete); // Eliminar un usuario

module.exports = router;
