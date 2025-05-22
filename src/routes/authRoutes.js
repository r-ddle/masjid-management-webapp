const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const CustomError = require('../utils/CustomError'); // To use for validation errors

const rateLimit = require('express-rate-limit'); // Import express-rate-limit

const router = express.Router();

// Stricter rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    status: 429, // Optional: customize status code
    message: 'Too many login attempts from this IP, please try again after an hour'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Do not count successful logins towards the limit
});

// Validation rules for the login route
const loginValidationRules = [
  body('username')
    .notEmpty().withMessage('Username is required.')
    .isString().withMessage('Username must be a string.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isString().withMessage('Password must be a string.')
    // .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'), // Optional: Add length requirement
];

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  // Convert validation errors to a format that can be used by CustomError or directly by the error handler
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  // Pass to the centralized error handler
  // Option 1: Use CustomError (if your errorHandler is set up to handle an 'errors' property)
  // return next(new CustomError('Validation failed', 400, extractedErrors));
  // Option 2: Directly create an error object that the errorHandler can use
  const validationError = new Error('Validation failed');
  validationError.statusCode = 400;
  validationError.errors = extractedErrors; // Add the errors array here
  return next(validationError);
};

router.post('/login', loginLimiter, loginValidationRules, validate, authController.login);

// Future routes like /register, /refresh-token could go here

module.exports = router;
