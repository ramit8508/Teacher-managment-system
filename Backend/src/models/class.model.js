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
    assignedTeachers: [
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

// Normalize className before saving
classSchema.pre("save", function (next) {
  if (this.isModified("className") && this.className) {
    this.className = normalizeClassName(this.className);
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

export const Class = mongoose.model("Class", classSchema);
