const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Known errors
  const notFoundErrors = [
    'Course not found',
    'Category not found',
    'Section not found',
    'Lesson not found',
    'Review not found'
  ];

  if (notFoundErrors.includes(err.message)) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }

  const forbiddenErrors = [
    'Only teachers or admins can create courses',
    'Only admins can create categories',
    'Only admins can update categories',
    'Only admins can delete categories',
    'Not authorized to update this course',
    'Not authorized to delete this course',
    'Not authorized to add sections to this course',
    'Not authorized to update this section',
    'Not authorized to delete this section',
    'Not authorized to add lessons to this course',
    'Not authorized to update this lesson',
    'Not authorized to delete this lesson',
    'Not authorized to update this review',
    'Not authorized to delete this review'
  ];

  if (forbiddenErrors.includes(err.message)) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  const badRequestErrors = [
    'You have already reviewed this course',
    'You cannot review your own course'
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
