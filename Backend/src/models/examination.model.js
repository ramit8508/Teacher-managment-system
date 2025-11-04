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
      required: true
    },
    examName: {
      type: String,
      required: true,
      trim: true
    },
    examType: {
      type: String,
      enum: ["Unit Test", "Mid-term", "Final", "Quarterly", "Half-Yearly", "Annual", "Other"],
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

export const Examination = mongoose.model("Examination", examinationSchema);
