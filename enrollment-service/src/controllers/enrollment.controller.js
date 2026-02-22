const EnrollmentService = require('../services/enrollment.service');

class EnrollmentController {
  static async getMyEnrollments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await EnrollmentService.getMyEnrollments(req.user.id, page, limit);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEnrollmentsByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await EnrollmentService.getEnrollmentsByCourse(
        parseInt(courseId), 
        page, 
        limit, 
        req.user
      );
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async enroll(req, res, next) {
    try {
      const { course_id } = req.body;
      const enrollment = await EnrollmentService.enrollInCourse(course_id, req.user);
      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      const enrollment = await EnrollmentService.updateProgress(parseInt(id), progress, req.user);
      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }

  static async unenroll(req, res, next) {
    try {
      const { id } = req.params;
      await EnrollmentService.unenroll(parseInt(id), req.user);
      res.json({
        success: true,
        message: 'Successfully unenrolled from course'
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkEnrollment(req, res, next) {
    try {
      const { courseId } = req.params;
      const result = await EnrollmentService.checkEnrollment(req.user.id, parseInt(courseId));
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyStats(req, res, next) {
    try {
      const stats = await EnrollmentService.getMyStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EnrollmentController;
