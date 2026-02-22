const express = require('express');
const { body, param } = require('express-validator');
const CategoryController = require('../controllers/category.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', CategoryController.getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category details
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid category ID')],
  validateRequest,
  CategoryController.getCategoryById
);

/**
 * @swagger
 * /categories/{id}/courses:
 *   get:
 *     summary: Get courses by category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: List of courses in category
 */
router.get(
  '/:id/courses',
  [param('id').isInt().withMessage('Invalid category ID')],
  validateRequest,
  CategoryController.getCoursesByCategory
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  [body('name').notEmpty().withMessage('Name is required')],
  validateRequest,
  CategoryController.createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category (Admin only)
 *     tags: [Categories]
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  [param('id').isInt().withMessage('Invalid category ID')],
  validateRequest,
  CategoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category (Admin only)
 *     tags: [Categories]
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
 *         description: Category deleted
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  [param('id').isInt().withMessage('Invalid category ID')],
  validateRequest,
  CategoryController.deleteCategory
);

module.exports = router;
