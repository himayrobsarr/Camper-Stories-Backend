const express = require("express");
const router = express.Router();
const WompiController = require("../controllers/wompiController");
const authMiddleware = require("../middlewares/authMiddleware");
const validateSubscriptionData = require("../middlewares/validateSubscriptionData");

// Rutas para suscripciones
router.post("/init-subscription", validateSubscriptionData,WompiController.initSubscription); 
router.post("/process-subscription", WompiController.processSubscription);
router.post("/receive-webhook", WompiController.receiveWebhook);
router.post("/generate-signature", WompiController.generateSignature);


// Ruta para procesar los webhooks de Wompi
router.post('/save-info', WompiController.savePaymentInfo);

// Nuevas rutas
router.get("/subscriptions", WompiController.getUserSubscriptions);
router.get("/subscription/:subscriptionId", WompiController.getSubscription);
router.delete("/subscription/:subscriptionId", WompiController.cancelSubscription);
router.put("/subscription/:subscriptionId/payment-method", WompiController.updatePaymentMethod);
router.get("/subscription/:subscriptionId/payments", WompiController.getSubscriptionPayments);

module.exports = router;