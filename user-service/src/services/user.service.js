const UserModel = require('../models/user.model');
const redis = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

class UserService {
  static async getAllUsers(page, limit) {
    return await UserModel.findAll(page, limit);
  }

  static async getUserById(id) {
    // Try cache first
    const cacheKey = `user:${id}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(user));
    
    return user;
  }

  static async updateUser(id, userData, currentUser) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Only admin can change roles
    if (userData.role && currentUser.role !== 'admin') {
      throw new Error('Only admin can change user roles');
    }

    // Users can only update their own profile unless they're admin
    if (currentUser.id !== id && currentUser.role !== 'admin') {
      throw new Error('Unauthorized to update this user');
    }

    const updatedUser = await UserModel.update(id, userData);

    // Invalidate cache
    await redis.del(`user:${id}`);

    return updatedUser;
  }

  static async deleteUser(id, currentUser) {
    // Only admin can delete users
    if (currentUser.role !== 'admin') {
      throw new Error('Only admin can delete users');
    }

    // Cannot delete yourself
    if (currentUser.id === id) {
      throw new Error('Cannot delete your own account');
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const deleted = await UserModel.delete(id);

    // Invalidate cache
    await redis.del(`user:${id}`);

    return deleted;
  }

  static async getUserStats() {
    return await UserModel.getStats();
  }
}

module.exports = UserService;
