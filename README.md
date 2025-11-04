# Teacher Management System - Full Stack Application

A complete full-stack application for managing teachers, students, classes, attendance, examinations, and fees using React, Node.js, Express, and MongoDB Atlas.

## 🚀 Features

### Backend
- **User Authentication**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, logout functionality
- **Class Management**: Create and manage classes with teachers and students
- **Attendance Tracking**: Mark and track student attendance
- **Examination Records**: Manage exam scores with automatic grade calculation
- **Fee Management**: Track student fees and payment history
- **RESTful API**: Well-structured API endpoints
- **MongoDB Atlas**: Cloud database integration

### Frontend
- **Modern UI**: Clean and intuitive interface built with React and Tailwind CSS
- **Authentication**: Login and signup with form validation
- **Dashboard**: Comprehensive overview with statistics
- **Attendance Management**: Easy-to-use attendance marking system
- **Examination Scores**: Subject-wise performance tracking
- **Fee Management**: Fee tracking and payment recording
- **Responsive Design**: Works on all screen sizes

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier works)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Teacher managment system"
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

#### Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

#### Setup Environment Variables

Create a `.env` file in the Backend folder:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/teacher_management?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

Replace `<username>`, `<password>`, and the cluster URL with your actual MongoDB Atlas credentials.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

The frontend is already configured to use proxy to connect to the backend at `http://localhost:5000`.

## 🚀 Running the Application

### Start Backend Server

```bash
cd Backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📝 Usage

### First Time Setup

1. **Start both backend and frontend servers**
2. **Open browser** to `http://localhost:5173`
3. **Register a new account**:
   - Click "Signup" tab
   - Fill in your details
   - Choose role (teacher/admin/student)
   - Click "Register"
4. **Login** with your credentials
5. **Start managing** your school data!

### Creating Test Data

1. Register multiple users with different roles
2. Login as a teacher or admin
3. Create classes
4. Add students to classes
5. Mark attendance
6. Record examination scores
7. Manage fee payments

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `GET /api/v1/users/current-user` - Get current user

### Classes
- `POST /api/v1/classes` - Create class
- `GET /api/v1/classes` - Get all classes
- `GET /api/v1/classes/:id` - Get class by ID
- `PUT /api/v1/classes/:id` - Update class
- `DELETE /api/v1/classes/:id` - Delete class
- `POST /api/v1/classes/:id/add-student` - Add student to class

### Attendance
- `POST /api/v1/attendance` - Mark attendance
- `GET /api/v1/attendance/class/:classId` - Get class attendance
- `GET /api/v1/attendance/student/:studentId` - Get student attendance
- `PUT /api/v1/attendance/:id` - Update attendance

### Examinations
- `POST /api/v1/examinations` - Create exam record
- `GET /api/v1/examinations/class/:classId` - Get class exams
- `GET /api/v1/examinations/student/:studentId` - Get student exams
- `PUT /api/v1/examinations/:id` - Update exam
- `DELETE /api/v1/examinations/:id` - Delete exam

### Fees
- `POST /api/v1/fees` - Create fee record
- `GET /api/v1/fees` - Get all fees
- `GET /api/v1/fees/student/:studentId` - Get student fees
- `PUT /api/v1/fees/:id` - Update fee record
- `DELETE /api/v1/fees/:id` - Delete fee record
- `POST /api/v1/fees/:id/payment` - Record payment

## 📁 Project Structure

```
Teacher managment system/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Custom middleware
│   │   ├── utils/            # Utility functions
│   │   ├── db/               # Database connection
│   │   ├── constants.js      # App constants
│   │   ├── app.js           # Express app
│   │   └── index.js         # Entry point
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── api/             # API services
│   │   ├── components/       # React components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── vite.config.js       # Vite config with proxy
│   ├── package.json
│   └── tailwind.config.js
└── README.md                # This file
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies
- CORS protection
- Role-based access control
- Input validation

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Context API** - State management

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check your MongoDB URI format
- Ensure IP address is whitelisted
- Verify username and password
- Check network connectivity

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

### Frontend Issues

**Proxy Not Working:**
- Ensure backend is running on port 5000
- Check vite.config.js proxy settings
- Restart frontend dev server

**API Request Fails:**
- Check browser console for errors
- Verify backend is running
- Check network tab in browser dev tools

## 📚 Additional Documentation

- [Backend API Documentation](./Backend/API_TESTING.md)
- [MongoDB Setup Guide](./Backend/MONGODB_SETUP.md)
- [Postman Collection](./Backend/postman_collection.json)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes.

## 👨‍💻 Support

For issues or questions:
1. Check existing documentation
2. Search for similar issues
3. Create a new issue with detailed information

## 🎉 Acknowledgments

- MongoDB Atlas for cloud database
- React team for the amazing library
- Tailwind CSS for the utility-first framework
- Express.js community

---

**Happy Coding! 🚀**
