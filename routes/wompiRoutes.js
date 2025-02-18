const express = require("express");
const router = express.Router();
const WompiController = require("../controllers/wompiController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas para suscripciones
router.post("/init-subscription", WompiController.initSubscription);
router.post("/process-subscription", WompiController.processSubscription);
router.post("/recieve-webhook", WompiController.recieveWebhook);
router.post("/generate-signature", WompiController.generateSignature);

// Ruta para procesar los webhooks de Wompi
router.post('/save-info', WompiController.savePaymentInfo);

// Nuevas rutas
router.get("/subscriptions", authMiddleware, WompiController.getUserSubscriptions);
router.get("/subscription/:subscriptionId", authMiddleware, WompiController.getSubscription);
router.delete("/subscription/:subscriptionId", authMiddleware, WompiController.cancelSubscription);
router.put("/subscription/:subscriptionId/payment-method", authMiddleware, WompiController.updatePaymentMethod);
router.get("/subscription/:subscriptionId/payments", authMiddleware, WompiController.getSubscriptionPayments);

module.exports = router;