// routes/testRoute.js - ONLY FOR TESTING! REMOVE IN PRODUCTION!
require("dotenv").config();
const express = require('express');
const User = require('../models/user');
const router = express.Router();

// ONLY USE THIS IN TEST ENVIRONMENT
if (process.env.NODE_ENV === 'test') {
  router.post('/verify-user', async (req, res) => {
    const { username } = req.body;
    await User.updateOne({ username }, { isVerified: true });
    res.json({ success: true });
  });
}

module.exports = router;