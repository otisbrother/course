# 🎓 Online Course Management System

> Xây dựng hệ thống quản lý khóa học trực tuyến theo kiến trúc Microservices

## 📋 Tech Stack

- **NodeJS** (Express)
- **MySQL** 8
- **Redis** (Cache)
- **JWT** Authentication
- **Docker** & Docker Compose
- **Swagger** API Documentation

## 🏗 Kiến trúc Microservices

```
online-course-system/
│
├── gateway/              # API Gateway (Port 3000)
├── auth-service/         # Authentication Service (Port 3001)
├── user-service/         # User Management Service (Port 3002)
├── course-service/       # Course Management Service (Port 3003)
├── enrollment-service/   # Enrollment Service (Port 3004)
│
├── mysql-init/           # Database initialization scripts
├── docker-compose.yml
└── README.md
```

## 📊 Services Overview

| Service    | Port | Vai trò                          |
| ---------- | ---- | -------------------------------- |
| Gateway    | 3000 | API Gateway, Routing, Auth Check |
| Auth       | 3001 | Register, Login, JWT Token       |
| User       | 3002 | User CRUD, Profile               |
| Course     | 3003 | Course, Section, Lesson, Review  |
| Enrollment | 3004 | Enrollment, Progress Tracking    |
| MySQL      | 3306 | Database                         |
| Redis      | 6379 | Cache                            |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development)

### Run with Docker (Recommended)

```bash
# Clone the project
cd online-course-system

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Run Locally (Development)

```bash
# Start MySQL and Redis first
docker-compose up -d mysql redis

# Install dependencies for each service
cd auth-service && npm install && cd ..
cd user-service && npm install && cd ..
cd course-service && npm install && cd ..
cd enrollment-service && npm install && cd ..
cd gateway && npm install && cd ..

# Start services (in separate terminals)
cd auth-service && npm run dev
cd user-service && npm run dev
cd course-service && npm run dev
cd enrollment-service && npm run dev
cd gateway && npm run dev
```

## 📖 API Documentation

After starting the services, access Swagger UI at:

- **Gateway API Docs**: http://localhost:3000/api-docs
- **Auth Service Docs**: http://localhost:3001/api-docs
- **User Service Docs**: http://localhost:3002/api-docs
- **Course Service Docs**: http://localhost:3003/api-docs
- **Enrollment Service Docs**: http://localhost:3004/api-docs

## 🔐 API Endpoints

### Auth Service (`/api/auth`)

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login
POST /api/auth/refresh      - Refresh token
POST /api/auth/logout       - Logout
GET  /api/auth/verify       - Verify token
```

### User Service (`/api/users`)

```
GET    /api/users           - Get all users
GET    /api/users/:id       - Get user by ID
GET    /api/users/profile   - Get current user profile
PUT    /api/users/:id       - Update user
DELETE /api/users/:id       - Delete user (Admin only)
```

### Course Service (`/api/courses`)

```
GET    /api/courses              - Get all courses
GET    /api/courses/:id          - Get course by ID
POST   /api/courses              - Create course (Teacher/Admin)
PUT    /api/courses/:id          - Update course (Owner/Admin)
DELETE /api/courses/:id          - Delete course (Owner/Admin)

GET    /api/categories           - Get all categories
GET    /api/categories/:id       - Get category by ID
POST   /api/categories           - Create category (Admin)

POST   /api/sections             - Create section
PUT    /api/sections/:id         - Update section
DELETE /api/sections/:id         - Delete section

POST   /api/lessons              - Create lesson
PUT    /api/lessons/:id          - Update lesson
DELETE /api/lessons/:id          - Delete lesson

GET    /api/reviews/course/:id   - Get course reviews
POST   /api/reviews              - Create review
PUT    /api/reviews/:id          - Update review
DELETE /api/reviews/:id          - Delete review
```

### Enrollment Service (`/api/enrollments`)

```
GET    /api/enrollments/my           - Get my enrollments
GET    /api/enrollments/stats        - Get my enrollment stats
POST   /api/enrollments              - Enroll in course
PUT    /api/enrollments/:id/progress - Update progress
DELETE /api/enrollments/:id          - Unenroll
```

## 🧪 Testing with Postman

### 1. Register User

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123",
  "full_name": "John Teacher",
  "role": "teacher"
}
```

### 2. Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123"
}
```

### 3. Create Course (with token)

```http
POST http://localhost:3000/api/courses
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "title": "NodeJS Masterclass",
  "description": "Learn NodeJS from scratch",
  "price": 99.99,
  "categories": [1, 2]
}
```

### 4. Enroll in Course

```http
POST http://localhost:3000/api/enrollments
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "course_id": 1
}
```

## 🗄 Database Schema

### Users
```sql
id, email, password, full_name, role, avatar, status, created_at, updated_at
```

### Courses
```sql
id, title, slug, description, price, teacher_id, thumbnail, status, created_at, updated_at
```

### Sections
```sql
id, course_id, title, position, created_at
```

### Lessons
```sql
id, section_id, title, video_url, duration, position, created_at
```

### Enrollments
```sql
id, user_id, course_id, progress, enrolled_at
```

### Reviews
```sql
id, user_id, course_id, rating, comment, created_at
```

### Categories
```sql
id, name, slug
```

## 🔒 Roles & Permissions

| Action               | Admin | Teacher | Student |
| -------------------- | ----- | ------- | ------- |
| Manage Users         | ✅     | ❌       | ❌       |
| Create Course        | ✅     | ✅       | ❌       |
| Update Own Course    | ✅     | ✅       | ❌       |
| Delete Any Course    | ✅     | ❌       | ❌       |
| Manage Categories    | ✅     | ❌       | ❌       |
| Enroll in Course     | ✅     | ✅       | ✅       |
| Write Review         | ✅     | ✅       | ✅       |

## 🧊 Redis Cache Strategy

Cached endpoints:
- `GET /courses` - Course list (TTL: 5 minutes)
- `GET /courses/:id` - Course detail (TTL: 5 minutes)

Cache invalidation occurs on:
- Course create/update/delete
- Section/Lesson create/update/delete

## 📁 Service Structure

Each service follows this structure:

```
service/
├── src/
│   ├── app.js              # Entry point
│   ├── config/
│   │   ├── database.js     # MySQL connection
│   │   ├── redis.js        # Redis connection
│   │   └── swagger.js      # Swagger config
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middlewares/        # Auth, validation, error handling
│   └── utils/              # Helper functions
├── Dockerfile
└── package.json
```

## 🔥Highlights

1. **Microservices Architecture**: Hệ thống được thiết kế theo kiến trúc microservices với các service độc lập
2. **Redis Cache**: Sử dụng Redis để cache data, tối ưu performance
3. **JWT Auth + RBAC**: Implement JWT authentication với Role-Based Access Control
4. **Docker**: Container hóa toàn bộ hệ thống
5. **API Gateway**: Centralized routing và authentication
6. **Database Design**: Thiết kế database chuẩn với các mối quan hệ 1-N, N-N
7. **Input Validation**: Validate tất cả input với express-validator
8. **Error Handling**: Centralized error handling middleware
9. **API Documentation**: Auto-generated Swagger docs

## 🚀 Future Improvements

- [ ] Payment integration
- [ ] Notification service
- [ ] File upload (S3)
- [ ] Rate limiting per user
- [ ] API versioning
- [ ] Audit logging
- [ ] Unit & Integration tests
- [ ] CI/CD pipeline

