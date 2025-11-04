import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Examination } from "../models/examination.model.js";

const createExamination = asyncHandler(async (req, res) => {
  const { student, classId, examName, subject, totalMarks, obtainedMarks, examDate, remarks } = req.body;

  if (!student || !classId || !examName || !subject || !totalMarks || obtainedMarks === undefined) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const examination = await Examination.create({
    student,
    class: classId,
    examName,
    subject,
    totalMarks,
    obtainedMarks,
    examDate: examDate || Date.now(),
    remarks
  });

  return res.status(201).json(
    new ApiResponse(201, examination, "Examination record created successfully")
  );
});

const getAllExaminations = asyncHandler(async (req, res) => {
  const { classId, studentId, subject } = req.query;
  
  let query = {};
  if (classId) query.class = classId;
  if (studentId) query.student = studentId;
  if (subject) query.subject = subject;

  const examinations = await Examination.find(query)
    .populate("student", "fullName email")
    .populate("class", "className section")
    .sort({ examDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, examinations, "Examinations fetched successfully")
  );
});

const getExaminationsByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const examinations = await Examination.find({ class: classId })
    .populate("student", "fullName email")
    .populate("class", "className section");

  return res.status(200).json(
    new ApiResponse(200, examinations, "Examinations fetched successfully")
  );
});

const getExaminationsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const examinations = await Examination.find({ student: studentId })
    .populate("class", "className section subject")
    .sort({ examDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, examinations, "Student examinations fetched successfully")
  );
});

const updateExamination = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { obtainedMarks, remarks } = req.body;

  const examination = await Examination.findByIdAndUpdate(
    id,
    { obtainedMarks, remarks },
    { new: true, runValidators: true }
  );

  if (!examination) {
    throw new ApiError(404, "Examination record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, examination, "Examination updated successfully")
  );
});

const deleteExamination = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const examination = await Examination.findByIdAndDelete(id);

  if (!examination) {
    throw new ApiError(404, "Examination record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Examination deleted successfully")
  );
});

export {
  createExamination,
  getAllExaminations,
  getExaminationsByClass,
  getExaminationsByStudent,
  updateExamination,
  deleteExamination
};
