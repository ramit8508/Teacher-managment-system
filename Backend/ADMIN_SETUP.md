# Admin User Setup

## Quick Admin Login

The system includes a quick admin login button on the login page for easy administrator access.

## Admin Credentials

```
Email: admin@school.com
Username: admin
Password: admin123
Role: Administrator
```

## Create Admin User

If the admin user doesn't exist, run this command from the Backend directory:

```bash
npm run create-admin
```

This will:
- ✅ Check if admin user already exists
- ✅ Create new admin user with default credentials
- ✅ Display the admin credentials
- ⚠️ Remind you to change the password after first login

## Admin Features

When logged in as admin, you get access to:

1. **Dashboard** - Overview of system statistics
2. **Bulk Fee Management** - Apply fees to entire classes
3. **Bulk Exam Editor** - Enter exam scores for all students at once
4. **Class Promotion** - Promote students to next class
5. **Manage Teachers** - Add, edit, delete teacher accounts
6. **Manage Students** - Add, edit, delete student accounts

## Security Notes

⚠️ **IMPORTANT**: 
- Change the default admin password after first login
- Keep admin credentials secure
- Only share admin access with trusted personnel
- Regularly review admin activities

## Changing Admin Password

1. Login as admin
2. Go to Profile/Settings (if available)
3. Or update directly in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@school.com" },
  { $set: { password: "new_hashed_password" } }
)
```

Note: Password must be hashed using bcrypt before storing.

## Teacher vs Admin Access

| Feature | Teacher | Admin |
|---------|---------|-------|
| Dashboard | ✅ | ✅ |
| Students & Classes | ✅ | ❌ |
| Attendance | ✅ | ❌ |
| Fee Details | ✅ | ❌ |
| Examination Scores | ✅ | ❌ |
| Bulk Fee Management | ✅ | ✅ |
| Bulk Exam Editor | ✅ | ✅ |
| Class Promotion | ✅ | ✅ |
| Manage Teachers | ❌ | ✅ |
| Manage Students | ❌ | ✅ |

## Troubleshooting

**Admin button not showing?**
- Clear browser cache
- Refresh the page
- Check if frontend is connected to backend

**Admin login fails?**
- Run `npm run create-admin` in Backend directory
- Check MongoDB connection
- Verify credentials are correct

**Admin features not accessible?**
- Check user role in database: `db.users.findOne({ email: "admin@school.com" })`
- Ensure role is set to "admin"
- Re-login after role change
