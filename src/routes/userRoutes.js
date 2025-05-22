const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMe } = require('../controllers/userController'); // Using the controller

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user's data (protected)
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;
