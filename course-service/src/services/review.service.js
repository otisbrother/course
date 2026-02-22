const ReviewModel = require('../models/review.model');
const CourseModel = require('../models/course.model');

class ReviewService {
  static async getReviewsByCourse(courseId, page, limit) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return await ReviewModel.findByCourseId(courseId, page, limit);
  }

  static async createReview(reviewData, currentUser) {
    // Check if course exists
    const course = await CourseModel.findById(reviewData.course_id);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user already reviewed this course
    const existingReview = await ReviewModel.findByUserAndCourse(currentUser.id, reviewData.course_id);
    if (existingReview) {
      throw new Error('You have already reviewed this course');
    }

    // Teachers cannot review their own courses
    if (course.teacher_id === currentUser.id) {
      throw new Error('You cannot review your own course');
    }

    return await ReviewModel.create({
      ...reviewData,
      user_id: currentUser.id
    });
  }

  static async updateReview(id, reviewData, currentUser) {
    const review = await ReviewModel.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    // Only the author can update
    if (review.user_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to update this review');
    }

    return await ReviewModel.update(id, reviewData);
  }

  static async deleteReview(id, currentUser) {
    const review = await ReviewModel.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    // Only the author or admin can delete
    if (review.user_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to delete this review');
    }

    return await ReviewModel.delete(id);
  }
}

module.exports = ReviewService;
