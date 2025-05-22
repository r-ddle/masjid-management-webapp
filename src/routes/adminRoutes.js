const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { body, param, query, validationResult } = require('express-validator');
const CustomError = require('../utils/CustomError');

// Middleware to handle validation results (consistent with other route files)
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    // Pass errors to the global error handler via CustomError or directly
    return next(new CustomError('Validation failed', 400, extractedErrors));
};


// Validation middleware for creating an admin
const validateAdminCreation = [
  body('username').notEmpty().withMessage('Username is required').trim().escape(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('address').notEmpty().withMessage('Address is required').trim().escape() // Address is now required for creation
];

// Validation middleware for updating an admin
const validateAdminUpdate = [
  body('address').optional().notEmpty().withMessage('Address cannot be empty if provided').trim().escape(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long if provided')
];

// Validation for adminId in path
const validateAdminIdParam = [
  param('adminId').isInt({ gt: 0 }).withMessage('Admin ID must be a positive integer.')
];

// Validation for pagination query params
const validatePaginationQuery = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be an integer between 1 and 100.')
];


// POST /api/dashboard/admins - Create a new admin user
router.post(
  '/',
  protect,
  validateAdminCreation,
  validateRequest, // Handle validation errors
  adminController.createAdmin
);

// GET /api/dashboard/admins - Get all admin users (paginated)
router.get(
  '/',
  protect,
  validatePaginationQuery,
  validateRequest,
  adminController.getAllAdmins
);

// GET /api/dashboard/admins/:adminId - Get a specific admin user by ID
router.get(
  '/:adminId',
  protect,
  validateAdminIdParam,
  validateRequest,
  adminController.getAdminById
);

// PUT /api/dashboard/admins/:adminId - Update an admin user
router.put(
  '/:adminId',
  protect,
  validateAdminIdParam,
  validateAdminUpdate,
  validateRequest,
  adminController.updateAdmin
);

// DELETE /api/dashboard/admins/:adminId - Delete an admin user
router.delete(
  '/:adminId',
  protect,
  validateAdminIdParam,
  validateRequest,
  adminController.deleteAdmin
);

module.exports = router;
