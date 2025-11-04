import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class"
    },
    className: {
      type: String,
      default: ""
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
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

// Index for quick queries
attendanceSchema.index({ student: 1, class: 1, date: 1 });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
