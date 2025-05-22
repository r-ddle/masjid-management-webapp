const supertest = require('supertest');
const path = require('path');
const dotenv = require('dotenv');
const app = require('../server'); 
const db = require('../src/config/database');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let server;
let request;
let adminToken; // Token for the initial 'adminuser'
let createdAdminId; // To store ID of admin created during tests, if needed for cleanup or other tests

describe('Admin API Endpoints (/api/dashboard/admins)', () => {
  beforeAll(async () => {
    server = app.listen(0);
    request = supertest(server);

    try {
      const res = await request
        .post('/api/auth/login')
        .send({ username: 'adminuser', password: 'adminpass' });
      
      if (res.body && res.body.token) {
        adminToken = res.body.token;
        console.log('Initial admin user logged in successfully for Admin API tests.');
      } else {
        console.error('Failed to log in initial admin user for Admin API tests. Response:', res.body);
      }
    } catch (error) {
      console.error('Error during initial admin login for Admin API tests:', error.message);
    }

    if (!adminToken) {
        console.warn(`Initial admin token not obtained for Admin API tests. Authenticated tests might fail. 
        Ensure 'adminuser' with password 'adminpass' is seeded.`);
    }
  });

  afterAll(async () => {
    // Optional: Clean up created admin if necessary
    if (createdAdminId) {
      try {
        // This would require a DELETE admin endpoint or direct DB operation
        // For now, we'll just log it. Proper cleanup is a future enhancement.
        console.log(`Test-created admin with ID ${createdAdminId} would be cleaned up here.`);
        // await db.query('DELETE FROM users WHERE id = $1 AND username LIKE $2', [createdAdminId, 'newtestadmin_%']);
      } catch (err) {
        console.error('Error during test admin cleanup:', err.message);
      }
    }
    if (server) {
      await server.close();
    }
    await db.end();
  });

  // Test Suite for POST /api/dashboard/admins (Create Admin)
  describe('POST /api/dashboard/admins', () => {
    const uniqueTimestamp = Date.now();
    const newAdminUsername = `newtestadmin_${uniqueTimestamp}`;
    const newAdminPassword = 'password1234';

    it('should create a new admin user with valid data', async () => {
      const newAdmin = {
        username: newAdminUsername,
        password: newAdminPassword,
        address: '100 Admin Lane'
      };
      const res = await request
        .post('/api/dashboard/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAdmin);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toBe(newAdmin.username);
      expect(res.body.user.is_admin).toBe(true);
      expect(res.body.user).not.toHaveProperty('password_hash'); // Ensure password hash isn't returned
      createdAdminId = res.body.user.id; // Store for potential cleanup
    });

    it('should return 409 (Conflict) when trying to create an admin with an existing username', async () => {
      // Attempt to create the same admin again
      const existingAdmin = {
        username: newAdminUsername, // Using the username created in the previous test
        password: 'anotherPassword',
        address: '101 Admin Lane'
      };
      const res = await request
        .post('/api/dashboard/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(existingAdmin);
      expect(res.statusCode).toEqual(409); // As per CustomError('Username already exists', 409)
      expect(res.body.message).toContain('Username already exists');
    });

    it('should return 400 for missing username', async () => {
      const adminWithoutUsername = {
        password: 'password123',
        address: '102 Admin Lane'
      };
      const res = await request
        .post('/api/dashboard/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminWithoutUsername);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Username is required' })
      ]));
    });

    it('should return 400 for missing password', async () => {
      const adminWithoutPassword = {
        username: `anothernewadmin_${Date.now()}`,
        address: '103 Admin Lane'
      };
      const res = await request
        .post('/api/dashboard/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminWithoutPassword);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Password must be at least 6 characters long' }) // Or just "Password is required" if notEmpty is hit first
      ]));
    });

    it('should return 400 for a short password (less than 6 characters)', async () => {
      const adminWithShortPassword = {
        username: `shortpassadmin_${Date.now()}`,
        password: '123', // Short password
        address: '104 Admin Lane'
      };
      const res = await request
        .post('/api/dashboard/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminWithShortPassword);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Password must be at least 6 characters long' })
      ]));
    });

    it('should not allow admin creation if not authenticated (no token)', async () => {
        const newAdmin = {
            username: `noauthadmin_${Date.now()}`,
            password: 'password1234',
            address: '105 Admin Lane'
        };
        const res = await request
            .post('/api/dashboard/admins')
            // No .set('Authorization', `Bearer ${adminToken}`)
            .send(newAdmin);
        expect(res.statusCode).toEqual(401); // Expect "Not authorized, no token provided"
        expect(res.body.message).toContain('Not authorized, no token provided');
    });
  });
});
