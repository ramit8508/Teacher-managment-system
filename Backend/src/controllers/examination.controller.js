import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Examination } from "../models/examination.model.js";

const createExamination = asyncHandler(async (req, res) => {
  const { student, classId, examName, examType, subjects, examDate, remarks } = req.body;

  // Validate required fields
  if (!student || !classId) {
    throw new ApiError(400, "Student and class are required");
  }

  // Validate subjects array
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    throw new ApiError(400, "At least one subject with marks is required");
  }

  // Validate each subject has required fields
  for (const subject of subjects) {
    if (!subject.subjectName || subject.totalMarks === undefined || subject.obtainedMarks === undefined) {
      throw new ApiError(400, "Each subject must have subjectName, totalMarks, and obtainedMarks");
    }
    if (subject.obtainedMarks > subject.totalMarks) {
      throw new ApiError(400, `Obtained marks cannot exceed total marks for ${subject.subjectName}`);
    }
  }

  // Check if classId matches new format (1A-12D) or is a database ObjectId
  const isPredefinedClass = /^\d{1,2}[A-D]$/i.test(classId);
  
  const examinationData = {
    student,
    examName,
    examType: examType || "Unit Test",
    subjects,
    examDate: examDate || Date.now(),
    remarks
  };
  
  // Set class or className based on type
  if (isPredefinedClass) {
    examinationData.className = classId;
  } else {
    examinationData.class = classId;
  }

  const examination = await Examination.create(examinationData);

  // Populate student and class details
  await examination.populate([
    { path: "student", select: "fullName email" },
    { path: "class", select: "className section" }
  ]);

  return res.status(201).json(
    new ApiResponse(201, examination, "Examination record created successfully")
  );
});

const getAllExaminations = asyncHandler(async (req, res) => {
  const { classId, studentId, subject } = req.query;
  
  // ONLY filter for teachers, admins see ALL exams
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
        new ApiResponse(200, [], "No examination records found")
      );
    }
  }
  
  let query = {};
  if (classId) query.class = classId;
  if (studentId) query.student = studentId;
  if (subject) query.subject = subject;
  
  // Add student filter for teachers
  if (studentIds) {
    query.student = { $in: studentIds };
  }

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
  const { subjects, remarks, examDate, examType } = req.body;

  const examination = await Examination.findById(id);
  
  if (!examination) {
    throw new ApiError(404, "Examination record not found");
  }

  // Update subjects if provided
  if (subjects && Array.isArray(subjects)) {
    // Validate each subject
    for (const subject of subjects) {
      if (subject.obtainedMarks > subject.totalMarks) {
        throw new ApiError(400, `Obtained marks cannot exceed total marks for ${subject.subjectName}`);
      }
    }
    examination.subjects = subjects;
  }

  // Update other fields if provided
  if (remarks !== undefined) examination.remarks = remarks;
  if (examDate) examination.examDate = examDate;
  if (examType) examination.examType = examType;

  await examination.save();

  // Populate student and class details
  await examination.populate([
    { path: "student", select: "fullName email" },
    { path: "class", select: "className section" }
  ]);

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

// New: Create examinations for multiple students at once
const createBulkExaminations = asyncHandler(async (req, res) => {
  const { students, classId, examName, examType, subjects, examDate, remarks } = req.body;

  // Validate required fields
  if (!students || !Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "Students array is required");
  }
  if (!classId) {
    throw new ApiError(400, "Class is required");
  }
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    throw new ApiError(400, "At least one subject is required");
  }

  const examinations = [];
  
  // Create examination record for each student
  for (const studentData of students) {
    if (!studentData.studentId) {
      throw new ApiError(400, "Each student must have a studentId");
    }

    // Use student-specific subjects if provided, otherwise use common subjects
    const studentSubjects = studentData.subjects || subjects;

    const examination = await Examination.create({
      student: studentData.studentId,
      class: classId,
      examName,
      examType: examType || "Unit Test",
      subjects: studentSubjects,
      examDate: examDate || Date.now(),
      remarks: studentData.remarks || remarks
    });

    await examination.populate([
      { path: "student", select: "fullName email" },
      { path: "class", select: "className section" }
    ]);

    examinations.push(examination);
  }

  return res.status(201).json(
    new ApiResponse(201, examinations, `${examinations.length} examination records created successfully`)
  );
});

// Get examination statistics
const getExaminationStats = asyncHandler(async (req, res) => {
  const { classId, examName } = req.query;

  let query = {};
  if (classId) query.class = classId;
  if (examName) query.examName = examName;

  const examinations = await Examination.find(query);

  const stats = {
    totalStudents: examinations.length,
    passed: examinations.filter(e => e.resultStatus === "Pass").length,
    failed: examinations.filter(e => e.resultStatus === "Fail").length,
    averagePercentage: examinations.length > 0 
      ? examinations.reduce((sum, e) => sum + (e.overallPercentage || 0), 0) / examinations.length 
      : 0,
    gradeDistribution: {
      "A+": examinations.filter(e => e.overallGrade === "A+").length,
      "A": examinations.filter(e => e.overallGrade === "A").length,
      "B": examinations.filter(e => e.overallGrade === "B").length,
      "C": examinations.filter(e => e.overallGrade === "C").length,
      "D": examinations.filter(e => e.overallGrade === "D").length,
      "F": examinations.filter(e => e.overallGrade === "F").length
    }
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Examination statistics fetched successfully")
  );
});

export {
  createExamination,
  getAllExaminations,
  getExaminationsByClass,
  getExaminationsByStudent,
  updateExamination,
  deleteExamination,
  createBulkExaminations,
  getExaminationStats
};
