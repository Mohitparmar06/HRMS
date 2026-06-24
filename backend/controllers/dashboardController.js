const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Notification = require("../models/Notification");
const Payroll = require("../models/Payroll");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const totalLeaves = await Leave.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalPayrolls = await Payroll.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalAttendance,
        totalLeaves,
        totalNotifications,
        totalPayrolls,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};