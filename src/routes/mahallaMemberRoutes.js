const express = require('express');
const router = express.Router();
const mahallaMemberController = require('../controllers/mahallaMemberController');
const { protect } = require('../middleware/authMiddleware');
const { query, body } = require('express-validator');

// Validation for the optional 'zone' query parameter
const validateZoneQuery = [
  query('zone').optional().isString().trim().escape().withMessage('Zone must be a string if provided')
];

// Validation for creating a mahalla member
const validateCreateMahallaMember = [
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  body('zone').notEmpty().withMessage('Zone is required').trim().escape(),
  body('address').optional({ checkFalsy: true }).trim().escape(),
  body('telephone').optional({ checkFalsy: true }).trim().escape()
];

// GET /api/dashboard/mahallah-members - Get all mahalla members, optionally filtered by zone
router.get(
  '/', // Route will be mounted as /api/dashboard/mahallah-members
  protect,
  validateZoneQuery,
  mahallaMemberController.getMahallaMembers
);

// POST /api/dashboard/mahallah-members - Create a new mahalla member
router.post(
  '/', // Route will be mounted as /api/dashboard/mahallah-members
  protect,
  validateCreateMahallaMember,
  mahallaMemberController.createMahallaMember
);
// Future: Add PUT and DELETE routes if needed

module.exports = router;
