const mahallaMemberService = require('../services/mahallaMemberService');
const CustomError = require('../utils/CustomError');

const mahallaMemberController = {
  async getMahallaMembers(req, res, next) {
    try {
      // The 'zone' query parameter is optional.
      // If provided, service will filter by zone; otherwise, it gets all members.
      const { zone } = req.query; 
      const members = await mahallaMemberService.getMahallaMembers(zone);
      res.json(members);
    } catch (error) {
      next(error);
    }
  },

  async createMahallaMember(req, res, next) {
    try {
      // Input validation is expected to be handled by middleware
      const memberData = req.body;
      const newMember = await mahallaMemberService.addMahallaMember(memberData);
      res.status(201).json(newMember);
    } catch (error) {
      next(error);
    }
  }
  // Future: Add update and delete controllers if needed
};

module.exports = mahallaMemberController;
