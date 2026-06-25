const mongoose = require("mongoose");

const demoRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    teamSize: {
      type: String,
      default: "",
    },
    preferredDate: {
      type: String,
      default: "",
    },
    preferredTime: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
    statusNote: {
      type: String,
      default: "",
    },
    processedBy: {
      type: String,
      default: "",
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

demoRequestSchema.index({ status: 1 });
demoRequestSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.DemoRequest ||
  mongoose.model("DemoRequest", demoRequestSchema);
