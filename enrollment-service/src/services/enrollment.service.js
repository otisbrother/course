const EnrollmentModel = require('../models/enrollment.model');

class EnrollmentService {
  static async getMyEnrollments(userId, page, limit) {
    return await EnrollmentModel.findByUserId(userId, page, limit);
  }

  static async getEnrollmentsByCourse(courseId, page, limit, currentUser) {
    // Only teacher (course owner) or admin can see enrollments
    const course = await EnrollmentModel.checkCourseExists(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    return await EnrollmentModel.findByCourseId(courseId, page, limit);
  }

  static async enrollInCourse(courseId, currentUser) {
    // Check if course exists
    const course = await EnrollmentModel.checkCourseExists(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if course is published
    if (course.status !== 'published') {
      throw new Error('Course is not available for enrollment');
    }

    // Check if already enrolled
    const existingEnrollment = await EnrollmentModel.findByUserAndCourse(currentUser.id, courseId);
    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    return await EnrollmentModel.create({
      user_id: currentUser.id,
      course_id: courseId
    });
  }

  static async updateProgress(enrollmentId, progress, currentUser) {
    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Only the enrolled user can update progress
    if (enrollment.user_id !== currentUser.id) {
      throw new Error('Not authorized to update this enrollment');
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    return await EnrollmentModel.updateProgress(enrollmentId, progress);
  }

  static async unenroll(enrollmentId, currentUser) {
    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Only the enrolled user or admin can unenroll
    if (enrollment.user_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Not authorized to unenroll');
    }

    return await EnrollmentModel.delete(enrollmentId);
  }

  static async checkEnrollment(userId, courseId) {
    const enrollment = await EnrollmentModel.findByUserAndCourse(userId, courseId);
    return { enrolled: !!enrollment, enrollment };
  }

  static async getMyStats(userId) {
    return await EnrollmentModel.getStats(userId);
  }
}

module.exports = EnrollmentService;
