const SectionModel = require('../models/section.model');
const CourseModel = require('../models/course.model');
const redis = require('../config/redis');

class SectionService {
  static async getSectionsByCourse(courseId) {
    return await SectionModel.findByCourseId(courseId);
  }

  static async createSection(sectionData, currentUser) {
    // Check course ownership
    const course = await CourseModel.findById(sectionData.course_id);
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to add sections to this course');
    }

    const section = await SectionModel.create(sectionData);

    // Invalidate course cache
    await redis.del(`course:${sectionData.course_id}`);

    return section;
  }

  static async updateSection(id, sectionData, currentUser) {
    const section = await SectionModel.findById(id);
    if (!section) {
      throw new Error('Section not found');
    }

    // Check course ownership
    const course = await CourseModel.findById(section.course_id);
    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to update this section');
    }

    const updatedSection = await SectionModel.update(id, sectionData);

    // Invalidate course cache
    await redis.del(`course:${section.course_id}`);

    return updatedSection;
  }

  static async deleteSection(id, currentUser) {
    const section = await SectionModel.findById(id);
    if (!section) {
      throw new Error('Section not found');
    }

    // Check course ownership
    const course = await CourseModel.findById(section.course_id);
    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to delete this section');
    }

    const deleted = await SectionModel.delete(id);

    // Invalidate course cache
    await redis.del(`course:${section.course_id}`);

    return deleted;
  }
}

module.exports = SectionService;
