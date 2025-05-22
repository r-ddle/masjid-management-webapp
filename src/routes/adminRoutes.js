const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware'); // JWT protection
const { body } = require('express-validator');

// Validation middleware for creating an admin
const validateAdminCreation = [
  body('username').notEmpty().withMessage('Username is required').trim().escape(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('address').optional({ checkFalsy: true }).trim().escape() // Address is optional
];

// POST /api/dashboard/admins - Create a new admin user
// This route is protected, meaning only authenticated users (via JWT) can attempt to access it.
// Further role-based authorization (e.g., only other admins can create admins) would be an additional layer.
router.post(
  '/', // This will be mounted at /api/dashboard/admins
  protect,
  validateAdminCreation,
  adminController.createAdmin
);

module.exports = router;
