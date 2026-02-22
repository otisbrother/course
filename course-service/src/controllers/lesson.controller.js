const LessonService = require('../services/lesson.service');

class LessonController {
  static async getLessonsBySection(req, res, next) {
    try {
      const { sectionId } = req.params;
      const lessons = await LessonService.getLessonsBySection(parseInt(sectionId));
      res.json({
        success: true,
        data: lessons
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLessonById(req, res, next) {
    try {
      const { id } = req.params;
      const lesson = await LessonService.getLessonById(parseInt(id));
      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      next(error);
    }
  }

  static async createLesson(req, res, next) {
    try {
      const lessonData = req.body;
      const currentUser = req.user;
      const lesson = await LessonService.createLesson(lessonData, currentUser);
      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        data: lesson
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLesson(req, res, next) {
    try {
      const { id } = req.params;
      const lessonData = req.body;
      const currentUser = req.user;
      const lesson = await LessonService.updateLesson(parseInt(id), lessonData, currentUser);
      res.json({
        success: true,
        message: 'Lesson updated successfully',
        data: lesson
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLesson(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      await LessonService.deleteLesson(parseInt(id), currentUser);
      res.json({
        success: true,
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LessonController;
