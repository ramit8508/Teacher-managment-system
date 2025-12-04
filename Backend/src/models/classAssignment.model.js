import mongoose, { Schema } from "mongoose";

const classAssignmentSchema = new Schema(
  {
    className: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    assignedTeachers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Normalize className before saving
classAssignmentSchema.pre("save", function (next) {
  if (this.isModified("className") && this.className) {
    this.className = normalizeClassName(this.className);
  }
  next();
});

// Helper function to normalize class names
function normalizeClassName(className) {
  if (!className) return '';
  
  const trimmed = className.trim();
  
  // Already in correct format (e.g., "10A", "11B")
  if (/^\d{1,2}[A-D]$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Has hyphen format like "11-A" or "10-B"
  if (/^\d{1,2}-[A-D]$/i.test(trimmed)) {
    return trimmed.replace('-', '').toUpperCase();
  }
  
  // Handle "Class X - Section Y" format
  const sectionMatch = trimmed.match(/Class (\d{1,2})\s*-\s*Section ([A-D])/i);
  if (sectionMatch) {
    return `${sectionMatch[1]}${sectionMatch[2].toUpperCase()}`;
  }
  
  // Handle "Class X Section Y" format (no dash)
  const sectionMatch2 = trimmed.match(/Class (\d{1,2})\s+Section ([A-D])/i);
  if (sectionMatch2) {
    return `${sectionMatch2[1]}${sectionMatch2[2].toUpperCase()}`;
  }
  
  // Ordinal numbers mapping
  const ordinalMap = {
    '1st': '1A', '2nd': '2A', '3rd': '3A', '4th': '4A', '5th': '5A',
    '6th': '6A', '7th': '7A', '8th': '8A', '9th': '9A', '10th': '10A',
    '11th': '11A', '12th': '12A'
  };
  
  if (ordinalMap[trimmed]) {
    return ordinalMap[trimmed];
  }
  
  // If it's just "Class X", default to section A
  const classMatch = trimmed.match(/Class (\d{1,2})$/i);
  if (classMatch) {
    return `${classMatch[1]}A`;
  }
  
  // If it's just a number with "th", "st", "nd", "rd"
  const ordinalMatch = trimmed.match(/^(\d{1,2})(st|nd|rd|th)$/i);
  if (ordinalMatch) {
    return `${ordinalMatch[1]}A`;
  }
  
  return trimmed.toUpperCase();
}

export const ClassAssignment = mongoose.model("ClassAssignment", classAssignmentSchema);
