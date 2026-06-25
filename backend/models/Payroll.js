const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    period: {
      type: String,
      required: true,
    },

    periodKey: {
      type: String,
      required: true,
    },

    baseSalary: {
      type: Number,
      required: true,
    },

    allowances: {
      type: Number,
      default: 0,
    },

    hra: {
      type: Number,
      default: 0,
    },

    transport: {
      type: Number,
      default: 0,
    },

    medical: {
      type: Number,
      default: 0,
    },

    specialAllowance: {
      type: Number,
      default: 0,
    },

    bonus: {
      type: Number,
      default: 0,
    },

    overtimePay: {
      type: Number,
      default: 0,
    },

    grossSalary: {
      type: Number,
      required: true,
    },

    pf: {
      type: Number,
      default: 0,
    },

    professionalTax: {
      type: Number,
      default: 0,
    },

    incomeTax: {
      type: Number,
      default: 0,
    },

    insurance: {
      type: Number,
      default: 0,
    },

    otherDeductions: {
      type: Number,
      default: 0,
    },

    totalDeductions: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index({ employeeId: 1, periodKey: 1 }, { unique: true });

module.exports =
  mongoose.models.Payroll ||
  mongoose.model("Payroll", payrollSchema);
