const db = require('../config/database');

const Member = {
  async findByLocation(location) {
    const query = 'SELECT * FROM members WHERE location = $1 ORDER BY name ASC';
    try {
      const { rows } = await db.query(query, [location]);
      return rows;
    } catch (error) {
      console.error('Error finding members by location:', error);
      throw error;
    }
  },

  async create(memberData) {
    const { name, telephone, address, location, janaza2024 } = memberData;
    const query = `
      INSERT INTO members (name, telephone, address, location, janaza2024, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const values = [name, telephone, address, location, janaza2024 || {}];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  async findById(id) {
    const query = 'SELECT * FROM members WHERE id = $1';
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error finding member by ID:', error);
      throw error;
    }
  },

  async update(id, data) {
    const { name, telephone, address, location, janaza2024 } = data;
    const query = `
      UPDATE members
      SET name = $1, telephone = $2, address = $3, location = $4, janaza2024 = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const values = [name, telephone, address, location, janaza2024, id];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  async remove(id) {
    const query = 'DELETE FROM members WHERE id = $1 RETURNING *;';
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }
};

module.exports = Member;
