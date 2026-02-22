const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Known errors
  if (err.message === 'User not found') {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }

  if (err.message === 'Only admin can delete users' ||
      err.message === 'Only admin can change user roles' ||
      err.message === 'Unauthorized to update this user') {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  if (err.message === 'Cannot delete your own account' ||
      err.message === 'No fields to update') {
    return res.status(400).json({
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
