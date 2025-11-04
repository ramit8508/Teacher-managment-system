import mongoose, { Schema } from "mongoose";

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
    subject: {
      type: String,
      required: true,
      trim: true
    },
    totalMarks: {
      type: Number,
      required: true
    },
    obtainedMarks: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number
    },
    grade: {
      type: String,
      trim: true
    },
    examDate: {
      type: Date,
      required: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Calculate percentage before saving
examinationSchema.pre("save", function (next) {
  if (this.totalMarks && this.obtainedMarks) {
    this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
    
    // Calculate grade
    if (this.percentage >= 90) this.grade = "A+";
    else if (this.percentage >= 80) this.grade = "A";
    else if (this.percentage >= 70) this.grade = "B";
    else if (this.percentage >= 60) this.grade = "C";
    else if (this.percentage >= 50) this.grade = "D";
    else this.grade = "F";
  }
  next();
});

export const Examination = mongoose.model("Examination", examinationSchema);
