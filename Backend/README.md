# Teacher Management System - Backend

A comprehensive backend system for managing teachers, students, classes, attendance, examinations, and fees using Node.js, Express, and MongoDB Atlas.

## 🚀 Features

- **User Management**: Registration, login, authentication with JWT
- **Class Management**: Create and manage classes with teachers and students
- **Attendance Tracking**: Mark and track student attendance
- **Examination Records**: Manage exam scores with automatic grade calculation
- **Fee Management**: Track student fees and payment history
- **Role-Based Access Control**: Different permissions for teachers, admins, and students

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/        # Request handlers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middleware
│   ├── utils/             # Utility functions
│   ├── db/                # Database connection
│   ├── constants.js       # App constants
│   ├── app.js            # Express app setup
│   └── index.js          # Entry point
├── public/               # Static files
├── .env                  # Environment variables
├── .env.example          # Environment template
└── package.json          # Dependencies
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (Free tier is fine)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string

### 3. Configure Environment Variables

1. Rename `.env.example` to `.env` (or create a new `.env` file)
2. Update the following variables:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/teacher_management?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important**: Replace:
- `<username>` with your MongoDB Atlas username
- `<password>` with your MongoDB Atlas password
- `cluster0.xxxxx` with your actual cluster URL
- `JWT_SECRET` with a strong random string

### 4. Run the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user (Protected)
- `GET /api/v1/users/current-user` - Get current user (Protected)

### Classes
- `POST /api/v1/classes` - Create class (Teacher/Admin)
- `GET /api/v1/classes` - Get all classes (Protected)
- `GET /api/v1/classes/:id` - Get class by ID (Protected)
- `PUT /api/v1/classes/:id` - Update class (Teacher/Admin)
- `DELETE /api/v1/classes/:id` - Delete class (Teacher/Admin)
- `POST /api/v1/classes/:id/add-student` - Add student to class (Teacher/Admin)

### Attendance
- `POST /api/v1/attendance` - Mark attendance (Teacher/Admin)
- `GET /api/v1/attendance/class/:classId` - Get class attendance (Protected)
- `GET /api/v1/attendance/student/:studentId` - Get student attendance (Protected)
- `PUT /api/v1/attendance/:id` - Update attendance (Teacher/Admin)

### Examinations
- `POST /api/v1/examinations` - Create exam record (Teacher/Admin)
- `GET /api/v1/examinations/class/:classId` - Get class exams (Protected)
- `GET /api/v1/examinations/student/:studentId` - Get student exams (Protected)
- `PUT /api/v1/examinations/:id` - Update exam record (Teacher/Admin)
- `DELETE /api/v1/examinations/:id` - Delete exam record (Teacher/Admin)

### Fees
- `POST /api/v1/fees` - Create fee record (Admin)
- `GET /api/v1/fees` - Get all fees (Admin/Teacher)
- `GET /api/v1/fees/student/:studentId` - Get student fees (Protected)
- `PUT /api/v1/fees/:id` - Update fee record (Admin)
- `DELETE /api/v1/fees/:id` - Delete fee record (Admin)
- `POST /api/v1/fees/:id/payment` - Record payment (Admin)

### Health Check
- `GET /health` - Check server status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```
Authorization: Bearer <your_token>
```

Or use cookies (automatically set on login).

## 👥 User Roles

- **Admin**: Full access to all features
- **Teacher**: Can manage classes, attendance, and exams
- **Student**: Can view their own data

## 📝 Example Requests

### Register User
```json
POST /api/v1/users/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "password": "securePassword123",
  "role": "teacher"
}
```

### Login
```json
POST /api/v1/users/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Create Class
```json
POST /api/v1/classes
{
  "className": "Mathematics",
  "section": "A",
  "subject": "Advanced Algebra",
  "schedule": {
    "day": "Monday",
    "startTime": "09:00",
    "endTime": "10:00"
  }
}
```

### Mark Attendance
```json
POST /api/v1/attendance
{
  "student": "student_id_here",
  "classId": "class_id_here",
  "date": "2025-11-04",
  "status": "present",
  "remarks": "On time"
}
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies
- CORS protection
- Role-based access control
- Input validation

## 📚 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing

## 🐛 Troubleshooting

### Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas
- Check your MongoDB URI format
- Verify network connectivity

### Authentication Errors
- Check JWT_SECRET is set correctly
- Verify token is being sent in requests
- Check token expiration

## 📄 License

This project is for educational purposes.

## 👨‍💻 Support

For issues or questions, please create an issue in the repository.
