import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Fee } from "../models/fee.model.js";

const createFeeRecord = asyncHandler(async (req, res) => {
  const { studentId, student, academicYear, totalFee, amount, dueDate, feeType, status, classId, className, remarks } = req.body;

  // Support both old format (student, academicYear, totalFee) and new format (studentId, amount, feeType)
  const studentField = studentId || student;
  const feeAmount = amount || totalFee;
  const academicYearField = academicYear || new Date().getFullYear().toString();

  if (!studentField || !feeAmount || !dueDate) {
    throw new ApiError(400, "Student, amount, and due date are required");
  }

  const feeData = {
    student: studentField,
    academicYear: academicYearField,
    totalFee: feeAmount,
    dueDate,
    status: status || 'pending',
    feeType: feeType || 'Tuition Fee',
    remarks: remarks || ''
  };

  // Add class information - check both className and classId
  if (className) {
    feeData.className = className;
  } else if (classId) {
    feeData.classId = classId;
  }

  const fee = await Fee.create(feeData);

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

  // If the logged-in user is a teacher (not admin), only show fees for students they created
  let studentIds = null;
  if (req.user && req.user.role === 'teacher') {
    // First, get all students created by this teacher
    const { User } = await import("../models/user.model.js");
    const teacherStudents = await User.find({ 
      role: 'student', 
      createdBy: req.user._id 
    }).select('_id');
    
    studentIds = teacherStudents.map(s => s._id);
    
    // If teacher has no students, return empty array
    if (studentIds.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], "No fee records found")
      );
    }
  }

  const query = status ? { status } : {};
  
  // Add student filter for teachers
  if (studentIds) {
    query.student = { $in: studentIds };
  }

  const fees = await Fee.find(query)
    .populate("student", "fullName email className")
    .populate("classId", "name")
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
  const { totalFee, dueDate, status, paidDate, ...otherFields } = req.body;

  const fee = await Fee.findById(id);
  
  if (!fee) {
    throw new ApiError(404, "Fee record not found");
  }

  // If marking as paid, set paidAmount to totalFee
  if (status === 'paid' && fee.status !== 'paid') {
    fee.paidAmount = fee.totalFee;
    fee.status = 'paid';
    if (paidDate) {
      fee.paymentHistory.push({
        amount: fee.totalFee - (fee.paidAmount || 0),
        paymentDate: paidDate,
        paymentMethod: 'Manual',
        transactionId: 'MANUAL_' + Date.now()
      });
    }
  }

  // Update other fields if provided
  if (totalFee !== undefined) fee.totalFee = totalFee;
  if (dueDate !== undefined) fee.dueDate = dueDate;
  
  // Update any other fields from request
  Object.keys(otherFields).forEach(key => {
    if (otherFields[key] !== undefined) {
      fee[key] = otherFields[key];
    }
  });

  await fee.save();

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
