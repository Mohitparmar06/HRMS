
const Attendance = require("../models/Attendance");

// Check In
exports.checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const attendance = await Attendance.create({
      employeeId,
      checkIn: new Date(),
    });

    res.status(201).json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check Out
exports.checkOut = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        checkOut: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Attendance
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("employeeId");

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};