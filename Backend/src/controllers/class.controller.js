import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Class } from "../models/class.model.js";
import { ClassAssignment } from "../models/classAssignment.model.js";

const createClass = asyncHandler(async (req, res) => {
  const { className, section, subject, schedule } = req.body;

  if (!className || !section || !subject) {
    throw new ApiError(400, "All fields are required");
  }

  const classData = await Class.create({
    className,
    section,
    subject,
    teacher: req.user._id,
    schedule
  });

  return res.status(201).json(
    new ApiResponse(201, classData, "Class created successfully")
  );
});

const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ teacher: req.user._id })
    .populate("teacher", "fullName email")
    .populate("students", "fullName email");

  return res.status(200).json(
    new ApiResponse(200, classes, "Classes fetched successfully")
  );
});

const getClassById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classData = await Class.findById(id)
    .populate("teacher", "fullName email")
    .populate("students", "fullName email");

  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  return res.status(200).json(
    new ApiResponse(200, classData, "Class fetched successfully")
  );
});

const updateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { className, section, subject, schedule } = req.body;

  const classData = await Class.findByIdAndUpdate(
    id,
    { className, section, subject, schedule },
    { new: true, runValidators: true }
  );

  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  return res.status(200).json(
    new ApiResponse(200, classData, "Class updated successfully")
  );
});

const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classData = await Class.findByIdAndDelete(id);

  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Class deleted successfully")
  );
});

const addStudentToClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const classData = await Class.findById(id);

  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  if (classData.students.includes(studentId)) {
    throw new ApiError(400, "Student already enrolled in this class");
  }

  classData.students.push(studentId);
  await classData.save();

  return res.status(200).json(
    new ApiResponse(200, classData, "Student added to class successfully")
  );
});

const assignTeachersToClass = asyncHandler(async (req, res) => {
  const { className, teacherIds } = req.body;

  if (!className || !Array.isArray(teacherIds)) {
    throw new ApiError(400, "className and teacherIds array are required");
  }

  // Find or create assignment
  let assignment = await ClassAssignment.findOne({ className });

  if (assignment) {
    assignment.assignedTeachers = teacherIds;
    await assignment.save();
  } else {
    assignment = await ClassAssignment.create({
      className,
      assignedTeachers: teacherIds
    });
  }

  const populatedAssignment = await ClassAssignment.findById(assignment._id)
    .populate("assignedTeachers", "fullName email subject");

  return res.status(200).json(
    new ApiResponse(200, populatedAssignment, "Teachers assigned successfully")
  );
});

const getClassAssignments = asyncHandler(async (req, res) => {
  const assignments = await ClassAssignment.find()
    .populate("assignedTeachers", "fullName email subject");

  return res.status(200).json(
    new ApiResponse(200, assignments, "Assignments fetched successfully")
  );
});

const getAssignmentByClassName = asyncHandler(async (req, res) => {
  const { className } = req.params;

  const assignment = await ClassAssignment.findOne({ className })
    .populate("assignedTeachers", "fullName email subject");

  if (!assignment) {
    return res.status(200).json(
      new ApiResponse(200, { className, assignedTeachers: [] }, "No assignment found for this class")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, assignment, "Assignment fetched successfully")
  );
});

export {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass,
  assignTeachersToClass,
  getClassAssignments,
  getAssignmentByClassName
};
