const express = require("express");
const router = express.Router();
const WompiController = require("../controllers/wompiController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas para suscripciones
router.post("/init-subscription", authMiddleware, WompiController.initSubscription);
router.post("/process-subscription", WompiController.processSubscription);
router.post("/recieve-webhook", WompiController.recieveWebhook);
router.post("/generate-signature", WompiController.generateSignature);

// Ruta para procesar los webhooks de Wompi
router.post('/save-info', WompiController.savePaymentInfo);

// Asegúrate de que estos métodos existan en el controlador antes de descomentar estas rutas
// router.get("/subscription/:id", WompiController.getSubscription);
// router.post("/cancel-subscription", WompiController.cancelSubscription);

module.exports = router;