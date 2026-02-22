const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { authMiddleware, optionalAuthMiddleware } = require('./middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use(limiter);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3003';
const ENROLLMENT_SERVICE_URL = process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:3004';

// Proxy options factory
const createProxyOptions = (target, pathRewriteRules) => ({
  target,
  changeOrigin: true,
  pathRewrite: pathRewriteRules,
  onProxyReq: (proxyReq, req) => {
    // Forward user info from JWT if available
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Email', req.user.email);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable'
    });
  }
});

// Auth Service Routes (no auth required for register/login)
app.use('/api/auth', createProxyMiddleware(createProxyOptions(AUTH_SERVICE_URL, { '^/api/auth': '/auth' })));

// User Service Routes (auth required)
app.use('/api/users', authMiddleware, createProxyMiddleware(createProxyOptions(USER_SERVICE_URL, { '^/api/users': '/users' })));

// Course Service Routes
// Public routes (no auth required for viewing courses)
app.use('/api/courses', optionalAuthMiddleware, createProxyMiddleware(createProxyOptions(COURSE_SERVICE_URL, { '^/api/courses': '/courses' })));
app.use('/api/categories', createProxyMiddleware(createProxyOptions(COURSE_SERVICE_URL, { '^/api/categories': '/categories' })));
app.use('/api/sections', optionalAuthMiddleware, createProxyMiddleware(createProxyOptions(COURSE_SERVICE_URL, { '^/api/sections': '/sections' })));
app.use('/api/lessons', optionalAuthMiddleware, createProxyMiddleware(createProxyOptions(COURSE_SERVICE_URL, { '^/api/lessons': '/lessons' })));
app.use('/api/reviews', optionalAuthMiddleware, createProxyMiddleware(createProxyOptions(COURSE_SERVICE_URL, { '^/api/reviews': '/reviews' })));

// Enrollment Service Routes (auth required)
app.use('/api/enrollments', authMiddleware, createProxyMiddleware(createProxyOptions(ENROLLMENT_SERVICE_URL, { '^/api/enrollments': '/enrollments' })));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal gateway error'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  console.log('\nService URLs:');
  console.log(`  Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`  User Service: ${USER_SERVICE_URL}`);
  console.log(`  Course Service: ${COURSE_SERVICE_URL}`);
  console.log(`  Enrollment Service: ${ENROLLMENT_SERVICE_URL}`);
});

module.exports = app;
