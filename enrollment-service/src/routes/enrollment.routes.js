const express = require('express');
const { body, param } = require('express-validator');
const EnrollmentController = require('../controllers/enrollment.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /enrollments/my:
 *   get:
 *     summary: Get my enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of my enrollments
 */
router.get('/my', authMiddleware, EnrollmentController.getMyEnrollments);

/**
 * @swagger
 * /enrollments/stats:
 *   get:
 *     summary: Get my enrollment statistics
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollment statistics
 */
router.get('/stats', authMiddleware, EnrollmentController.getMyStats);

/**
 * @swagger
 * /enrollments/check/{courseId}:
 *   get:
 *     summary: Check if enrolled in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Enrollment status
 */
router.get(
  '/check/:courseId',
  authMiddleware,
  [param('courseId').isInt().withMessage('Invalid course ID')],
  validateRequest,
  EnrollmentController.checkEnrollment
);

/**
 * @swagger
 * /enrollments/course/{courseId}:
 *   get:
 *     summary: Get enrollments by course (Teacher/Admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of enrollments
 */
router.get(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware(['teacher', 'admin']),
  [param('courseId').isInt().withMessage('Invalid course ID')],
  validateRequest,
  EnrollmentController.getEnrollmentsByCourse
);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *             properties:
 *               course_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Enrolled successfully
 */
router.post(
  '/',
  authMiddleware,
  [body('course_id').isInt().withMessage('Course ID is required')],
  validateRequest,
  EnrollmentController.enroll
);

/**
 * @swagger
 * /enrollments/{id}/progress:
 *   put:
 *     summary: Update enrollment progress
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put(
  '/:id/progress',
  authMiddleware,
  [
    param('id').isInt().withMessage('Invalid enrollment ID'),
    body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
  ],
  validateRequest,
  EnrollmentController.updateProgress
);

/**
 * @swagger
 * /enrollments/{id}:
 *   delete:
 *     summary: Unenroll from a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unenrolled successfully
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid enrollment ID')],
  validateRequest,
  EnrollmentController.unenroll
);

module.exports = router;
