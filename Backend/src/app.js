import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
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

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running"
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
