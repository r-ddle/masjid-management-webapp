const jwt = require('jsonwebtoken');
require('dotenv').config(); // To access JWT_SECRET from .env

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

/**
 * Generates a JSON Web Token (JWT) for a given user.
 * @param {Object} user - The user object to include in the token payload. Must contain at least `id` and `username`.
 * @param {string|number} user.id - The user's ID.
 * @param {string} user.username - The user's username.
 * @returns {string} The generated JWT.
 * @throws {Error} If JWT generation fails.
 */
const generateToken = (user) => {
  // Create a payload for the token.
  // Include essential, non-sensitive user information.
  // Do NOT include the password hash or other sensitive details.
  const payload = {
    id: user.id,
    username: user.username,
    // You can add other non-sensitive info like roles, etc.
  };

  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h', // Token expiration time (e.g., 1 hour, 7 days, etc.)
    });
    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error; // Or handle it more gracefully
  }
};

/**
 * Verifies a JSON Web Token (JWT).
 * @param {string} token - The JWT string to verify.
 * @returns {Object|null} The decoded token payload if verification is successful, otherwise null.
 */
const verifyToken = (token) => {
  try {
    // Verify the token using the same secret key
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // Returns the decoded payload (e.g., { id: '...', username: '...', iat: ..., exp: ... })
  } catch (error) {
    // jwt.verify throws an error if the token is invalid (e.g., malformed, expired, signature mismatch)
    console.error('Error verifying JWT:', error.message); // Log specific JWT error
    return null; // Indicate verification failure
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
