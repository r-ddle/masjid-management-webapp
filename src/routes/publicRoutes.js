const express = require('express');
const publicController = require('../controllers/publicController');
const { param, validationResult } = require('express-validator');
const CustomError = require('../utils/CustomError');

const router = express.Router();

// Middleware to handle validation results for public routes
const validatePublicRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return next(new CustomError('Validation failed for public route parameters', 400, extractedErrors));
};

// Validation rules for location path parameter
const validateLocationParam = [
    param('location').notEmpty().withMessage('Location parameter cannot be empty.').trim().escape()
];

// Validation rules for zone path parameter
const validateZoneParam = [
    param('zone').notEmpty().withMessage('Zone parameter cannot be empty.').trim().escape()
];

// Validation rules for location and zone path parameters
const validateLocationAndZoneParams = [
    param('location').notEmpty().withMessage('Location parameter cannot be empty.').trim().escape(),
    param('zone').notEmpty().withMessage('Zone parameter cannot be empty.').trim().escape()
];


// ==============================
// Janaza Member Public Routes
// ==============================

// GET Janaza members by location (publicly accessible)
// e.g., /api/public/members/janaza/Colombo
router.get(
    '/members/janaza/:location',
    validateLocationParam,
    validatePublicRequest, 
    publicController.getPublicJanazaMembersByLocation
);


// ==============================
// Mahallah Member Public Routes
// ==============================

// GET Mahallah members by zone (publicly accessible)
// e.g., /api/public/members/mahallah/zone/Zone1
router.get(
    '/members/mahallah/zone/:zone',
    validateZoneParam,
    validatePublicRequest,
    publicController.getPublicMahallahMembersByZone
);

// GET Mahallah members by location (interpreted as zone by controller)
// e.g., /api/public/members/mahallah/Colombo 
router.get(
    '/members/mahallah/:location', 
    validateLocationParam, // Validates the 'location' param which is treated as zone
    validatePublicRequest,
    publicController.getPublicMahallahMembersByZone 
);

// GET Mahallah members by location and zone (location ignored, zone used by controller)
// e.g., /api/public/members/mahallah/Colombo/Zone1 
router.get(
    '/members/mahallah/:location/:zone', 
    validateLocationAndZoneParams, // Validates both, though controller prioritizes 'zone'
    validatePublicRequest,
    publicController.getPublicMahallahMembersByZone
);


// ==============================
// Hifl Member Public Routes (to be added in future)
// ==============================


module.exports = router;
