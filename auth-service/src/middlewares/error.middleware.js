const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Known errors
  if (err.message === 'Email already registered') {
    return res.status(409).json({
      success: false,
      message: err.message
    });
  }

  if (err.message === 'Invalid email or password' || 
      err.message === 'Account is inactive' ||
      err.message === 'Invalid token' ||
      err.message === 'Invalid or expired refresh token') {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = { errorHandler };
