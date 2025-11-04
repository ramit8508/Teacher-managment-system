import { Router } from "express";
import {
  createExamination,
  getAllExaminations,
  getExaminationsByClass,
  getExaminationsByStudent,
  updateExamination,
  deleteExamination,
  createBulkExaminations,
  getExaminationStats
} from "../controllers/examination.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/")
  .get(getAllExaminations)
  .post(verifyRole("teacher", "admin"), createExamination);

router.route("/bulk")
  .post(verifyRole("teacher", "admin"), createBulkExaminations);

router.route("/stats")
  .get(getExaminationStats);

router.route("/class/:classId")
  .get(getExaminationsByClass);

router.route("/student/:studentId")
  .get(getExaminationsByStudent);

router.route("/:id")
  .put(verifyRole("teacher", "admin"), updateExamination)
  .delete(verifyRole("teacher", "admin"), deleteExamination);

export default router;
