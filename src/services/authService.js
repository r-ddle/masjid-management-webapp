const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const CustomError = require('../utils/CustomError');

/**
 * Authenticates a user based on username and password.
 * @async
 * @param {string} username - The user's username.
 * @param {string} password - The user's plain text password.
 * @returns {Promise<Object>} The user object (excluding password_hash: { id, username, created_at, updated_at }) if authentication is successful.
 * @throws {CustomError} If authentication fails (e.g., user not found, password incorrect).
 */
const authenticateUser = async (username, password) => {
  // No try-catch here, let errors propagate to be caught by the controller or global error handler
  const user = await User.findUserByUsername(username);

  if (!user) {
    console.log(`Login attempt: User '${username}' not found.`);
    throw new CustomError('Invalid credentials', 401);
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    console.log(`Login attempt for '${username}': Password mismatch.`);
    throw new CustomError('Invalid credentials', 401);
  }

  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  authenticateUser,
  async registerAdmin(adminData) {
    const { username, password, address } = adminData;

    // Check if user already exists
    const existingUser = await User.findUserByUsername(username);
    if (existingUser) {
      throw new CustomError('Username already exists', 409); // 409 Conflict
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    // The User.create model function was updated to accept address and isAdmin flag
    try {
      const newUser = await User.create(username, passwordHash, address, true); // true for isAdmin
      // Exclude password_hash from the returned user object
      const { password_hash, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      // Log the detailed error for server-side inspection
      console.error('Error during admin registration in service:', error);
      // Throw a more generic error or a specific one based on the type of error
      throw new CustomError('Failed to register admin user.', 500);
    }
  },
};
