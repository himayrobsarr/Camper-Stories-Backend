const express = require("express");
const router = express.Router();
const WompiController = require("../controllers/wompiController");

// Instanciar el controlador
const wompiController = new WompiController();

// Rutas para Wompi
router.post("/generate-signature", wompiController.generateSignature.bind(wompiController));
router.post('/save-info', wompiController.savePaymentInfo.bind(wompiController));


// {
//     "planId": 1,
//     "customerData": {
//       "email": "cliente@ejemplo.com",
//       "name": "Cliente Ejemplo"
//     }
//   }
router.post('/init-subscription', wompiController.initSubscription.bind(wompiController));
router.post('/process-subscription', wompiController.processSubscription.bind(wompiController));



// // futuras rutas

// router.post("/cancel-subscription/:subscriptionId", authMiddleware, wompiController.cancelSubscription);
// router.get("/subscription/:subscriptionId", authMiddleware, wompiController.getSubscription);

// Webhooks de Wompi (públicos)
// router.post("/webhook", wompiController.handleWebhook);

module.exports = router;