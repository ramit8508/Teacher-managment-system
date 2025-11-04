import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Fee } from "../models/fee.model.js";

const createFeeRecord = asyncHandler(async (req, res) => {
  const { student, academicYear, totalFee, dueDate } = req.body;

  if (!student || !academicYear || !totalFee || !dueDate) {
    throw new ApiError(400, "All fields are required");
  }

  const fee = await Fee.create({
    student,
    academicYear,
    totalFee,
    dueDate
  });

  return res.status(201).json(
    new ApiResponse(201, fee, "Fee record created successfully")
  );
});

const getFeesByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const fees = await Fee.find({ student: studentId })
    .populate("student", "fullName email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, fees, "Student fees fetched successfully")
  );
});

const getAllFees = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = status ? { status } : {};

  const fees = await Fee.find(query)
    .populate("student", "fullName email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, fees, "All fees fetched successfully")
  );
});

const recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, paymentMethod, transactionId } = req.body;

  if (!amount) {
    throw new ApiError(400, "Payment amount is required");
  }

  const fee = await Fee.findById(id);

  if (!fee) {
    throw new ApiError(404, "Fee record not found");
  }

  fee.paidAmount += amount;
  fee.paymentHistory.push({
    amount,
    paymentDate: Date.now(),
    paymentMethod,
    transactionId
  });

  await fee.save();

  return res.status(200).json(
    new ApiResponse(200, fee, "Payment recorded successfully")
  );
});

const updateFeeRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { totalFee, dueDate } = req.body;

  const fee = await Fee.findByIdAndUpdate(
    id,
    { totalFee, dueDate },
    { new: true, runValidators: true }
  );

  if (!fee) {
    throw new ApiError(404, "Fee record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, fee, "Fee record updated successfully")
  );
});

const deleteFeeRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const fee = await Fee.findByIdAndDelete(id);

  if (!fee) {
    throw new ApiError(404, "Fee record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Fee record deleted successfully")
  );
});

export {
  createFeeRecord,
  getFeesByStudent,
  getAllFees,
  recordPayment,
  updateFeeRecord,
  deleteFeeRecord
};
