import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware - Configure CORS for both local and production
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRoutes from "./routes/user.routes.js";
import classRoutes from "./routes/class.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import examinationRoutes from "./routes/examination.routes.js";
import feeRoutes from "./routes/fee.routes.js";

// Routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/classes", classRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/examinations", examinationRoutes);
app.use("/api/v1/fees", feeRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Teacher Management System API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      users: "/api/v1/users",
      classes: "/api/v1/classes",
      attendance: "/api/v1/attendance",
      examinations: "/api/v1/examinations",
      fees: "/api/v1/fees"
    }
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
