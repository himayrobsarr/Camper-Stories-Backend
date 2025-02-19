const express = require("express");
const router = express.Router();
const WompiController = require("../controllers/wompiController");
const authMiddleware = require("../middlewares/authMiddleware");
const validateSubscriptionData = require("../middlewares/validateSubscriptionData");

// Rutas para suscripciones
router.post("/init-subscription",authMiddleware,validateSubscriptionData,WompiController.initSubscription); 
router.post("/process-subscription", authMiddleware,WompiController.processSubscription);
router.post("/receive-webhook", WompiController.receiveWebhook);
router.post("/generate-signature", authMiddleware, WompiController.generateSignature);


// Ruta para procesar los webhooks de Wompi
router.post('/save-info', WompiController.savePaymentInfo);

// Nuevas rutas
router.get("/subscriptions", authMiddleware, WompiController.getUserSubscriptions);
router.get("/subscription/:subscriptionId", authMiddleware, WompiController.getSubscription);
router.delete("/subscription/:subscriptionId", authMiddleware, WompiController.cancelSubscription);
router.put("/subscription/:subscriptionId/payment-method", authMiddleware, WompiController.updatePaymentMethod);
router.get("/subscription/:subscriptionId/payments", authMiddleware, WompiController.getSubscriptionPayments);

module.exports = router;