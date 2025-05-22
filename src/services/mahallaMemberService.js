const MahallaMember = require('../models/MahallaMember');

const mahallaMemberService = {
  async getMahallaMembers(zone) {
    try {
      if (zone) {
        return await MahallaMember.findByZone(zone);
      }
      return await MahallaMember.getAll();
    } catch (error) {
      console.error('Service error: Failed to get mahalla members:', error);
      throw error;
    }
  },

  async addMahallaMember(memberData) {
    try {
      return await MahallaMember.create(memberData);
    } catch (error) {
      console.error('Service error: Failed to add new mahalla member:', error);
      throw error;
    }
  }
  // Future: Add update and delete services if needed
};

module.exports = mahallaMemberService;
