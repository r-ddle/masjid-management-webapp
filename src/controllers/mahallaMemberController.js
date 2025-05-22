const mahallaMemberService = require('../services/mahallaMemberService'); // May not be used if direct DB access is preferred for complex queries
const CustomError = require('../utils/CustomError');
const db = require('../config/database'); // For direct DB access

const mahallaMemberController = {
  // The new getAllMahallaMembers function to handle filtering and pagination
  async getAllMahallaMembers(req, res, next) {
    const { location, zone, search, page = 1, limit = 10 } = req.query;
    
    try {
      let baseQuery = 'SELECT id, name, zone, address, telephone FROM mahallah_members'; // Explicitly list columns
      const countQueryBase = 'SELECT COUNT(*) FROM mahallah_members';
      const conditions = [];
      const queryParams = [];
      let paramIndex = 1;

      if (zone) { // Prioritize explicit zone filter
        conditions.push(`zone ILIKE $${paramIndex++}`);
        queryParams.push(`%${zone}%`);
      } else if (location) {
        // If no explicit zone, but location is provided, attempt to filter zone by location value.
        // This is a limited interpretation of 'location' for Mahallah members.
        // Robust location filtering (grouping multiple zones) requires a location-to-zone mapping.
        conditions.push(`zone ILIKE $${paramIndex++}`);
        queryParams.push(`%${location}%`); 
      }
      
      if (search) {
        conditions.push(`(name ILIKE $${paramIndex++} OR address ILIKE $${paramIndex++} OR telephone ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      let whereClause = '';
      if (conditions.length > 0) {
        whereClause = ' WHERE ' + conditions.join(' AND ');
      }
      
      baseQuery += whereClause;
      const finalCountQuery = countQueryBase + whereClause;
      
      const totalItemsResult = await db.query(finalCountQuery, queryParams);
      const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);
      
      const offset = (page - 1) * limit;
      baseQuery += ` ORDER BY name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      // Add limit and offset to a *copy* of queryParams for the main query,
      // as the count query should not have limit/offset.
      const mainQueryParams = [...queryParams, limit, offset];
      
      const { rows: members } = await db.query(baseQuery, mainQueryParams);
      
      res.json({
        data: members,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages,
          totalItems,
          limit: parseInt(limit, 10),
        },
      });

    } catch (error) {
      console.error('Error in getAllMahallaMembers:', error.message); // Log the specific error
      next(new CustomError(`Error fetching Mahallah members: ${error.message}`, 500));
    }
  },

  async createMahallaMember(req, res, next) {
    try {
      // Input validation is expected to be handled by middleware
      const memberData = req.body;
      // Assuming addMahallaMember service method exists and handles DB insertion
      const newMember = await mahallaMemberService.addMahallaMember(memberData); 
      res.status(201).json(newMember);
    } catch (error) {
      next(error); // Errors from service layer (like DB errors) should be caught
    }
  },

  // Placeholder for getMahallaMemberById - if needed for dashboard operations
  async getMahallaMemberById(req, res, next) {
    const { memberId } = req.params;
    try {
      const query = 'SELECT id, name, zone, address, telephone FROM mahallah_members WHERE id = $1';
      const { rows } = await db.query(query, [memberId]);
      if (rows.length === 0) {
        return next(new CustomError('Mahallah member not found', 404));
      }
      res.json(rows[0]);
    } catch (error) {
      next(new CustomError(`Error fetching Mahallah member by ID: ${error.message}`, 500));
    }
  },

  // Placeholder for updateMahallaMember - if needed for dashboard operations
  async updateMahallaMember(req, res, next) {
    const { memberId } = req.params;
    const { name, zone, address, telephone } = req.body; // Add other updatable fields
    try {
      const query = `
        UPDATE mahallah_members 
        SET name = $1, zone = $2, address = $3, telephone = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 RETURNING *`;
      const { rows } = await db.query(query, [name, zone, address, telephone, memberId]);
      if (rows.length === 0) {
        return next(new CustomError('Mahallah member not found or failed to update', 404));
      }
      res.json(rows[0]);
    } catch (error) {
      next(new CustomError(`Error updating Mahallah member: ${error.message}`, 500));
    }
  },

  // Placeholder for deleteMahallaMember - if needed
  async deleteMahallaMember(req, res, next) {
    const { memberId } = req.params;
    try {
      const query = 'DELETE FROM mahallah_members WHERE id = $1 RETURNING id';
      const { rows } = await db.query(query, [memberId]);
      if (rows.length === 0) {
        return next(new CustomError('Mahallah member not found for deletion', 404));
      }
      res.status(200).json({ message: 'Mahallah member deleted successfully', memberId: rows[0].id });
    } catch (error) {
      next(new CustomError(`Error deleting Mahallah member: ${error.message}`, 500));
    }
  }
};

module.exports = mahallaMemberController;
