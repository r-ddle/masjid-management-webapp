const memberService = require('../services/memberService');
const CustomError = require('../utils/CustomError');
const db = require('../config/database'); // For direct DB access for new getAllMembers

const memberController = {
  // Renamed original getMembers to avoid conflict, keeping its specific functionality
  async getMembersByLocationParam(req, res, next) {
    try {
      const { location } = req.params;
      if (!location) {
        throw new CustomError('Location parameter is required', 400);
      }
      const members = await memberService.getMembersByLocation(location);
      res.json(members);
    } catch (error) {
      next(error);
    }
  },

  // New function for GET /api/dashboard/members with filtering and pagination
  async getAllMembers(req, res, next) {
    const { location, zone, janazaMonth, janazaStatus, search, page = 1, limit = 10 } = req.query;
    
    try {
      let baseQuery = 'SELECT * FROM members';
      const countQueryBase = 'SELECT COUNT(*) FROM members';
      const conditions = [];
      const queryParams = [];
      let paramIndex = 1;

      if (location) {
        conditions.push(`location ILIKE $${paramIndex++}`);
        queryParams.push(`%${location}%`);
      }
      
      // Zone filter for Janaza members:
      // The 'members' table (Janaza) does not have a dedicated 'zone' column.
      // Implementing a reliable zone filter here would require schema changes or complex string matching.
      // Therefore, the 'zone' query parameter is acknowledged but not applied to the SQL query for Janaza members at this time.
      // If a 'zone' column were added, the condition would be:
      // if (zone) {
      //   conditions.push(`zone ILIKE $${paramIndex++}`);
      //   queryParams.push(`%${zone}%`);
      // }

      if (janazaMonth && janazaStatus) {
        // Ensure janazaMonth is one of the allowed keys to prevent SQL injection type issues if used directly in JSON path
        const allowedMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        if (allowedMonths.includes(janazaMonth.toLowerCase())) {
          conditions.push(`(janaza2024->>'${janazaMonth.toLowerCase()}') ILIKE $${paramIndex++}`);
          queryParams.push(janazaStatus);
        } else {
          // Handle invalid month parameter, perhaps log or ignore
          console.warn(`Invalid janazaMonth parameter received: ${janazaMonth}`);
        }
      }
      
      if (search) {
        conditions.push(`(name ILIKE $${paramIndex++} OR address ILIKE $${paramIndex++} OR telephone ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
      }
      
      const finalCountQuery = countQueryBase + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
      const totalItemsResult = await db.query(finalCountQuery, queryParams);
      const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);
      
      const offset = (page - 1) * limit;
      baseQuery += ` ORDER BY name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(limit, offset);
      
      const { rows: members } = await db.query(baseQuery, queryParams);
      
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
      next(new CustomError(`Error fetching Janaza members: ${error.message}`, 500));
    }
  },

  async createMember(req, res, next) {
    try {
      const memberData = req.body;
      const newMember = await memberService.addNewMember(memberData);
      res.status(201).json(newMember);
    } catch (error) {
      next(error);
    }
  },

  async getMemberById(req, res, next) {
    try {
      const { memberId } = req.params;
      const member = await memberService.getMemberById(memberId);
      if (!member) {
        throw new CustomError('Member not found', 404);
      }
      res.json(member);
    } catch (error) {
      next(error);
    }
  },

  async updateMember(req, res, next) {
    try {
      const { memberId } = req.params;
      const memberData = req.body;
      const updatedMember = await memberService.updateMember(memberId, memberData);
      if (!updatedMember) {
        throw new CustomError('Member not found or failed to update', 404);
      }
      res.json(updatedMember);
    } catch (error) {
      next(error);
    }
  },

  async deleteMember(req, res, next) {
    try {
      const { memberId } = req.params;
      const result = await memberService.deleteMember(memberId);
       if (!result || !result.memberId) { 
        throw new CustomError('Member not found or failed to delete', 404);
      }
      res.status(200).json({ message: 'Member deleted successfully', memberId: result.memberId });
    } catch (error) {
      next(error);
    }
  },

  async updateMemberPaymentStatus(req, res, next) {
    try {
      const { memberId } = req.params;
      const { month, status } = req.body; 
      const updatedMember = await memberService.updatePaymentStatus(memberId, month, status);
      if (!updatedMember) {
        throw new CustomError('Member not found or failed to update payment status', 404);
      }
      res.json(updatedMember);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = memberController;
