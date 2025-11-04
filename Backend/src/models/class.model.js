import mongoose, { Schema } from "mongoose";

const classSchema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    schedule: {
      day: String,
      startTime: String,
      endTime: String
    }
  },
  {
    timestamps: true
  }
);

export const Class = mongoose.model("Class", classSchema);
