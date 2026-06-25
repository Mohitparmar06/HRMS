const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Employee Added",
        "Employee Updated",
        "Employee Deleted",
        "Leave Applied",
        "Leave Approved",
        "Leave Rejected",
        "Payroll Generated",
        "Payroll Paid",
        "Attendance Check-In",
        "Attendance Check-Out",
        "Profile Updated",
        "General",
      ],
      default: "General",
    },
    recipientRole: {
      type: String,
      enum: ["Admin", "Employee"],
      required: true,
    },
    recipientId: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
