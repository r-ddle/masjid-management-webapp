const authService = require('../services/authService');
const CustomError = require('../utils/CustomError');
const { validationResult } = require('express-validator');
const db = require('../config/database'); // Import db for direct access
const { hashPassword } = require('../utils/passwordUtils'); // For password updates

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
  },

  async getAllAdmins(req, res, next) {
    const { page = 1, limit = 10 } = req.query;
    try {
      const offset = (page - 1) * limit;
      
      const adminsQuery = `
        SELECT id, username, address, created_at, updated_at 
        FROM users 
        WHERE is_admin = true 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;
      const { rows: admins } = await db.query(adminsQuery, [limit, offset]);

      const countQuery = 'SELECT COUNT(*) FROM users WHERE is_admin = true;';
      const countResult = await db.query(countQuery);
      const totalItems = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        data: admins,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages,
          totalItems,
          limit: parseInt(limit, 10)
        }
      });
    } catch (error) {
      next(new CustomError(`Error fetching admins: ${error.message}`, 500));
    }
  },

  async getAdminById(req, res, next) {
    const { adminId } = req.params;
    try {
      const query = `
        SELECT id, username, address, created_at, updated_at 
        FROM users 
        WHERE id = $1 AND is_admin = true;
      `;
      const { rows } = await db.query(query, [adminId]);
      if (rows.length === 0) {
        return next(new CustomError('Admin user not found', 404));
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      next(new CustomError(`Error fetching admin by ID: ${error.message}`, 500));
    }
  },

  async updateAdmin(req, res, next) {
    const { adminId } = req.params;
    const { address, password } = req.body;

    // Username is not updatable for now as per decision
    // const { username, address, password } = req.body; 

    try {
      // Check if admin exists
      const adminExists = await db.query('SELECT * FROM users WHERE id = $1 AND is_admin = true', [adminId]);
      if (adminExists.rows.length === 0) {
        return next(new CustomError('Admin user not found for update', 404));
      }

      const updateFields = [];
      const queryParams = [];
      let paramIndex = 1;

      if (address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`);
        queryParams.push(address);
      }

      if (password) {
        const hashedPassword = await hashPassword(password);
        updateFields.push(`password_hash = $${paramIndex++}`);
        queryParams.push(hashedPassword);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`); // Always update updated_at

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex++} AND is_admin = true
        RETURNING id, username, address, created_at, updated_at;
      `;
      queryParams.push(adminId);
      
      const { rows } = await db.query(query, queryParams);
      if (rows.length === 0) {
         // Should not happen if adminExists check passed, but as a safeguard
        return next(new CustomError('Failed to update admin user or admin not found', 404));
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      next(new CustomError(`Error updating admin: ${error.message}`, 500));
    }
  },

  async deleteAdmin(req, res, next) {
    const { adminId } = req.params;
    const requestingAdminId = req.user.id; // From protect middleware

    if (parseInt(adminId, 10) === requestingAdminId) {
      return next(new CustomError('Admins cannot delete their own account.', 403));
    }

    try {
      const query = 'DELETE FROM users WHERE id = $1 AND is_admin = true RETURNING id;';
      const { rows } = await db.query(query, [adminId]);
      if (rows.length === 0) {
        return next(new CustomError('Admin user not found for deletion or user is not an admin', 404));
      }
      res.status(200).json({ message: 'Admin user deleted successfully', adminId: rows[0].id });
    } catch (error) {
      next(new CustomError(`Error deleting admin: ${error.message}`, 500));
    }
  }
};

module.exports = adminController;
