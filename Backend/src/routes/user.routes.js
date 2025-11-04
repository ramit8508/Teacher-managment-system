import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/user.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Admin/Teacher routes
router.route("/")
  .get(verifyJWT, getAllUsers);

router.route("/:id")
  .get(verifyJWT, getUserById)
  .put(verifyJWT, verifyRole("teacher", "admin"), updateUser)
  .delete(verifyJWT, verifyRole("admin"), deleteUser);

export default router;
