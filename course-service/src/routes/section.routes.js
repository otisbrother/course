const express = require('express');
const { body, param } = require('express-validator');
const SectionController = require('../controllers/section.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /sections/course/{courseId}:
 *   get:
 *     summary: Get sections by course
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of sections
 */
router.get(
  '/course/:courseId',
  [param('courseId').isInt().withMessage('Invalid course ID')],
  validateRequest,
  SectionController.getSectionsByCourse
);

/**
 * @swagger
 * /sections:
 *   post:
 *     summary: Create section (Course owner only)
 *     tags: [Sections]
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
 *               - title
 *             properties:
 *               course_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Section created
 */
router.post(
  '/',
  authMiddleware,
  [
    body('course_id').isInt().withMessage('Course ID is required'),
    body('title').notEmpty().withMessage('Title is required')
  ],
  validateRequest,
  SectionController.createSection
);

/**
 * @swagger
 * /sections/{id}:
 *   put:
 *     summary: Update section (Course owner only)
 *     tags: [Sections]
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
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Section updated
 */
router.put(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid section ID')],
  validateRequest,
  SectionController.updateSection
);

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     summary: Delete section (Course owner only)
 *     tags: [Sections]
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
 *         description: Section deleted
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid section ID')],
  validateRequest,
  SectionController.deleteSection
);

module.exports = router;
