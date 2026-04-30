const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login Route
router.post('/login', (req, res, next) => {
  console.log(" Auth route /login hit");
  next();
}, authController.login);

router.post('/create-account', (req, res) => {
  res.json({ message: "Register endpoint - to be implemented" });
}, authController.register);
module.exports = router;
