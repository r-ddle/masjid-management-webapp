const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const hiflMemberController = require('../controllers/hiflMemberController');
const { protect } = require('../middleware/authMiddleware'); // Corrected path
const CustomError = require('../utils/CustomError'); // Assuming CustomError is in utils

const router = express.Router();

// Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    // Use CustomError for consistent error response
    return next(new CustomError('Validation failed', 400, extractedErrors));
};

// Validation rules for creating and updating a Hifl member
const hiflMemberValidationRules = [
    body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string').trim().escape(),
    body('address').optional().isString().withMessage('Address must be a string').trim().escape(),
    body('telephone').optional().isString().withMessage('Telephone must be a string').trim().escape(),
    // Example: .matches(/^\+[1-9]\d{1,14}$/).withMessage('Telephone must be a valid E.164 format international phone number')
    body('location').optional().isString().withMessage('Location must be a string').trim().escape(),
    body('zone').optional().isString().withMessage('Zone must be a string').trim().escape(),
    body('enrollment_date').optional().isISO8601().toDate().withMessage('Enrollment date must be a valid date'),
    body('status').optional().isString().withMessage('Status must be a string').trim().escape()
    // Example: .isIn(['Active', 'Inactive', 'Graduated', 'Dropped']).withMessage('Invalid status value')
];

// Validation rules for query parameters (GET all)
const getAllQueryValidationRules = [
    query('location').optional().isString().withMessage('Location filter must be a string').trim().escape(),
    query('zone').optional().isString().withMessage('Zone filter must be a string').trim().escape(),
    query('status').optional().isString().withMessage('Status filter must be a string').trim().escape(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100').toInt()
];

// Validation rules for ID parameter
const idParamValidationRules = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer').toInt()
];


// Routes for /api/dashboard/hifl-members

// POST / - Create a new Hifl member
router.post(
    '/',
    protect, // Protect route
    hiflMemberValidationRules,
    validate, // Handle validation results
    hiflMemberController.createHiflMember
);

// GET / - Retrieve all Hifl members (with optional query filters)
router.get(
    '/',
    protect,
    getAllQueryValidationRules,
    validate,
    hiflMemberController.getAllHiflMembers
);

// GET /:id - Retrieve a Hifl member by ID
router.get(
    '/:id',
    protect,
    idParamValidationRules,
    validate,
    hiflMemberController.getHiflMemberById
);

// PUT /:id - Update a Hifl member by ID
router.put(
    '/:id',
    protect,
    idParamValidationRules, // Validate ID first
    hiflMemberValidationRules, // Then validate body
    validate,
    hiflMemberController.updateHiflMember
);

// DELETE /:id - Delete a Hifl member by ID
router.delete(
    '/:id',
    protect,
    idParamValidationRules,
    validate,
    hiflMemberController.deleteHiflMember
);

module.exports = router;
