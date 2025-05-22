const express = require('express');
const router = express.Router();
const mahallaMemberController = require('../controllers/mahallaMemberController');
const { protect } = require('../middleware/authMiddleware');
const { query, body, param, validationResult } = require('express-validator');
const CustomError = require('../utils/CustomError');

// Middleware to handle validation results (Consistent with other route files)
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return next(new CustomError('Validation failed', 400, extractedErrors));
};

// Validation rules for GET /api/dashboard/mahallah-members query parameters
const validateGetAllMahallaMembersQuery = [
    query('location').optional().isString().trim().escape().withMessage('Location must be a string if provided.'),
    query('zone').optional().isString().trim().escape().withMessage('Zone must be a string if provided.'),
    query('search').optional().isString().trim().escape(), // Added .escape()
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be an integer between 1 and 100.')
];

// Validation for creating/updating a Mahalla member
const validateMahallaMemberBody = [
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  body('zone').notEmpty().withMessage('Zone is required').trim().escape(),
  body('address').optional({ checkFalsy: true }).trim().escape(),
  body('telephone').optional({ checkFalsy: true }).trim().escape()
];

// Validation for memberId in path
const validateMemberIdParam = [
  param('memberId').isInt({ gt: 0 }).withMessage('Member ID must be a positive integer.')
];

// GET /api/dashboard/mahallah-members - Get all mahalla members with filtering and pagination
router.get(
  '/',
  protect,
  validateGetAllMahallaMembersQuery,
  validateRequest,
  mahallaMemberController.getAllMahallaMembers
);

// POST /api/dashboard/mahallah-members - Create a new mahalla member
router.post(
  '/',
  protect,
  validateMahallaMemberBody,
  validateRequest,
  mahallaMemberController.createMahallaMember
);

// GET /api/dashboard/mahallah-members/:memberId - Get a single Mahalla member by ID
router.get(
  '/:memberId',
  protect,
  validateMemberIdParam,
  validateRequest,
  mahallaMemberController.getMahallaMemberById
);

// PUT /api/dashboard/mahallah-members/:memberId - Update an existing Mahalla member
router.put(
  '/:memberId',
  protect,
  validateMemberIdParam,
  validateMahallaMemberBody,
  validateRequest,
  mahallaMemberController.updateMahallaMember
);

// DELETE /api/dashboard/mahallah-members/:memberId - Delete a Mahalla member
router.delete(
  '/:memberId',
  protect,
  validateMemberIdParam,
  validateRequest,
  mahallaMemberController.deleteMahallaMember
);

module.exports = router;
