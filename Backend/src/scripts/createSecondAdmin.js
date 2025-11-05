import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

// Load environment variables
dotenv.config();

const createSecondAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if second admin already exists
    const existingAdmin = await User.findOne({ email: "ramitgoyal8508@gmail.com" });
    
    if (existingAdmin) {
      console.log("ℹ️ Second admin user already exists");
      console.log("Email:", existingAdmin.email);
      console.log("Username:", existingAdmin.username);
      process.exit(0);
    }

    // Create second admin user
    const adminUser = await User.create({
      username: "ramitgoyal",
      email: "ramitgoyal8508@gmail.com",
      fullName: "Ramit Goyal",
      password: "admin123", // Will be hashed automatically by pre-save hook
      role: "admin",
      phone: "8508000000",
      address: "School Office"
    });

    console.log("✅ Second admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: ramitgoyal8508@gmail.com");
    console.log("👤 Username: ramitgoyal");
    console.log("🔑 Password: admin123");
    console.log("👑 Role: admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️ IMPORTANT: Change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
};

// Run the script
createSecondAdmin();
