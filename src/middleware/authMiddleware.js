const { verifyToken } = require('../utils/jwtUtils');
const CustomError = require('../utils/CustomError'); // Import CustomError

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        // verifyToken already logs the specific JWT error
        throw new CustomError('Not authorized, token verification failed', 401);
      }

      // Attach user to the request object
      // You can choose to attach just the decoded payload (which has id, username)
      // Or fetch fresh user data from DB (excluding password) if you need up-to-date info
      // For this example, we'll attach the decoded payload.
      req.user = { id: decoded.id, username: decoded.username };

      next();
    } catch (error) {
      // If error is already a CustomError, pass it, otherwise wrap it
      if (error instanceof CustomError) {
        return next(error);
      }
      // Log the original error for server-side debugging if it's unexpected
      console.error('Unexpected error in auth middleware:', error);
      return next(new CustomError('Not authorized, an unexpected error occurred', 401));
    }
  }

  if (!token) {
    return next(new CustomError('Not authorized, no token provided', 401));
  }
};

module.exports = { protect };
