# API Testing Guide

Use these examples to test your API with tools like Postman, Thunder Client, or curl.

## Base URL
```
http://localhost:5000/api/v1
```

## 1. Health Check

```bash
GET http://localhost:5000/health
```

## 2. Register a Teacher

```bash
POST http://localhost:5000/api/v1/users/register
Content-Type: application/json

{
  "username": "teacher_john",
  "email": "john.teacher@school.com",
  "fullName": "John Smith",
  "password": "Teacher@123",
  "role": "teacher"
}
```

## 3. Register an Admin

```bash
POST http://localhost:5000/api/v1/users/register
Content-Type: application/json

{
  "username": "admin_user",
  "email": "admin@school.com",
  "fullName": "Admin User",
  "password": "Admin@123",
  "role": "admin"
}
```

## 4. Register a Student

```bash
POST http://localhost:5000/api/v1/users/register
Content-Type: application/json

{
  "username": "student_alice",
  "email": "alice.student@school.com",
  "fullName": "Alice Johnson",
  "password": "Student@123",
  "role": "student"
}
```

## 5. Login

```bash
POST http://localhost:5000/api/v1/users/login
Content-Type: application/json

{
  "email": "john.teacher@school.com",
  "password": "Teacher@123"
}
```

**Response includes:**
- accessToken
- refreshToken
- user data

**Copy the accessToken for authenticated requests!**

## 6. Get Current User (Protected)

```bash
GET http://localhost:5000/api/v1/users/current-user
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## 7. Create a Class (Teacher/Admin only)

```bash
POST http://localhost:5000/api/v1/classes
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "className": "Mathematics",
  "section": "Grade 10-A",
  "subject": "Advanced Algebra",
  "schedule": {
    "day": "Monday",
    "startTime": "09:00 AM",
    "endTime": "10:00 AM"
  }
}
```

## 8. Get All Classes

```bash
GET http://localhost:5000/api/v1/classes
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## 9. Add Student to Class

```bash
POST http://localhost:5000/api/v1/classes/{CLASS_ID}/add-student
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "studentId": "STUDENT_USER_ID_HERE"
}
```

## 10. Mark Attendance

```bash
POST http://localhost:5000/api/v1/attendance
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "student": "STUDENT_ID_HERE",
  "classId": "CLASS_ID_HERE",
  "date": "2025-11-04",
  "status": "present",
  "remarks": "On time and attentive"
}
```

**Status options:** present, absent, late, excused

## 11. Create Examination Record

```bash
POST http://localhost:5000/api/v1/examinations
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "student": "STUDENT_ID_HERE",
  "classId": "CLASS_ID_HERE",
  "examName": "Mid-Term Exam",
  "subject": "Mathematics",
  "totalMarks": 100,
  "obtainedMarks": 85,
  "examDate": "2025-11-01",
  "remarks": "Good performance"
}
```

**Note:** Grade and percentage are calculated automatically!

## 12. Create Fee Record (Admin only)

```bash
POST http://localhost:5000/api/v1/fees
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "student": "STUDENT_ID_HERE",
  "academicYear": "2025-2026",
  "totalFee": 50000,
  "dueDate": "2025-12-31"
}
```

## 13. Record Payment (Admin only)

```bash
POST http://localhost:5000/api/v1/fees/{FEE_ID}/payment
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "amount": 25000,
  "paymentMethod": "Bank Transfer",
  "transactionId": "TXN123456789"
}
```

## 14. Get Student Attendance

```bash
GET http://localhost:5000/api/v1/attendance/student/{STUDENT_ID}
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## 15. Get Student Examinations

```bash
GET http://localhost:5000/api/v1/examinations/student/{STUDENT_ID}
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## 16. Get Student Fees

```bash
GET http://localhost:5000/api/v1/fees/student/{STUDENT_ID}
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## 17. Logout

```bash
POST http://localhost:5000/api/v1/users/logout
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## Tips for Testing

1. **Save User IDs**: After creating users, save their `_id` values
2. **Save Class IDs**: After creating classes, save their `_id` values
3. **Keep Token Handy**: Copy the accessToken from login response
4. **Use Postman Collections**: Import these as a collection for easier testing
5. **Check Console Logs**: The server logs helpful debugging information

## Testing Workflow

1. Register users (teacher, admin, student)
2. Login as teacher or admin
3. Create classes
4. Add students to classes
5. Mark attendance
6. Create examination records
7. Create fee records (as admin)
8. Query data using GET endpoints

## Error Responses

The API returns consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "success": false,
  "errors": []
}
```

## Success Responses

The API returns consistent success responses:

```json
{
  "statusCode": 200,
  "data": { /* your data */ },
  "message": "Success message",
  "success": true
}
```

Happy Testing! 🎉
