import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Check if DB name is already in the URI
    const uri = process.env.MONGODB_URI.includes('mongodb.net/')
      ? process.env.MONGODB_URI
      : `${process.env.MONGODB_URI}/${DB_NAME}`;
    
    const connectionInstance = await mongoose.connect(uri);
    
    console.log(`\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    
    
    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ MONGODB connection FAILED:", error);
    process.exit(1);
  }
};

export default connectDB;
