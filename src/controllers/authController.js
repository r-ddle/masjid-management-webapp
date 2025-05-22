const authService = require('../services/authService');
const { generateToken } = require('../utils/jwtUtils');
// require('dotenv').config(); // .env is usually loaded once at the top of server.js

/**
 * Handles user login requests.
 * Validates input, authenticates the user, and returns a JWT upon success.
 * @async
 * @param {import('express').Request} req - Express request object. Expected body: { username, password }.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const login = async (req, res, next) => {
  // Input validation is handled by express-validator middleware in authRoutes.js
  // If validation fails, the 'validate' middleware in authRoutes.js will call next(error).

  const { username, password } = req.body;

  try {
    const user = await authService.authenticateUser(username, password);
    // If authenticateUser throws an error (e.g., CustomError), it will be caught by the catch block below.

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
      }
    });

  } catch (error) {
    // Pass the error to the centralized error handler
    // This includes CustomErrors thrown by authService (e.g., for invalid credentials)
    // and any other unexpected errors.
    next(error);
  }
};

module.exports = {
  login,
};
