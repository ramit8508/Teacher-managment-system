import mongoose, { Schema } from "mongoose";

// Sub-schema for individual subject marks
const subjectMarkSchema = new Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  obtainedMarks: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String,
    trim: true
  },
  isPassed: {
    type: Boolean,
    default: true
  },
  remarks: {
    type: String,
    trim: true
  }
}, { _id: true });

const examinationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: false  // Made optional to support predefined classes
    },
    className: {
      type: String,
      trim: true  // For predefined classes like "Class 1 - Section A"
    },
    examName: {
      type: String,
      required: false,
      trim: true
    },
    examType: {
      type: String,
      enum: ["MST-1", "MST-2", "MST-3", "Final", "Unit Test", "Mid-term", "Quarterly", "Half-Yearly", "Annual", "Other"],
      default: "Unit Test"
    },
    // New: Array of subjects with marks
    subjects: {
      type: [subjectMarkSchema],
      required: true,
      validate: {
        validator: function(subjects) {
          return subjects && subjects.length > 0;
        },
        message: "At least one subject is required"
      }
    },
    // Overall calculation fields
    totalMarksAllSubjects: {
      type: Number
    },
    obtainedMarksAllSubjects: {
      type: Number
    },
    overallPercentage: {
      type: Number
    },
    overallGrade: {
      type: String,
      trim: true
    },
    resultStatus: {
      type: String,
      enum: ["Pass", "Fail", "Pending"],
      default: "Pending"
    },
    examDate: {
      type: Date,
      required: true
    },
    remarks: {
      type: String,
      trim: true
    },
    // Legacy fields for backward compatibility (kept as optional)
    subject: {
      type: String,
      trim: true
    },
    totalMarks: {
      type: Number
    },
    obtainedMarks: {
      type: Number
    },
    percentage: {
      type: Number
    },
    grade: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Helper function to calculate grade
const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  else if (percentage >= 80) return "A";
  else if (percentage >= 70) return "B";
  else if (percentage >= 60) return "C";
  else if (percentage >= 50) return "D";
  else return "F";
};

// Normalize className before saving
examinationSchema.pre("save", function (next) {
  if (this.isModified("className") && this.className) {
    this.className = normalizeClassName(this.className);
  }
  next();
});

// Calculate percentages and grades for each subject and overall before saving
examinationSchema.pre("save", function (next) {
  // Calculate for each subject
  if (this.subjects && this.subjects.length > 0) {
    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;
    let allPassed = true;

    this.subjects.forEach(subject => {
      // Calculate subject percentage
      if (subject.totalMarks && subject.obtainedMarks !== undefined) {
        subject.percentage = (subject.obtainedMarks / subject.totalMarks) * 100;
        subject.grade = calculateGrade(subject.percentage);
        
        // Check if passed (assuming 40% is passing)
        subject.isPassed = subject.percentage >= 40;
        if (!subject.isPassed) {
          allPassed = false;
        }
        
        totalMaxMarks += subject.totalMarks;
        totalObtainedMarks += subject.obtainedMarks;
      }
    });

    // Calculate overall marks and percentage
    this.totalMarksAllSubjects = totalMaxMarks;
    this.obtainedMarksAllSubjects = totalObtainedMarks;
    
    if (totalMaxMarks > 0) {
      this.overallPercentage = (totalObtainedMarks / totalMaxMarks) * 100;
      this.overallGrade = calculateGrade(this.overallPercentage);
      this.resultStatus = allPassed && this.overallPercentage >= 40 ? "Pass" : "Fail";
    }
  }

  // Legacy support: if single subject/marks provided
  if (this.totalMarks && this.obtainedMarks !== undefined) {
    this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
    this.grade = calculateGrade(this.percentage);
  }
  
  next();
});

// Helper function to normalize class names
function normalizeClassName(className) {
  if (!className) return '';
  const trimmed = className.trim();
  if (/^\d{1,2}[A-D]$/i.test(trimmed)) return trimmed.toUpperCase();
  if (/^\d{1,2}-[A-D]$/i.test(trimmed)) return trimmed.replace('-', '').toUpperCase();
  const sectionMatch = trimmed.match(/Class (\d{1,2})\s*-\s*Section ([A-D])/i);
  if (sectionMatch) return `${sectionMatch[1]}${sectionMatch[2].toUpperCase()}`;
  const sectionMatch2 = trimmed.match(/Class (\d{1,2})\s+Section ([A-D])/i);
  if (sectionMatch2) return `${sectionMatch2[1]}${sectionMatch2[2].toUpperCase()}`;
  const ordinalMap = {'1st': '1A', '2nd': '2A', '3rd': '3A', '4th': '4A', '5th': '5A', '6th': '6A', '7th': '7A', '8th': '8A', '9th': '9A', '10th': '10A', '11th': '11A', '12th': '12A'};
  if (ordinalMap[trimmed]) return ordinalMap[trimmed];
  const classMatch = trimmed.match(/Class (\d{1,2})$/i);
  if (classMatch) return `${classMatch[1]}A`;
  const ordinalMatch = trimmed.match(/^(\d{1,2})(st|nd|rd|th)$/i);
  if (ordinalMatch) return `${ordinalMatch[1]}A`;
  return trimmed.toUpperCase();
}

export const Examination = mongoose.model("Examination", examinationSchema);
