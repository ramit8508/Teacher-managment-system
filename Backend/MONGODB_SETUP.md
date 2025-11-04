# Quick Setup Guide for MongoDB Atlas

## Step-by-Step Instructions

### 1. Create MongoDB Atlas Account
1. Visit https://www.mongodb.com/cloud/atlas
2. Click "Try Free" to create an account
3. Sign up with Google, GitHub, or email

### 2. Create a Cluster
1. After login, click "Build a Database"
2. Choose the **FREE** "Shared" tier (M0)
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to your location
5. Name your cluster (or keep default "Cluster0")
6. Click "Create"

### 3. Create Database User
1. In the Security section, create a database user
2. Choose "Password" authentication
3. Enter a username (e.g., "adminUser")
4. Generate a secure password (SAVE THIS!)
5. Select "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add only your specific IP
4. Click "Confirm"

### 5. Get Connection String
1. Click "Database" in the left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "5.5 or later"
5. Copy the connection string

### 6. Update .env File
Replace the connection string in your `.env` file:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/teacher_management?retryWrites=true&w=majority
```

Replace:
- `<username>` → Your database username
- `<password>` → Your database password (URL encode special characters)
- `cluster0.xxxxx` → Your actual cluster URL

**Example:**
```env
MONGODB_URI=mongodb+srv://adminUser:MyPass123@cluster0.ab1cd.mongodb.net/teacher_management?retryWrites=true&w=majority
```

### 7. Test Connection
Run the server to test the connection:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected !! DB HOST: cluster0-shard-00-00.xxxxx.mongodb.net
⚡️ Server is running at port: 5000
```

## Common Issues

### Issue: "Authentication failed"
- **Solution**: Check username and password in connection string
- Ensure password doesn't contain special characters (or URL encode them)

### Issue: "Network timeout"
- **Solution**: Check Network Access settings
- Ensure 0.0.0.0/0 is added or your current IP is whitelisted

### Issue: "Cannot connect to database"
- **Solution**: Check if cluster is active (green status)
- Wait a few minutes if just created
- Verify connection string format

## URL Encoding Special Characters

If your password contains special characters, encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`

Example: `Pass@123` → `Pass%40123`

## Next Steps

Once connected:
1. Test the health check: http://localhost:5000/health
2. Use the API endpoints to register users
3. Connect your frontend application
4. Enjoy building! 🚀
