import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Class } from "../models/class.model.js";

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

export {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass
};
