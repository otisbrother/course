const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Known errors
  const notFoundErrors = [
    'Course not found',
    'Enrollment not found'
  ];

  if (notFoundErrors.includes(err.message)) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }

  const forbiddenErrors = [
    'Not authorized to update this enrollment',
    'Not authorized to unenroll'
  ];

  if (forbiddenErrors.includes(err.message)) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  const badRequestErrors = [
    'Already enrolled in this course',
    'Course is not available for enrollment',
    'Progress must be between 0 and 100'
  ];

  if (badRequestErrors.includes(err.message)) {
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
