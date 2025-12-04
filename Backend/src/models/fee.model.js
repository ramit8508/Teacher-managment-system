import mongoose, { Schema } from "mongoose";

const feeSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    totalFee: {
      type: Number,
      required: true
    },
    // Additional fields for compatibility with frontend
    feeType: {
      type: String,
      enum: ["Tuition Fee", "Library Fee", "Lab Fee", "Transport Fee", "Exam Fee", "Monthly Fee", "Quarterly Fee", "Yearly Fee", "Admission Fee", "Other"],
      default: "Tuition Fee"
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class"
    },
    className: {
      type: String  // For predefined classes like "Class 1 - Section A"
    },
    remarks: {
      type: String
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["paid", "pending", "overdue", "partially_paid"],
      default: "pending"
    },
    paymentHistory: [
      {
        amount: Number,
        paymentDate: Date,
        paymentMethod: String,
        transactionId: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Normalize className before saving
feeSchema.pre("save", function (next) {
  if (this.isModified("className") && this.className) {
    this.className = normalizeClassName(this.className);
  }
  next();
});

// Calculate pending amount before saving
feeSchema.pre("save", function (next) {
  this.pendingAmount = this.totalFee - this.paidAmount;
  
  if (this.paidAmount >= this.totalFee) {
    this.status = "paid";
  } else if (this.paidAmount > 0) {
    this.status = "partially_paid";
  } else if (new Date() > this.dueDate) {
    this.status = "overdue";
  } else {
    this.status = "pending";
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

export const Fee = mongoose.model("Fee", feeSchema);
