const CategoryModel = require('../models/category.model');
const slugify = require('slugify');

class CategoryService {
  static async getAllCategories() {
    return await CategoryModel.findAll();
  }

  static async getCategoryById(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  static async createCategory(categoryData, currentUser) {
    // Only admin can create categories
    if (currentUser.role !== 'admin') {
      throw new Error('Only admins can create categories');
    }

    // Generate slug
    let slug = slugify(categoryData.name, { lower: true, strict: true });
    const existingSlug = await CategoryModel.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    return await CategoryModel.create({
      ...categoryData,
      slug
    });
  }

  static async updateCategory(id, categoryData, currentUser) {
    // Only admin can update categories
    if (currentUser.role !== 'admin') {
      throw new Error('Only admins can update categories');
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Generate new slug if name changed
    if (categoryData.name && categoryData.name !== category.name) {
      let slug = slugify(categoryData.name, { lower: true, strict: true });
      const existingSlug = await CategoryModel.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
      categoryData.slug = slug;
    }

    return await CategoryModel.update(id, categoryData);
  }

  static async deleteCategory(id, currentUser) {
    // Only admin can delete categories
    if (currentUser.role !== 'admin') {
      throw new Error('Only admins can delete categories');
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    return await CategoryModel.delete(id);
  }

  static async getCoursesByCategory(id, page, limit) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    const courses = await CategoryModel.getCoursesByCategory(id, page, limit);
    return { category, courses };
  }
}

module.exports = CategoryService;
