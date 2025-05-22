const db = require('../config/database');

/**
 * Finds a user by their username.
 * @async
 * @param {string} username - The username to search for.
 * @returns {Promise<Object|undefined>} The user object if found (including password_hash), otherwise undefined.
 */
const findUserByUsername = async (username) => {
  const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0];
};

/**
 * Creates a new user in the database.
 * @async
 * @param {string} username - The username for the new user.
 * @param {string} passwordHash - The hashed password for the new user.
 * @returns {Promise<Object>} The newly created user object (id, username, created_at, updated_at), excluding the password_hash.
 */
const createUser = async (username, passwordHash, address = null, isAdmin = false) => {
  const { rows } = await db.query(
    'INSERT INTO users (username, password_hash, address, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, username, address, is_admin, created_at, updated_at',
    [username, passwordHash, address, isAdmin]
  );
  return rows[0];
};

// Later, you might add functions like:
// const findUserById = async (id) => { ... };
// const updateUser = async (id, updates) => { ... };
// const deleteUser = async (id) => { ... };

module.exports = {
  findUserByUsername,
  createUser,
};
