const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const RefreshTokenModel = require('../models/refreshToken.model');
const redis = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class AuthService {
  static async register(userData) {
    const { email, password, full_name, role } = userData;

    // Check if user exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      full_name,
      role
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshTokenModel.create(user.id, tokens.refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      ...tokens
    };
  }

  static async login(email, password) {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check status
    if (user.status !== 'active') {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshTokenModel.create(user.id, tokens.refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      ...tokens
    };
  }

  static async refresh(refreshToken) {
    // Verify refresh token
    const tokenData = await RefreshTokenModel.findByToken(refreshToken);
    if (!tokenData) {
      throw new Error('Invalid or expired refresh token');
    }

    // Verify JWT
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      // Delete old refresh token
      await RefreshTokenModel.deleteByToken(refreshToken);

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Save new refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await RefreshTokenModel.create(user.id, tokens.refreshToken, expiresAt);

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(refreshToken) {
    await RefreshTokenModel.deleteByToken(refreshToken);
    return { message: 'Logged out successfully' };
  }

  static generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    });

    return { accessToken, refreshToken };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;
