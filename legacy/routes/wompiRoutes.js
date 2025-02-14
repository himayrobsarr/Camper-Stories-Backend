const express = require("express");
const router = express.Router();
const wompiController = require("../controllers/wompiController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas públicas
router.post("/generate-signature", wompiController.generateSignature);
router.post("/save-payment-info", wompiController.savePaymentInfo);

// Rutas para suscripciones (protegidas con autenticación)
router.post("/init-subscription", authMiddleware, wompiController.initSubscription);
router.post("/process-subscription", authMiddleware, wompiController.processSubscription);
router.post("/cancel-subscription/:subscriptionId", authMiddleware, wompiController.cancelSubscription);
router.get("/subscription/:subscriptionId", authMiddleware, wompiController.getSubscription);

// Webhooks de Wompi (públicos)
router.post("/webhook", wompiController.handleWebhook);

module.exports = router;