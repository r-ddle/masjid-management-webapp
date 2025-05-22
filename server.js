require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./src/config/database'); // Updated path
const authRoutes = require('./src/routes/authRoutes'); // Updated path
const userRoutes = require('./src/routes/userRoutes'); // Import user routes
const memberRoutes = require('./src/routes/memberRoutes'); // Import member routes
const mahallaMemberRoutes = require('./src/routes/mahallaMemberRoutes'); // Import MahallaMember routes
const adminRoutes = require('./src/routes/adminRoutes'); // Import Admin routes
const publicRoutes = require('./src/routes/publicRoutes'); // Import public routes
const hiflMemberRoutes = require('./src/routes/hiflMemberRoutes'); // Import Hifl member routes
const { protect } = require('./src/middleware/authMiddleware'); // Import protect middleware

const helmet = require('helmet'); // Import helmet

const app = express();
const PORT = process.env.PORT || 3000;

const morgan = require('morgan'); // Import morgan

// Apply Helmet early in the middleware stack
app.use(helmet());

// HTTP Request Logging (Morgan)
// Place it early, but after static files if any were served before it for performance.
// 'dev' format is concise and good for development.
app.use(morgan('dev'));

// Rate Limiting
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the api limiter to all requests starting with /api
app.use('/api', apiLimiter);

// CORS Configuration
const cors = require('cors');
// For development, allow all origins.
// For production, configure specific origins: cors({ origin: process.env.CORS_ORIGIN })
app.use(cors()); 

// Connect to Database
// db.connect(); // Call connect method which handles connection and logging

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from 'public' folder (if you have one)
app.use(express.static(path.join(__dirname, 'public')));

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected HTML routes
app.get('/dashboard.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Routes
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth
app.use('/api/users', userRoutes); // Mount user routes under /api/users
app.use('/api/dashboard', memberRoutes); // Mount member routes under /api/dashboard
app.use('/api/dashboard/mahallah-members', mahallaMemberRoutes); // Mount MahallaMember routes
app.use('/api/dashboard/admins', adminRoutes); // Mount Admin routes
app.use('/api/dashboard/hifl-members', hiflMemberRoutes); // Mount Hifl member routes
app.use('/api/public', publicRoutes); // Mount public routes under /api/public

// Global error handler (optional, can be expanded in src/middleware)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// Mount the centralized error handler **after** all other middleware and routes
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// Start the server after ensuring DB connection (optional, based on db.connect behavior)
// If db.connect is asynchronous and you want to ensure connection before starting server:
// db.connect().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }).catch(err => {
//   console.error('Failed to connect to the database. Server not started.', err);
//   process.exit(1);
// });

// If db.connect handles its own errors and doesn't need to block server start:
// app.listen(PORT, async () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   try {
//     // Attempt to connect to the database when the server starts.
//     // The pool will emit 'connect' or 'error' events as defined in database.js
//     await db.query('SELECT NOW()'); // A simple query to check connection
//     console.log('Database connection verified on server start.');
//   } catch (err) {
//     console.error('Error verifying database connection on server start:', err.message);
//     // Depending on your needs, you might want to exit if the DB isn't available
//     // process.exit(1);
//   }
// });

// Only start listening if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
      await db.query('SELECT NOW()');
      console.log('Database connection verified on server start.');
    } catch (err) {
      console.error('Error verifying database connection on server start:', err.message);
    }
  });
}

module.exports = app; // Export app for testing purposes
