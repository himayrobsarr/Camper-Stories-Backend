const express = require("express");
const router = express.Router();
const WompiController = require("../controllers/wompiController");

// Instanciar el controlador
const wompiController = new WompiController();

// Rutas para Wompi
router.post("/generate-signature", wompiController.generateSignature.bind(wompiController));
router.post('/save-info', wompiController.savePaymentInfo.bind(wompiController));
// router.post('/save-weebhook', wompiController.handlePaymentWebhook);
router.post('/init-subscription', wompiController.initSubscription.bind(wompiController));
router.post('/process-subscription', wompiController.processSubscription.bind(wompiController));

module.exports = router;