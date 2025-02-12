const express = require("express");
const router = express.Router();
const wompiController = require("../controllers/wompiController");

router.post("/generate-signature", wompiController.generateSignature);
// Ruta para procesar los webhooks de Wompi
router.post('/webhook', wompiController.handlePaymentWebhook);

module.exports = router;