const express = require("express");
const landingAIController = require("../controllers/landingAIController");
const welcomeEmailController = require("../controllers/welcomeEmailController");
const notificationEmailController = require("../controllers/notificationEmailController");
const router = express.Router();

//Guardar registros exitosos al curso
router.post("/register", landingAIController.saveRegisteredInfo);

// Nuevas rutas para obtener registros
router.get("/registros", landingAIController.getAllRegistered);
router.get("/registros/:id", landingAIController.getRegisteredById);
//Enviar correo de bienvenida
router.post("/send-welcome-email", welcomeEmailController.sendWelcomeEmail);

//Enviar notificación por correo
router.post("/send-notification-email", notificationEmailController.sendNotificationEmail);

module.exports = router;