import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB (MONGODB_URI already includes the database name)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@school.com" });
    
    if (existingAdmin) {
      console.log("ℹ️ Admin user already exists");
      console.log("Email:", existingAdmin.email);
      console.log("Username:", existingAdmin.username);
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      username: "admin",
      email: "admin@school.com",
      fullName: "System Administrator",
      password: "admin123", // Will be hashed automatically by pre-save hook
      role: "admin",
      isSuperAdmin: true, // Make this admin a super admin
      phone: "1234567890",
      address: "School Office"
    });

    console.log("✅ Super Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@school.com");
    console.log("👤 Username: admin");
    console.log("🔑 Password: admin123");
    console.log("👑 Role: Super Admin (can add other admins)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️ IMPORTANT: Change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
