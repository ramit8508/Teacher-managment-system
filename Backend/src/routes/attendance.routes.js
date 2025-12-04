import { Router } from "express";
import {
  markAttendance,
  getAllAttendance,
  getAttendanceByClass,
  getAttendanceByStudent,
  updateAttendance
} from "../controllers/attendance.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/")
  .post(verifyRole("teacher", "admin"), markAttendance)
  .get(getAllAttendance);

router.route("/class/:classId")
  .get(getAttendanceByClass);

router.route("/student/:studentId")
  .get(getAttendanceByStudent);

router.route("/:id")
  .put(verifyRole("teacher", "admin"), updateAttendance);

export default router;
