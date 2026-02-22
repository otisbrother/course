const CourseModel = require('../models/course.model');
const redis = require('../config/redis');
const slugify = require('slugify');

const CACHE_TTL = 300; // 5 minutes

class CourseService {
  static async getAllCourses(page, limit, filters) {
    // Try cache for published courses without specific filters
    if (!filters.teacher_id && !filters.search && !filters.category_id && filters.status === 'published') {
      const cacheKey = `courses:list:${page}:${limit}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await CourseModel.findAll(page, limit, filters);
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
      return result;
    }

    return await CourseModel.findAll(page, limit, filters);
  }

  static async getCourseById(id) {
    // Try cache first
    const cacheKey = `course:${id}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const course = await CourseModel.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(course));
    
    return course;
  }

  static async createCourse(courseData, currentUser) {
    // Only teacher or admin can create courses
    if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
      throw new Error('Only teachers or admins can create courses');
    }

    // Generate slug
    let slug = slugify(courseData.title, { lower: true, strict: true });
    const existingSlug = await CourseModel.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const course = await CourseModel.create({
      ...courseData,
      slug,
      teacher_id: currentUser.id
    });

    // Invalidate list cache
    await this.invalidateListCache();

    return course;
  }

  static async updateCourse(id, courseData, currentUser) {
    const course = await CourseModel.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }

    // Only owner or admin can update
    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to update this course');
    }

    // Generate new slug if title changed
    if (courseData.title && courseData.title !== course.title) {
      let slug = slugify(courseData.title, { lower: true, strict: true });
      const existingSlug = await CourseModel.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
      courseData.slug = slug;
    }

    const updatedCourse = await CourseModel.update(id, courseData);

    // Invalidate cache
    await redis.del(`course:${id}`);
    await this.invalidateListCache();

    return updatedCourse;
  }

  static async deleteCourse(id, currentUser) {
    const course = await CourseModel.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }

    // Only owner or admin can delete
    if (course.teacher_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to delete this course');
    }

    const deleted = await CourseModel.delete(id);

    // Invalidate cache
    await redis.del(`course:${id}`);
    await this.invalidateListCache();

    return deleted;
  }

  static async getStats() {
    return await CourseModel.getStats();
  }

  static async invalidateListCache() {
    const keys = await redis.keys('courses:list:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

module.exports = CourseService;
