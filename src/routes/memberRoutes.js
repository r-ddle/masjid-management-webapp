const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this is the JWT middleware
const { body, param } = require('express-validator'); // For input validation

// Input validation middleware for creating/updating a member
const validateMember = [
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  body('location').notEmpty().withMessage('Location is required').trim().escape(),
  body('telephone').optional({ checkFalsy: true }).trim().escape(),
  body('address').optional({ checkFalsy: true }).trim().escape(),
  body('janaza2024').optional().isJSON().withMessage('janaza2024 must be a valid JSON object if provided')
];

// Validation for memberId in path
const validateMemberId = [
  param('memberId').isInt({ gt: 0 }).withMessage('Member ID must be a positive integer')
];

// Validation for location in path
const validateLocation = [
  param('location').notEmpty().withMessage('Location is required').trim().escape()
];


// GET /api/dashboard/members/:location - Get all members by location
router.get(
  '/members/:location',
  protect, // Apply JWT authentication
  validateLocation,
  memberController.getMembers
);

// POST /api/dashboard/members - Create a new member
router.post(
  '/members',
  protect, // Apply JWT authentication
  validateMember,
  memberController.createMember
);

// GET /api/dashboard/members/id/:memberId - Get a single member by ID (Added for completeness, though not in original spec, useful for updates)
router.get(
  '/members/id/:memberId',
  protect,
  validateMemberId,
  memberController.getMemberById
);


// PUT /api/dashboard/members/:memberId - Update an existing member
router.put(
  '/members/:memberId',
  protect, // Apply JWT authentication
  validateMemberId,
  validateMember,
  memberController.updateMember
);

// DELETE /api/dashboard/members/:memberId - Delete a member
router.delete(
  '/members/:memberId',
  protect, // Apply JWT authentication
  validateMemberId,
  memberController.deleteMember
);

// Validation for payment status update
const validatePaymentStatus = [
  param('memberId').isInt({ gt: 0 }).withMessage('Member ID must be a positive integer'),
  body('month').isIn(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
    .withMessage('Month must be a valid month abbreviation (e.g., jan, feb)'),
  body('status').isIn(['Paid', 'Not_Paid', 'Pending', 'Waived']) // Added more statuses as examples
    .withMessage('Status must be one of: Paid, Not_Paid, Pending, Waived'),
  // body('location').notEmpty().withMessage('Location is required').trim().escape() // Assuming location might be part of JWT or derived
];

// PATCH /api/dashboard/members/:memberId/payment-status - Update payment status for a member
router.patch(
  '/members/:memberId/payment-status',
  protect,
  validatePaymentStatus,
  memberController.updateMemberPaymentStatus
);

module.exports = router;
