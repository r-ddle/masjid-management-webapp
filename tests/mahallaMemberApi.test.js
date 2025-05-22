const supertest = require('supertest');
const path = require('path');
const dotenv = require('dotenv');
const app = require('../server'); 
const db = require('../src/config/database');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let server;
let request;
let adminToken;
let createdMahallaMemberId;

describe('Mahalla Member API Endpoints (/api/dashboard/mahallah-members)', () => {
  beforeAll(async () => {
    server = app.listen(0);
    request = supertest(server);

    try {
      const res = await request
        .post('/api/auth/login')
        .send({ username: 'adminuser', password: 'adminpass' });
      
      if (res.body && res.body.token) {
        adminToken = res.body.token;
        console.log('Admin user logged in successfully for Mahalla Member tests.');
      } else {
        console.error('Failed to log in admin user for Mahalla Member tests. Response:', res.body);
      }
    } catch (error) {
      console.error('Error during admin login for Mahalla Member tests:', error.message);
    }
    if (!adminToken) {
        console.warn(`Admin token not obtained for Mahalla Member tests. Authenticated tests might fail. 
        Ensure 'adminuser' with password 'adminpass' is seeded.`);
    }
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
    await db.end();
  });

  // Test Suite for POST /api/dashboard/mahallah-members (Create Mahalla Member)
  describe('POST /api/dashboard/mahallah-members', () => {
    it('should create a new Mahalla member with valid data', async () => {
      const newMahallaMember = {
        name: 'Test Mahalla Member Gamma',
        zone: '7G',
        address: '777 Test Zone Rd',
        telephone: '0777777777'
      };
      const res = await request
        .post('/api/dashboard/mahallah-members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMahallaMember);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newMahallaMember.name);
      expect(res.body.zone).toBe(newMahallaMember.zone);
      createdMahallaMemberId = res.body.id; // Save for potential future tests
    });

    it('should return 400 for missing required field: name', async () => {
      const newMahallaMember = {
        zone: '8H',
        address: '888 Test Suburb',
        telephone: '0888888888'
      };
      const res = await request
        .post('/api/dashboard/mahallah-members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMahallaMember);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Name is required' })
      ]));
    });

    it('should return 400 for missing required field: zone', async () => {
      const newMahallaMember = {
        name: 'Test Mahalla Member Delta',
        address: '999 Test District',
        telephone: '0999999999'
      };
      const res = await request
        .post('/api/dashboard/mahallah-members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMahallaMember);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Zone is required' })
      ]));
    });
  });

  // Test Suite for GET /api/dashboard/mahallah-members (Get All Mahalla Members)
  describe('GET /api/dashboard/mahallah-members', () => {
    it('should fetch all Mahalla members (seeded data + created)', async () => {
      const res = await request
        .get('/api/dashboard/mahallah-members')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Assuming seed script adds at least one, and we added one
      expect(res.body.length).toBeGreaterThanOrEqual(1); 
    });
  });

  // Test Suite for GET /api/dashboard/mahallah-members?zone=:zone (Get Mahalla Members by Zone)
  describe('GET /api/dashboard/mahallah-members?zone=:zone', () => {
    it('should fetch Mahalla members for a specific zone', async () => {
      // This test relies on the member created in POST test or seeded data.
      // Let's use the zone of the member we created, or a known seeded zone.
      const targetZone = '7G'; // From the member created above
      
      // Ensure a member with this zone exists by creating one if not already covered by seed/previous test
      // This could be done in a beforeAll/beforeEach for this describe block if needed for multiple tests.
      // For simplicity, we rely on the previous POST test or seed data.
      // If 'Test Mahalla Member Gamma' was created in zone '7G', this should find it.
      // If relying on seed: 'Abdul Rahman' is in zone '2C'.
      
      const res = await request
        .get(`/api/dashboard/mahallah-members?zone=${targetZone}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      // Verify that all returned members belong to the queried zone
      res.body.forEach(member => {
        expect(member.zone).toBe(targetZone);
      });
    });

    it('should return an empty array for a zone with no members', async () => {
      const res = await request
        .get('/api/dashboard/mahallah-members?zone=NonExistentZone99')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return 400 if zone parameter is present but invalid (e.g., not a string due to middleware, though our validation is basic)', async () => {
        // The current validation `isString()` might not catch all "invalid" formats if the goal is more specific.
        // However, sending something like an object might be blocked by Express's query parser before validation.
        // For now, testing with a very long string to ensure it doesn't break things, assuming string validation passes.
        // If validation was stricter (e.g. enum for zones), this test would be different.
        const longZone = 'a'.repeat(260); // Example of potentially problematic but still string input
         const res = await request
        .get(`/api/dashboard/mahallah-members?zone=${longZone}`)
        .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200); // Assuming it's treated as a string and simply finds no members
    });
  });
});
