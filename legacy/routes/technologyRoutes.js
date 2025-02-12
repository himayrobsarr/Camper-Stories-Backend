const express = require("express");
const technologyController = require("../controllers/technologyController.js");


const router = express.Router();

// Rutas públicas
router.get("/",  technologyController.getAll); // Obtener todos los campers

module.exports = router;