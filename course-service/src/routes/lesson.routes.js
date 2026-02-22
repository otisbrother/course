const express = require('express');
const { body, param } = require('express-validator');
const LessonController = require('../controllers/lesson.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /lessons/section/{sectionId}:
 *   get:
 *     summary: Get lessons by section
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of lessons
 */
router.get(
  '/section/:sectionId',
  [param('sectionId').isInt().withMessage('Invalid section ID')],
  validateRequest,
  LessonController.getLessonsBySection
);

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson details
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid lesson ID')],
  validateRequest,
  LessonController.getLessonById
);

/**
 * @swagger
 * /lessons:
 *   post:
 *     summary: Create lesson (Course owner only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - section_id
 *               - title
 *             properties:
 *               section_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               position:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Lesson created
 */
router.post(
  '/',
  authMiddleware,
  [
    body('section_id').isInt().withMessage('Section ID is required'),
    body('title').notEmpty().withMessage('Title is required')
  ],
  validateRequest,
  LessonController.createLesson
);

/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     summary: Update lesson (Course owner only)
 *     tags: [Lessons]
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
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lesson updated
 */
router.put(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid lesson ID')],
  validateRequest,
  LessonController.updateLesson
);

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete lesson (Course owner only)
 *     tags: [Lessons]
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
 *         description: Lesson deleted
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid lesson ID')],
  validateRequest,
  LessonController.deleteLesson
);

module.exports = router;
