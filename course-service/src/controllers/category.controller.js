const CategoryService = require('../services/category.service');

class CategoryController {
  static async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(parseInt(id));
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const categoryData = req.body;
      const currentUser = req.user;
      const category = await CategoryService.createCategory(categoryData, currentUser);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const currentUser = req.user;
      const category = await CategoryService.updateCategory(parseInt(id), categoryData, currentUser);
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      await CategoryService.deleteCategory(parseInt(id), currentUser);
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCoursesByCategory(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await CategoryService.getCoursesByCategory(parseInt(id), page, limit);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
