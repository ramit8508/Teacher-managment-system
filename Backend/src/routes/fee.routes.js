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
  .post(verifyRole("admin"), createFeeRecord)
  .get(verifyRole("admin", "teacher"), getAllFees);

router.route("/student/:studentId")
  .get(getFeesByStudent);

router.route("/:id")
  .put(verifyRole("admin"), updateFeeRecord)
  .delete(verifyRole("admin"), deleteFeeRecord);

router.route("/:id/payment")
  .post(verifyRole("admin"), recordPayment);

export default router;
