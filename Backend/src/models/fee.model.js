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

export const Fee = mongoose.model("Fee", feeSchema);
