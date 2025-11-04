import { Router } from "express";
import {
  createFeeRecord,
  getFeesByStudent,
  getAllFees,
  recordPayment,
  updateFeeRecord,
  deleteFeeRecord
} from "../controllers/fee.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.route("/")
  .post(verifyRole("admin", "teacher"), createFeeRecord)  // Allow teachers to create fee records
  .get(verifyRole("admin", "teacher"), getAllFees);

router.route("/student/:studentId")
  .get(getFeesByStudent);

router.route("/:id")
  .put(verifyRole("admin", "teacher"), updateFeeRecord)  // Allow teachers to update fee records
  .delete(verifyRole("admin", "teacher"), deleteFeeRecord);  // Allow teachers to delete fee records

router.route("/:id/payment")
  .post(verifyRole("admin", "teacher"), recordPayment);  // Allow teachers to record payments

export default router;
