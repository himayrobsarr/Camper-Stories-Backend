const express = require("express");
const router = express.Router();
const WompiController = require("../controllers/wompiController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas para suscripciones
router.post("/init-subscription", authMiddleware, WompiController.initSubscription);
router.post("/process-subscription", WompiController.processSubscription);
router.post("/webhook", WompiController.handleWebhook);

// Asegúrate de que estos métodos existan en el controlador antes de descomentar estas rutas
// router.get("/subscription/:id", WompiController.getSubscription);
// router.post("/cancel-subscription", WompiController.cancelSubscription);

module.exports = router;