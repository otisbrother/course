const LessonModel = require('../models/lesson.model');
const SectionModel = require('../models/section.model');
const CourseModel = require('../models/course.model');
const redis = require('../config/redis');

class LessonService {
  static async getLessonsBySection(sectionId) {
    return await LessonModel.findBySectionId(sectionId);
  }

  static async getLessonById(id) {
    const lesson = await LessonModel.findById(id);
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    return lesson;
  }

  static async createLesson(lessonData, currentUser) {
    // Check section exists
    const section = await SectionModel.findById(lessonData.section_id);
    if (!section) {
      throw new Error('Section not found');
    }

    // Check course ownership
    const course = await CourseModel.findById(section.course_id);
    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to add lessons to this course');
    }

    const lesson = await LessonModel.create(lessonData);

    // Invalidate course cache
    await redis.del(`course:${course.id}`);

    return lesson;
  }

  static async updateLesson(id, lessonData, currentUser) {
    const lesson = await LessonModel.findById(id);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check section and course ownership
    const section = await SectionModel.findById(lesson.section_id);
    const course = await CourseModel.findById(section.course_id);
    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to update this lesson');
    }

    const updatedLesson = await LessonModel.update(id, lessonData);

    // Invalidate course cache
    await redis.del(`course:${course.id}`);

    return updatedLesson;
  }

  static async deleteLesson(id, currentUser) {
    const lesson = await LessonModel.findById(id);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check section and course ownership
    const section = await SectionModel.findById(lesson.section_id);
    const course = await CourseModel.findById(section.course_id);
    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to delete this lesson');
    }

    const deleted = await LessonModel.delete(id);

    // Invalidate course cache
    await redis.del(`course:${course.id}`);

    return deleted;
  }
}

module.exports = LessonService;
