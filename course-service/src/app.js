const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const courseRoutes = require('./routes/course.routes');
const categoryRoutes = require('./routes/category.routes');
const sectionRoutes = require('./routes/section.routes');
const lessonRoutes = require('./routes/lesson.routes');
const reviewRoutes = require('./routes/review.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'course-service' });
});

// Routes
app.use('/courses', courseRoutes);
app.use('/categories', categoryRoutes);
app.use('/sections', sectionRoutes);
app.use('/lessons', lessonRoutes);
app.use('/reviews', reviewRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Course Service running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
