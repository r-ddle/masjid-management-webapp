const db = require('../config/database');
const CustomError = require('../utils/CustomError');

// Create a new Hifl member
const createHiflMember = async (req, res, next) => {
    const { name, address, telephone, location, zone, enrollment_date, status } = req.body;
    try {
        const query = `
            INSERT INTO hifl_members (name, address, telephone, location, zone, enrollment_date, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [name, address, telephone, location, zone, enrollment_date || new Date(), status || 'Active']);
        res.status(201).json(rows[0]);
    } catch (error) {
        next(new CustomError(`Error creating Hifl member: ${error.message}`, 500));
    }
};

// Get all Hifl members, with optional filtering by location and/or zone
const getAllHiflMembers = async (req, res, next) => {
    const { location, zone, status, page = 1, limit = 10 } = req.query;
    
    let baseQuery = 'SELECT * FROM hifl_members';
    const conditions = [];
    const queryParams = [];
    let paramIndex = 1;

    if (location) {
        conditions.push(`location ILIKE $${paramIndex++}`);
        queryParams.push(`%${location}%`);
    }
    if (zone) {
        conditions.push(`zone ILIKE $${paramIndex++}`);
        queryParams.push(`%${zone}%`);
    }
    if (status) {
        conditions.push(`status ILIKE $${paramIndex++}`);
        queryParams.push(`%${status}%`);
    }

    if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ` ORDER BY created_at DESC`; // Default ordering

    // Add pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    try {
        const { rows } = await db.query(baseQuery, queryParams);
        
        // Also get total count for pagination metadata
        let countQuery = 'SELECT COUNT(*) FROM hifl_members';
        if (conditions.length > 0) {
            // Rebuild conditions for count query, using original queryParams before limit/offset
            const countConditions = [];
            const countQueryParams = [];
            let countParamIndex = 1;
            if (location) {
                countConditions.push(`location ILIKE $${countParamIndex++}`);
                countQueryParams.push(`%${location}%`);
            }
            if (zone) {
                countConditions.push(`zone ILIKE $${countParamIndex++}`);
                countQueryParams.push(`%${zone}%`);
            }
            if (status) {
                countConditions.push(`status ILIKE $${countParamIndex++}`);
                countQueryParams.push(`%${status}%`);
            }
            countQuery += ' WHERE ' + countConditions.join(' AND ');
            const countResult = await db.query(countQuery, countQueryParams);
            const totalItems = parseInt(countResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalItems / limit);
             res.status(200).json({
                data: rows,
                pagination: {
                    currentPage: parseInt(page, 10),
                    totalPages,
                    totalItems,
                    limit: parseInt(limit, 10)
                }
            });
        } else {
            // No filters, count all
            const countResult = await db.query(countQuery);
            const totalItems = parseInt(countResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalItems / limit);
            res.status(200).json({
                data: rows,
                pagination: {
                    currentPage: parseInt(page, 10),
                    totalPages,
                    totalItems,
                    limit: parseInt(limit, 10)
                }
            });
        }

    } catch (error) {
        next(new CustomError(`Error fetching Hifl members: ${error.message}`, 500));
    }
};

// Get a Hifl member by ID
const getHiflMemberById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM hifl_members WHERE id = $1;';
        const { rows } = await db.query(query, [id]);
        if (rows.length === 0) {
            return next(new CustomError('Hifl member not found', 404));
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        next(new CustomError(`Error fetching Hifl member by ID: ${error.message}`, 500));
    }
};

// Update a Hifl member by ID
const updateHiflMember = async (req, res, next) => {
    const { id } = req.params;
    const { name, address, telephone, location, zone, enrollment_date, status } = req.body;
    try {
        const checkQuery = 'SELECT * FROM hifl_members WHERE id = $1;';
        const checkResult = await db.query(checkQuery, [id]);
        if (checkResult.rows.length === 0) {
            return next(new CustomError('Hifl member not found for update', 404));
        }

        const query = `
            UPDATE hifl_members
            SET name = $1, address = $2, telephone = $3, location = $4, zone = $5, enrollment_date = $6, status = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *;
        `;
        const { rows } = await db.query(query, [name, address, telephone, location, zone, enrollment_date, status, id]);
        res.status(200).json(rows[0]);
    } catch (error) {
        next(new CustomError(`Error updating Hifl member: ${error.message}`, 500));
    }
};

// Delete a Hifl member by ID
const deleteHiflMember = async (req, res, next) => {
    const { id } = req.params;
    try {
        const checkQuery = 'SELECT * FROM hifl_members WHERE id = $1;';
        const checkResult = await db.query(checkQuery, [id]);
        if (checkResult.rows.length === 0) {
            return next(new CustomError('Hifl member not found for deletion', 404));
        }

        const query = 'DELETE FROM hifl_members WHERE id = $1 RETURNING *;';
        const { rows } = await db.query(query, [id]);
        res.status(200).json({ message: 'Hifl member deleted successfully', deletedMember: rows[0] });
    } catch (error) {
        next(new CustomError(`Error deleting Hifl member: ${error.message}`, 500));
    }
};

module.exports = {
    createHiflMember,
    getAllHiflMembers,
    getHiflMemberById,
    updateHiflMember,
    deleteHiflMember,
};
