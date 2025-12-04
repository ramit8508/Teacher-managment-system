import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkRegisterUsers
} from "../controllers/user.controller.js";
import { verifyJWT, verifyRole, optionalJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Register route with optional JWT - allows both initial registration and adding students after login
router.route("/register").post(optionalJWT, registerUser);
router.route("/bulk-register").post(verifyJWT, verifyRole("admin"), bulkRegisterUsers);
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
  .delete(verifyJWT, verifyRole("teacher", "admin"), deleteUser);

export default router;
