const bcrypt = require('bcryptjs');

/**
 * Hashes a plain text password using bcrypt.
 * @async
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The hashed password.
 * @throws {Error} If hashing fails.
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // 10 rounds is generally a good balance
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error; // Or handle it more gracefully depending on your error handling strategy
  }
};

/**
 * Compares a plain text password with a hashed password using bcrypt.
 * @async
 * @param {string} password - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 * @throws {Error} If comparison fails.
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw error; // Or handle it
  }
};

module.exports = {
  hashPassword,
  comparePassword,
};
