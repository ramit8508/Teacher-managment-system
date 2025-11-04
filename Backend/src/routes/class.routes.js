import { Router } from "express";
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass
} from "../controllers/class.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/")
  .post(verifyRole("teacher", "admin"), createClass)
  .get(getClasses);

router.route("/:id")
  .get(getClassById)
  .put(verifyRole("teacher", "admin"), updateClass)
  .delete(verifyRole("teacher", "admin"), deleteClass);

router.route("/:id/add-student")
  .post(verifyRole("teacher", "admin"), addStudentToClass);

export default router;
