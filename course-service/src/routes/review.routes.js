const express = require('express');
const { body, param } = require('express-validator');
const ReviewController = require('../controllers/review.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /reviews/course/{courseId}:
 *   get:
 *     summary: Get reviews by course
 *     tags: [Reviews]
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
 *         description: List of reviews
 */
router.get(
  '/course/:courseId',
  [param('courseId').isInt().withMessage('Invalid course ID')],
  validateRequest,
  ReviewController.getReviewsByCourse
);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create review
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               course_id:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post(
  '/',
  authMiddleware,
  [
    body('course_id').isInt().withMessage('Course ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  validateRequest,
  ReviewController.createReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update review (Author only)
 *     tags: [Reviews]
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 */
router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isInt().withMessage('Invalid review ID'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  validateRequest,
  ReviewController.updateReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete review (Author/Admin only)
 *     tags: [Reviews]
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
 *         description: Review deleted
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Invalid review ID')],
  validateRequest,
  ReviewController.deleteReview
);

module.exports = router;
