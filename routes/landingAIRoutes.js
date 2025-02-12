const express = require("express");
const landingAIController = require("../controllers/landingAIController");
const router = express.Router();

router.post("/register", landingAIController.saveRegisteredInfo);

module.exports = router;