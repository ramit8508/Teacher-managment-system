import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";

const markAttendance = asyncHandler(async (req, res) => {
  const { student, classId, className, date, status, remarks } = req.body;

  if (!student || (!classId && !className) || !status) {
    throw new ApiError(400, "Student, class, and status are required");
  }

  // Check if attendance already exists for this date
  const query = {
    student,
    date: new Date(date).setHours(0, 0, 0, 0)
  };
  
  if (classId) {
    query.class = classId;
  } else if (className) {
    query.className = className;
  }

  const existingAttendance = await Attendance.findOne(query);

  if (existingAttendance) {
    // Update existing attendance record
    existingAttendance.status = status;
    if (remarks) existingAttendance.remarks = remarks;
    await existingAttendance.save();
    
    return res.status(200).json(
      new ApiResponse(200, existingAttendance, "Attendance updated successfully")
    );
  }

  const attendanceData = {
    student,
    date: date || Date.now(),
    status,
    remarks
  };
  
  if (classId) {
    attendanceData.class = classId;
  }
  if (className) {
    attendanceData.className = className;
  }

  const attendance = await Attendance.create(attendanceData);

  return res.status(201).json(
    new ApiResponse(201, attendance, "Attendance marked successfully")
  );
});

const getAttendanceByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { startDate, endDate } = req.query;

  // Check if classId matches new format (1A-12D) or is an ObjectId
  const isPredefinedClass = /^\d{1,2}[A-D]$/i.test(classId);
  
  const query = isPredefinedClass ? { className: new RegExp(`^${classId}$`, 'i') } : { class: classId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    query.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.date = { $lte: new Date(endDate) };
  }

  const attendance = await Attendance.find(query)
    .populate("student", "fullName email")
    .populate("class", "className section")
    .sort({ date: -1 });

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

const getAllAttendance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // ONLY filter for teachers, admins see ALL attendance
  let studentIds = null;
  if (req.user && req.user.role === 'teacher') {
    const { User } = await import("../models/user.model.js");
    const { ClassAssignment } = await import("../models/classAssignment.model.js");
    
    // Find classes assigned to this teacher
    const assignments = await ClassAssignment.find({ 
      assignedTeachers: req.user._id 
    }).select('className');
    
    const assignedClassNames = assignments.map(a => a.className);
    
    // Get students from assigned classes OR students created by this teacher
    const query = {
      role: 'student',
      $or: [
        { createdBy: req.user._id },
        { className: { $in: assignedClassNames } }
      ]
    };
    
    const teacherStudents = await User.find(query).select('_id');
    studentIds = teacherStudents.map(s => s._id);
    
    // If teacher has no students, return empty array
    if (studentIds.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], "No attendance records found")
      );
    }
  }

  const query = {};
  
  // Add student filter for teachers
  if (studentIds) {
    query.student = { $in: studentIds };
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    query.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.date = { $lte: new Date(endDate) };
  }

  const attendance = await Attendance.find(query)
    .populate("student", "fullName email")
    .populate("class", "className section")
    .sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(200, attendance, "Attendance fetched successfully")
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
  getAllAttendance,
  getAttendanceByClass,
  getAttendanceByStudent,
  updateAttendance
};
