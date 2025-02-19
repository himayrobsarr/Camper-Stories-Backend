const express = require("express");
const landingAIController = require("../controllers/landingAIController");
const router = express.Router();

//Guardar registros exitosos al curso
router.post("/register", landingAIController.saveRegisteredInfo);

// Nuevas rutas para obtener registros
router.get("/registros", landingAIController.getAllRegistered);
router.get("/registros/:id", landingAIController.getRegisteredById);
 

module.exports = router;