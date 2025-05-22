const db = require('../config/database');

const MahallaMember = {
  async getAll() {
    const query = 'SELECT * FROM mahallah_members ORDER BY name ASC';
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error getting all mahalla members:', error);
      throw error;
    }
  },

  async findByZone(zone) {
    const query = 'SELECT * FROM mahallah_members WHERE zone = $1 ORDER BY name ASC';
    try {
      const { rows } = await db.query(query, [zone]);
      return rows;
    } catch (error) {
      console.error('Error finding mahalla members by zone:', error);
      throw error;
    }
  },
  
  async create(memberData) {
    const { name, zone, address, telephone } = memberData;
    const query = `
      INSERT INTO mahallah_members (name, zone, address, telephone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const values = [name, zone, address, telephone];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error creating mahalla member:', error);
      throw error;
    }
  }
};

module.exports = MahallaMember;
