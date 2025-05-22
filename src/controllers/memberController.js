const memberService = require('../services/memberService');
const CustomError = require('../utils/CustomError');

const memberController = {
  async getMembers(req, res, next) {
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

  async createMember(req, res, next) {
    try {
      // Input validation is expected to be handled by middleware before this controller function
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
      // Input validation is expected to be handled by middleware
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
       if (!result || !result.memberId) { // Check if member was actually deleted
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
      // Location might be part of JWT or not directly needed if memberId is unique across locations
      // For now, assuming memberId is sufficient.

      // Validation for month and status is expected to be handled by middleware
      
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
