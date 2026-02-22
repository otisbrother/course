const ReviewService = require('../services/review.service');

class ReviewController {
  static async getReviewsByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await ReviewService.getReviewsByCourse(parseInt(courseId), page, limit);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req, res, next) {
    try {
      const reviewData = req.body;
      const currentUser = req.user;
      const review = await ReviewService.createReview(reviewData, currentUser);
      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const reviewData = req.body;
      const currentUser = req.user;
      const review = await ReviewService.updateReview(parseInt(id), reviewData, currentUser);
      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      await ReviewService.deleteReview(parseInt(id), currentUser);
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
