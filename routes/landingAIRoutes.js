const express = require("express");
const landingAIController = require("../controllers/landingAIController");
const WelcomeEmailController = require("../controllers/welcomeEmailController");
const router = express.Router();

//Guardar registros exitosos al curso
router.post("/register", landingAIController.saveRegisteredInfo);

// Nuevas rutas para obtener registros
router.get("/registros", landingAIController.getAllRegistered);
router.get("/registros/:id", landingAIController.getRegisteredById);
//Enviar correo de bienvenida
router.post("/send-welcome-email", WelcomeEmailController.sendWelcomeEmail)

module.exports = router;