module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base', // Using Airbnb style guide
    'plugin:prettier/recommended', // Integrates Prettier with ESLint
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // Customize or override rules here
    "prettier/prettier": "warn", // Show Prettier issues as warnings
    "no-console": "off", // Allow console.log for this project (can be 'warn' or 'error' in stricter setups)
    "consistent-return": "off", // Allow functions to sometimes return a value and sometimes not (e.g. in middleware)
    "no-unused-vars": ["warn", { "argsIgnorePattern": "next" }], // Warn about unused variables, but ignore 'next' in function parameters
    "no-underscore-dangle": "off", // Allow underscore dangles (e.g. _id in MongoDB or other conventions)
    "no-process-exit": "off", // Allow process.exit, as it's used in jwtUtils and database.js for critical errors
  },
};
