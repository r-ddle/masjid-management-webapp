const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware'); 
const { body, param, query, validationResult } = require('express-validator');
const CustomError = require('../utils/CustomError');

// Middleware to handle validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return next(new CustomError('Validation failed', 400, extractedErrors));
};

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

// Validation rules for GET /api/dashboard/members query parameters
const validateGetAllMembersQuery = [
    query('location').optional().isString().trim().escape(),
    query('zone').optional().isString().trim().escape(), // Zone filter remains optional, controller handles its applicability
    query('janazaMonth').optional().isString().toLowerCase().isIn(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
        .withMessage('Invalid janazaMonth value. Must be a 3-letter month abbreviation (e.g., jan).'),
    query('janazaStatus').optional().isString().isIn(['Paid', 'Not_Paid', 'Pending', 'Waived'])
        .withMessage('Invalid janazaStatus value. Must be one of: Paid, Not_Paid, Pending, Waived.'),
    query('search').optional().isString().trim().escape(), // Added .escape()
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be an integer between 1 and 100.')
];

// GET /api/dashboard/members - Get all Janaza members with filtering and pagination
router.get(
  '/members',
  protect,
  validateGetAllMembersQuery,
  validateRequest,
  memberController.getAllMembers // Use the new controller function
);

// GET /api/dashboard/members/:location - Get all members by location (Kept for specific use if needed)
router.get(
  '/members/:location',
  protect, 
  validateLocation,
  validateRequest,
  memberController.getMembersByLocationParam // Use renamed controller function
);

// POST /api/dashboard/members - Create a new member
router.post(
  '/members',
  protect, 
  validateMember,
  validateRequest,
  memberController.createMember
);

// GET /api/dashboard/members/id/:memberId - Get a single member by ID
router.get(
  '/members/id/:memberId',
  protect,
  validateMemberId,
  validateRequest,
  memberController.getMemberById
);


// PUT /api/dashboard/members/:memberId - Update an existing member
router.put(
  '/members/:memberId',
  protect, 
  validateMemberId,
  validateMember,
  validateRequest,
  memberController.updateMember
);

// DELETE /api/dashboard/members/:memberId - Delete a member
router.delete(
  '/members/:memberId',
  protect, 
  validateMemberId,
  validateRequest,
  memberController.deleteMember
);

// Validation for payment status update
const validatePaymentStatus = [
  param('memberId').isInt({ gt: 0 }).withMessage('Member ID must be a positive integer'),
  body('month').isString().toLowerCase().isIn(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
    .withMessage('Month must be a valid 3-letter month abbreviation (e.g., jan, feb)'),
  body('status').isString().isIn(['Paid', 'Not_Paid', 'Pending', 'Waived'])
    .withMessage('Status must be one of: Paid, Not_Paid, Pending, Waived'),
];

// PATCH /api/dashboard/members/:memberId/payment-status - Update payment status for a member
router.patch(
  '/members/:memberId/payment-status',
  protect,
  validatePaymentStatus, // This already includes memberId validation from param
  validateRequest,
  memberController.updateMemberPaymentStatus
);

module.exports = router;
