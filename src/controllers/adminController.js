const authService = require('../services/authService'); // Re-using authService for admin registration
const CustomError = require('../utils/CustomError');
const { validationResult } = require('express-validator');

const adminController = {
  async createAdmin(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password, address } = req.body;
      // The authService.registerAdmin function is responsible for:
      // 1. Checking if user already exists
      // 2. Hashing the password
      // 3. Calling User.create with username, hashedPassword, address, and isAdmin=true
      const newAdmin = await authService.registerAdmin({ username, password, address });
      
      // The service function already excludes the password_hash
      res.status(201).json({ message: 'Admin user created successfully', user: newAdmin });
    } catch (error) {
      // If it's a CustomError (e.g., username exists, validation fail in service), use its status code
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      // For other errors, pass to the global error handler
      next(error);
    }
  }
};

module.exports = adminController;
