const express = require('express');
const PasswordResetController = require('../controllers/passwordResetController');
const router = express.Router();

router.post('/request-reset', PasswordResetController.requestPasswordReset);
router.post('/reset-password', PasswordResetController.resetPassword);

module.exports = router;
