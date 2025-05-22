const supertest = require('supertest');
const path = require('path');
const dotenv = require('dotenv'); // To load .env
const app = require('../server'); // Assuming server.js exports the app
const db = require('../src/config/database'); // Pool for DB ops

// Load .env file (using a test-specific one if available, or default)
// For this exercise, we assume the main .env is used or tests are configured to handle it.
// If you have a .env.test, use: dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });


let server;
let request;
let adminToken;
let createdMemberId; // To store ID of member created during tests

describe('Member API Endpoints (/api/dashboard/members)', () => {
  beforeAll(async () => {
    // Start server on a random available port
    server = app.listen(0); 
    request = supertest(server);

    // Login as admin user to get token
    // Assumes 'adminuser' with password 'adminpass' exists from seed data
    try {
      const res = await request
        .post('/api/auth/login')
        .send({ username: 'adminuser', password: 'adminpass' });
      
      if (res.body && res.body.token) {
        adminToken = res.body.token;
        console.log('Admin user logged in successfully for tests.');
      } else {
        console.error('Failed to log in admin user for tests. Response:', res.body);
        // Optionally, throw an error to stop tests if admin login is critical
        // throw new Error('Admin login failed, cannot proceed with authenticated tests.');
      }
    } catch (error) {
      console.error('Error during admin login for tests:', error.message);
      // throw error; // Propagate error to fail tests if login is essential
    }
    
    // Fallback if token wasn't set (e.g. adminuser not found or wrong password)
    if (!adminToken) {
        console.warn(`Admin token not obtained. Authenticated tests might fail. 
        Ensure 'adminuser' with password 'adminpass' is seeded.`);
    }
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
    await db.end();
  });

  // Test Suite for POST /api/dashboard/members (Create Member)
  describe('POST /api/dashboard/members', () => {
    it('should create a new member with valid data', async () => {
      const newMember = {
        name: 'Test Member Alpha',
        telephone: '0123456789',
        address: '123 Test Street',
        location: 'AraliyaUyana', // A location used in seed data
        janaza2024: { jan: 'Paid' }
      };
      const res = await request
        .post('/api/dashboard/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMember);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newMember.name);
      expect(res.body.location).toBe(newMember.location);
      createdMemberId = res.body.id; // Save for later tests
    });

    it('should return 400 for missing required field: name', async () => {
      const newMember = {
        telephone: '0123456789',
        address: '123 Test Street',
        location: 'AraliyaUyana'
      };
      const res = await request
        .post('/api/dashboard/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMember);
      expect(res.statusCode).toEqual(400);
      // Assuming express-validator sends errors in an array
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Name is required' })
      ]));
    });

    it('should return 400 for missing required field: location', async () => {
      const newMember = {
        name: 'Test Member Beta',
        telephone: '0987654321',
        address: '456 Test Avenue'
      };
      const res = await request
        .post('/api/dashboard/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMember);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Location is required' })
      ]));
    });
  });

  // Test Suite for GET /api/dashboard/members/:location
  describe('GET /api/dashboard/members/:location', () => {
    it('should fetch members for a seeded location (AraliyaUyana)', async () => {
      const res = await request
        .get('/api/dashboard/members/AraliyaUyana')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Check if at least the member created above is present, or any seeded members
      expect(res.body.length).toBeGreaterThanOrEqual(1); 
    });

    it('should fetch an empty array for a location with no members', async () => {
      const res = await request
        .get('/api/dashboard/members/NonExistentLocation123')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200); // Current behavior is 200 with empty array
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  // Test Suite for GET /api/dashboard/members/id/:memberId
  describe('GET /api/dashboard/members/id/:memberId', () => {
    it('should fetch a specific member by ID', async () => {
      // Assumes createdMemberId was set in the POST test
      expect(createdMemberId).toBeDefined(); 
      const res = await request
        .get(`/api/dashboard/members/id/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', createdMemberId);
      expect(res.body.name).toBe('Test Member Alpha');
    });

    it('should return 404 for a non-existent member ID', async () => {
      const res = await request
        .get('/api/dashboard/members/id/999999') // Assuming 999999 does not exist
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain('Member not found');
    });
  });

  // Test Suite for PUT /api/dashboard/members/:memberId
  describe('PUT /api/dashboard/members/:memberId', () => {
    it('should update an existing member successfully', async () => {
      expect(createdMemberId).toBeDefined();
      const updatedData = {
        name: 'Test Member Alpha Updated',
        telephone: '0112233445',
        address: '123 Updated Street',
        location: 'AraliyaUyana', // Location must be provided as per validation
        janaza2024: { jan: 'Paid', feb: 'Not_Paid' }
      };
      const res = await request
        .put(`/api/dashboard/members/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe(updatedData.name);
      expect(res.body.telephone).toBe(updatedData.telephone);
      expect(res.body.janaza2024.feb).toBe('Not_Paid');
    });

    it('should return 404 when trying to update a non-existent member', async () => {
      const res = await request
        .put('/api/dashboard/members/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost Member', location: 'Somewhere' });
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain('Member not found');
    });

    it('should return 400 for invalid update data (missing name)', async () => {
      expect(createdMemberId).toBeDefined();
      const invalidData = {
        telephone: '123',
        location: 'AraliyaUyana'
      };
      const res = await request
        .put(`/api/dashboard/members/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Name is required' })
      ]));
    });
  });

  // Test Suite for PATCH /api/dashboard/members/:memberId/payment-status
  describe('PATCH /api/dashboard/members/:memberId/payment-status', () => {
    it('should update payment status for a member', async () => {
      expect(createdMemberId).toBeDefined();
      const paymentUpdate = { month: 'mar', status: 'Paid' };
      const res = await request
        .patch(`/api/dashboard/members/${createdMemberId}/payment-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(paymentUpdate);
      expect(res.statusCode).toEqual(200);
      expect(res.body.janaza2024.mar).toBe('Paid');
    });

    it('should return 400 for invalid month', async () => {
      expect(createdMemberId).toBeDefined();
      const paymentUpdate = { month: 'invalidmonth', status: 'Paid' };
      const res = await request
        .patch(`/api/dashboard/members/${createdMemberId}/payment-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(paymentUpdate);
      expect(res.statusCode).toEqual(400);
    });

    it('should return 400 for invalid status', async () => {
      expect(createdMemberId).toBeDefined();
      const paymentUpdate = { month: 'apr', status: 'InvalidStatus' };
      const res = await request
        .patch(`/api/dashboard/members/${createdMemberId}/payment-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(paymentUpdate);
      expect(res.statusCode).toEqual(400);
    });
    
    it('should return 404 for non-existent member ID', async () => {
      const paymentUpdate = { month: 'may', status: 'Paid' };
      const res = await request
        .patch(`/api/dashboard/members/999999/payment-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(paymentUpdate);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test Suite for DELETE /api/dashboard/members/:memberId
  describe('DELETE /api/dashboard/members/:memberId', () => {
    it('should delete a member successfully', async () => {
      expect(createdMemberId).toBeDefined();
      const res = await request
        .delete(`/api/dashboard/members/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Member deleted successfully');
      expect(res.body.memberId).toBe(createdMemberId.toString()); // memberId in response is string
    });

    it('should return 404 when trying to delete a non-existent member', async () => {
      const res = await request
        .delete('/api/dashboard/members/999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain('Member not found');
    });
  });
});
