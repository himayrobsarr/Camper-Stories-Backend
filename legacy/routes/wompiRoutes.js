const express = require("express");
const router = express.Router();
const wompiController = require("../controllers/wompiController");

router.post("/generate-signature", wompiController.generateSignature);

module.exports = router;