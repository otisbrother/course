const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Course Management System API',
      version: '1.0.0',
      description: `
# Online Course Management System

Hệ thống quản lý khóa học trực tuyến theo kiến trúc Microservices.

## Tech Stack
- NodeJS (Express)
- MySQL
- Redis
- JWT Authentication
- Docker

## Services
- **Auth Service** (Port 3001): Authentication & Authorization
- **User Service** (Port 3002): User Management
- **Course Service** (Port 3003): Course, Section, Lesson, Review Management
- **Enrollment Service** (Port 3004): Enrollment Logic

## Authentication
All protected routes require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

## Roles
- **admin**: Full access to all resources
- **teacher**: Can create and manage own courses
- **student**: Can enroll in courses and track progress
      `,
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'API Gateway'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
            avatar: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            teacher_id: { type: 'integer' },
            thumbnail: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Section: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            course_id: { type: 'integer' },
            title: { type: 'string' },
            position: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Lesson: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            section_id: { type: 'integer' },
            title: { type: 'string' },
            video_url: { type: 'string' },
            duration: { type: 'integer' },
            position: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            course_id: { type: 'integer' },
            progress: { type: 'integer' },
            enrolled_at: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            course_id: { type: 'integer' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Courses', description: 'Course management endpoints' },
      { name: 'Categories', description: 'Category management endpoints' },
      { name: 'Sections', description: 'Section management endpoints' },
      { name: 'Lessons', description: 'Lesson management endpoints' },
      { name: 'Enrollments', description: 'Enrollment management endpoints' },
      { name: 'Reviews', description: 'Review management endpoints' }
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'full_name'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    full_name: { type: 'string' },
                    role: { type: 'string', enum: ['student', 'teacher'] }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Validation error' },
            '409': { description: 'Email already registered' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' }
          }
        }
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Token refreshed' },
            '401': { description: 'Invalid refresh token' }
          }
        }
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Get all users',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'List of users' }
          }
        }
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'User details' },
            '404': { description: 'User not found' }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Update user',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    full_name: { type: 'string' },
                    avatar: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive'] }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'User updated' }
          }
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'User deleted' },
            '403': { description: 'Not authorized' }
          }
        }
      },
      '/courses': {
        get: {
          tags: ['Courses'],
          summary: 'Get all courses',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'published'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category_id', in: 'query', schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'List of courses' }
          }
        },
        post: {
          tags: ['Courses'],
          summary: 'Create a new course (Teacher/Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    thumbnail: { type: 'string' },
                    status: { type: 'string', enum: ['draft', 'published'] },
                    categories: { type: 'array', items: { type: 'integer' } }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Course created' },
            '403': { description: 'Not authorized' }
          }
        }
      },
      '/courses/{id}': {
        get: {
          tags: ['Courses'],
          summary: 'Get course by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Course details' },
            '404': { description: 'Course not found' }
          }
        },
        put: {
          tags: ['Courses'],
          summary: 'Update course (Owner/Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Course updated' }
          }
        },
        delete: {
          tags: ['Courses'],
          summary: 'Delete course (Owner/Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Course deleted' }
          }
        }
      },
      '/enrollments': {
        post: {
          tags: ['Enrollments'],
          summary: 'Enroll in a course',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['course_id'],
                  properties: {
                    course_id: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Enrolled successfully' },
            '400': { description: 'Already enrolled or course not available' }
          }
        }
      },
      '/enrollments/my': {
        get: {
          tags: ['Enrollments'],
          summary: 'Get my enrollments',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'List of enrollments' }
          }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
