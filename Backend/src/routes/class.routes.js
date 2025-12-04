import { Router } from "express";
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass,
  assignTeachersToClass,
  getClassAssignments,
  getAssignmentByClassName,
  getAllClassNames,
  createClassName,
  deleteClassName
} from "../controllers/class.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/")
  .post(verifyRole("teacher", "admin"), createClass)
  .get(getClasses);

// Class names management routes
router.route("/names")
  .get(getAllClassNames)
  .post(verifyRole("admin"), createClassName);

router.route("/names/:className")
  .delete(verifyRole("admin"), deleteClassName);

router.route("/assignments")
  .get(verifyRole("teacher", "admin"), getClassAssignments);

router.route("/assignments/assign")
  .post(verifyRole("admin"), assignTeachersToClass);

router.route("/assignments/:className")
  .get(verifyRole("teacher", "admin"), getAssignmentByClassName);

router.route("/:id")
  .get(getClassById)
  .put(verifyRole("teacher", "admin"), updateClass)
  .delete(verifyRole("teacher", "admin"), deleteClass);

router.route("/:id/add-student")
  .post(verifyRole("teacher", "admin"), addStudentToClass);

export default router;
