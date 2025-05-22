// This controller is for demonstrating protected routes.
// In a real application, you'd have more user-related logic here.

const getMe = async (req, res) => {
  // req.user is attached by the authMiddleware (protect)
  // It contains the payload from the JWT (e.g., id, username)
  if (!req.user) {
    return res.status(400).json({ message: 'User data not found in request. This should not happen if middleware is correct.' });
  }

  // You might want to fetch fresh user data from the database
  // using req.user.id if you need more than what's in the token.
  // For this example, returning the token payload is sufficient.
  res.status(200).json({
    message: 'Successfully accessed protected user data.',
    user: req.user,
  });
};

module.exports = {
  getMe,
};
