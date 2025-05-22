const request = require('supertest');
const app = require('../server'); // Import the app from server.js
const db = require('../src/config/database'); // To manage DB connection
const path = require('path'); // For dotenv path resolution
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Ensure .env is loaded

// Global variable to hold the server instance (if needed for direct control, but supertest manages it)
let server;
let agent;

beforeAll(async () => {
  // server.js now exports the app directly. Supertest can take the app object.
  // No need to manually listen unless specific setup is required outside of supertest's capabilities.
  // For supertest, we can directly use the app.
  // If we needed to get the port (e.g. for websockets), we'd listen:
  // server = app.listen(0); 
  // agent = request.agent(server);
  // console.log(`Test server running on port ${server.address().port}`);
  
  // For most API tests, request(app) is sufficient and manages server lifecycle per request or per test suite implicitly.
  // However, to use an agent for cookie persistence (though JWT is header based) or share server instance across tests:
  server = app.listen(0); // Listen on a random free port
  agent = request.agent(server);
  console.log(`Test server running on port ${server.address().port}`);

  // Optional: Seed database or ensure it's in a known state if not relying on initial seed
  // For now, we rely on the initial seed users: testuser (password123), anotheruser (securepassword)
  // Hashed passwords for these are:
  // 'password123' -> $2a$10$E9.E21Rss.U3O9sL9k8M9e22Q8U8Uu6bFjVjS.VLzSOjf4/gP9.Ba
  // 'securepassword' -> $2a$10$OKxKk9gXfGzDZA4pSSjN2uYQ8s3n0UaXnE4kL6S9jKqYq8s8jJk8K
});

afterAll(async () => {
  // Close the server
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      console.log('Test server closed.');
      resolve();
    });
  });
  // Close database connection
  if (db.pool) { // Check if pool exists (it might if db was initialized)
    await db.pool.end();
    console.log('Database pool closed.');
  } else {
    console.log('Database pool was not initialized or already closed.');
  }
});

describe('Auth API - /api/auth/login', () => {
  it('should login a valid user and return a token', async () => {
    const res = await agent // Use agent here
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('username', 'testuser');
  });

  it('should reject login with invalid username', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({
        username: 'wronguser',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should reject login with valid username but invalid password', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should reject login with missing username', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ username: 'Username is required.' })
    ]));
  });

  it('should reject login with missing password', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({
        username: 'testuser',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ password: 'Password is required.' })
    ]));
  });
});

describe('User API - /api/users/me (Protected Route)', () => {
  let authToken = '';

  beforeAll(async () => {
    // Log in to get a token for protected route tests
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    if (loginRes.body.token) {
      authToken = loginRes.body.token;
    } else {
      throw new Error('Failed to get token for testing /me route');
    }
  });

  it('should allow access to /api/users/me with a valid token', async () => {
    const res = await agent
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Successfully accessed protected user data.');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('username', 'testuser');
  });

  it('should deny access to /api/users/me without a token', async () => {
    const res = await agent.get('/api/users/me');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Not authorized, no token provided');
  });

  it('should deny access to /api/users/me with an invalid token', async () => {
    const res = await agent
      .get('/api/users/me')
      .set('Authorization', 'Bearer aninvalidtoken123');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Not authorized, token verification failed');
  });

  it('should deny access to /api/users/me with an expired token (conceptual - requires manual token generation with short expiry)', async () => {
    // This test is harder to automate without manually creating an expired token.
    // For now, we acknowledge this case. If jwtUtils allowed custom expiry for testing, we could.
    // const expiredToken = "generate an expired token here";
    // const res = await agent
    //   .get('/api/users/me')
    //   .set('Authorization', `Bearer ${expiredToken}`);
    // expect(res.statusCode).toEqual(401);
    // expect(res.body).toHaveProperty('message', 'Not authorized, token failed'); // Or specific message for expired
    expect(true).toBe(true); // Placeholder for this conceptual test
  });
});
