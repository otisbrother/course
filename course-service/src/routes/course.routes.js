const express = require('express');
const { body, param, query } = require('express-validator');
const CourseController = require('../controllers/course.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', CourseController.getAllCourses);

/**
 * @swagger
 * /courses/stats:
 *   get:
 *     summary: Get course statistics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course statistics
 */
router.get('/stats', authMiddleware, roleMiddleware(['admin']), CourseController.getStats);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course details
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid course ID')],
  validateRequest,
  CourseController.getCourseById
);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course (Teacher/Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Course created
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['teacher', 'admin']),
  [body('title').notEmpty().withMessage('Title is required')],
  validateRequest,
  CourseController.createCourse
);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update course (Owner/Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Course updated
 */
router.put(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid course ID')],
  validateRequest,
  CourseController.updateCourse
);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete course (Owner/Admin only)
 *     tags: [Courses]
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
 *         description: Course deleted
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid course ID')],
  validateRequest,
  CourseController.deleteCourse
);

module.exports = router;
