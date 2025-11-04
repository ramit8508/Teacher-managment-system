# 🚀 Quick Start Guide

## ✅ System Status

Both your Backend and Frontend servers are now running!

### Backend Server
- **Status**: ✅ Running
- **URL**: http://localhost:5000
- **Database**: ✅ Connected to MongoDB Atlas
- **Health Check**: http://localhost:5000/health

### Frontend Server
- **Status**: ✅ Running
- **URL**: http://localhost:5173
- **Proxy**: Configured to connect to backend

## 🎯 Next Steps

### 1. Open the Application
Open your browser and navigate to:
```
http://localhost:5173
```

### 2. Register Your First Account

1. Click on the **"Signup"** tab
2. Fill in the registration form:
   - **Full Name**: Your full name
   - **Email**: Your email address
   - **Username**: Choose a unique username
   - **Password**: At least 6 characters
   - **Role**: Choose one:
     - `Teacher` - Can manage classes, attendance, and exams
     - `Admin` - Full access to all features
     - `Student` - Can view their own data
3. Click **"Register"**

### 3. Login

1. Switch to the **"Login"** tab
2. Enter your email/username and password
3. Click **"Sign In"**

### 4. Start Using the System

Once logged in, you'll see the Dashboard with:

#### 📊 Dashboard
- View statistics and quick actions
- Access recent activities

#### 👥 Students & Classes
- Add new students
- Create and manage classes
- View class rosters

#### 📋 Attendance
- Mark daily attendance
- View attendance history
- Generate attendance reports

#### 📝 Examination Scores
- Record exam marks
- Track student performance
- View subject-wise scores

#### 💰 Fee Management
- Create fee records
- Record payments
- Track pending fees

## 🔥 Quick Test Workflow

### Create a Complete Test Scenario:

1. **Register 3 users:**
   - 1 Admin (role: admin)
   - 1 Teacher (role: teacher)
   - 1 Student (role: student)

2. **Login as Teacher/Admin:**
   - Create a class (e.g., "Mathematics - Grade 10-A")
   - Add the student to the class

3. **Mark Attendance:**
   - Go to Attendance section
   - Select the class
   - Load students
   - Mark attendance (Present/Absent)
   - Save

4. **Record Exam Scores:**
   - Go to Examination Scores
   - Add exam scores for the student
   - View performance reports

5. **Manage Fees (as Admin):**
   - Create a fee record for the student
   - Record a payment
   - View fee status

## 📡 API Testing

You can also test the API directly:

### Using Browser
Visit: http://localhost:5000/health

### Using curl
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "password": "password123",
    "role": "teacher"
  }'
```

### Using Postman
Import the collection from: `Backend/postman_collection.json`

## 🛑 Stopping the Servers

### Stop Backend
In the terminal running the backend, press `Ctrl + C`

### Stop Frontend
In the terminal running the frontend, press `Ctrl + C`

## 🔄 Restarting the Servers

### Backend
```bash
cd "d:\Teacher managment system\Backend"
npm run dev
```

### Frontend
```bash
cd "d:\Teacher managment system\frontend"
npm run dev
```

## 🐛 Common Issues

### Port Already in Use
If port 5000 or 5173 is already in use:

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

### MongoDB Connection Issues
- Check your internet connection
- Verify MongoDB Atlas cluster is active
- Ensure IP whitelist includes your current IP

### Frontend Not Connecting to Backend
- Ensure backend is running on port 5000
- Check `vite.config.js` proxy settings
- Clear browser cache and reload

## 📚 Documentation

- **Full Documentation**: See `README.md` in the root folder
- **API Documentation**: See `Backend/API_TESTING.md`
- **MongoDB Setup**: See `Backend/MONGODB_SETUP.md`

## 🎉 You're All Set!

Your full-stack Teacher Management System is now running with:
- ✅ Backend API connected to MongoDB Atlas
- ✅ Frontend with modern React UI
- ✅ Proxy configured for seamless API communication
- ✅ JWT authentication
- ✅ Role-based access control

**Enjoy managing your school data! 🎓**

---

Need help? Check the troubleshooting section in the main README.md
