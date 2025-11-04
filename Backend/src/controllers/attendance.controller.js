import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";

const markAttendance = asyncHandler(async (req, res) => {
  const { student, classId, date, status, remarks } = req.body;

  if (!student || !classId || !status) {
    throw new ApiError(400, "Student, class, and status are required");
  }

  // Check if attendance already exists for this date
  const existingAttendance = await Attendance.findOne({
    student,
    class: classId,
    date: new Date(date).setHours(0, 0, 0, 0)
  });

  if (existingAttendance) {
    throw new ApiError(400, "Attendance already marked for this date");
  }

  const attendance = await Attendance.create({
    student,
    class: classId,
    date: date || Date.now(),
    status,
    remarks
  });

  return res.status(201).json(
    new ApiResponse(201, attendance, "Attendance marked successfully")
  );
});

const getAttendanceByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { startDate, endDate } = req.query;

  const query = { class: classId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const attendance = await Attendance.find(query)
    .populate("student", "fullName email")
    .populate("class", "className section");

  return res.status(200).json(
    new ApiResponse(200, attendance, "Attendance fetched successfully")
  );
});

const getAttendanceByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const attendance = await Attendance.find({ student: studentId })
    .populate("class", "className section subject")
    .sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(200, attendance, "Student attendance fetched successfully")
  );
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const attendance = await Attendance.findByIdAndUpdate(
    id,
    { status, remarks },
    { new: true, runValidators: true }
  );

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, attendance, "Attendance updated successfully")
  );
});

export {
  markAttendance,
  getAttendanceByClass,
  getAttendanceByStudent,
  updateAttendance
};
