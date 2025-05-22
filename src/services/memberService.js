const Member = require('../models/Member');

const memberService = {
  async getMembersByLocation(location) {
    try {
      return await Member.findByLocation(location);
    } catch (error) {
      console.error(`Service error: Failed to get members by location ${location}:`, error);
      throw error;
    }
  },

  async addNewMember(memberData) {
    try {
      return await Member.create(memberData);
    } catch (error) {
      console.error('Service error: Failed to add new member:', error);
      throw error;
    }
  },

  async getMemberById(memberId) {
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new Error('Member not found');
      }
      return member;
    } catch (error) {
      console.error(`Service error: Failed to get member by ID ${memberId}:`, error);
      throw error;
    }
  },

  async updateMember(memberId, memberData) {
    try {
      const updatedMember = await Member.update(memberId, memberData);
      if (!updatedMember) {
        throw new Error('Member not found or failed to update');
      }
      return updatedMember;
    } catch (error) {
      console.error(`Service error: Failed to update member ${memberId}:`, error);
      throw error;
    }
  },

  async deleteMember(memberId) {
    try {
      const deletedMember = await Member.remove(memberId);
      if (!deletedMember) {
        throw new Error('Member not found or failed to delete');
      }
      return { message: 'Member deleted successfully', memberId: deletedMember.id };
    } catch (error) {
      console.error(`Service error: Failed to delete member ${memberId}:`, error);
      throw error;
    }
  },

  async updatePaymentStatus(memberId, month, status) {
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new Error('Member not found');
      }

      // Initialize janaza2024 if it's null or undefined
      member.janaza2024 = member.janaza2024 || {};
      member.janaza2024[month] = status;

      // The Member.update function needs to be capable of handling this update.
      // Assuming Member.update can take the full member object or specific fields to update.
      // If Member.update expects specific fields, this might need adjustment.
      // For now, let's assume it can update the janaza2024 field based on the member object.
      const updatedMember = await Member.update(memberId, { 
        name: member.name, // Keep existing data
        telephone: member.telephone,
        address: member.address,
        location: member.location,
        janaza2024: member.janaza2024 // The updated JSONB field
      });

      if (!updatedMember) {
        throw new Error('Failed to update member payment status');
      }
      return updatedMember;
    } catch (error) {
      console.error(`Service error: Failed to update payment status for member ${memberId}:`, error);
      throw error;
    }
  }
};

module.exports = memberService;
