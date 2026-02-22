const SectionService = require('../services/section.service');

class SectionController {
  static async getSectionsByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const sections = await SectionService.getSectionsByCourse(parseInt(courseId));
      res.json({
        success: true,
        data: sections
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSection(req, res, next) {
    try {
      const sectionData = req.body;
      const currentUser = req.user;
      const section = await SectionService.createSection(sectionData, currentUser);
      res.status(201).json({
        success: true,
        message: 'Section created successfully',
        data: section
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSection(req, res, next) {
    try {
      const { id } = req.params;
      const sectionData = req.body;
      const currentUser = req.user;
      const section = await SectionService.updateSection(parseInt(id), sectionData, currentUser);
      res.json({
        success: true,
        message: 'Section updated successfully',
        data: section
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSection(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      await SectionService.deleteSection(parseInt(id), currentUser);
      res.json({
        success: true,
        message: 'Section deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SectionController;
