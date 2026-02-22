const CourseService = require('../services/course.service');

class CourseController {
  static async getAllCourses(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status || 'published',
        teacher_id: req.query.teacher_id,
        search: req.query.search,
        category_id: req.query.category_id
      };
      const result = await CourseService.getAllCourses(page, limit, filters);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseById(parseInt(id));
      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req, res, next) {
    try {
      const courseData = req.body;
      const currentUser = req.user;
      const course = await CourseService.createCourse(courseData, currentUser);
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const courseData = req.body;
      const currentUser = req.user;
      const course = await CourseService.updateCourse(parseInt(id), courseData, currentUser);
      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      await CourseService.deleteCourse(parseInt(id), currentUser);
      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const stats = await CourseService.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseController;
