const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login Route
router.post('/login', authController.login);

// Register Route
router.post('/create-account', authController.register);

module.exports = router;