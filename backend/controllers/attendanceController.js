const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

exports.checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "employeeId is required" });
    }

    const attendance = await Attendance.create({
      employeeId,
      checkIn: new Date(),
    });

    const emp = await Employee.findById(employeeId);
    const empName = emp?.fullName || "Employee";
    const empCode = emp?.employeeId || "";
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    await Notification.create({
      title: "Attendance Check-In",
      message: `${empName} (${empCode}) checked in at ${time}.`,
      type: "Attendance Check-In",
      recipientRole: "Admin",
      recipientId: null,
      isRead: false,
    });

    await Notification.create({
      title: "Attendance Checked In",
      message: `You have successfully checked in at ${time}. Have a productive day!`,
      type: "Attendance Check-In",
      recipientRole: "Employee",
      recipientId: empCode || null,
      isRead: false,
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { checkOut: new Date() },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    const emp = await Employee.findById(attendance.employeeId);
    const empName = emp?.fullName || "Employee";
    const empCode = emp?.employeeId || "";
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    await Notification.create({
      title: "Attendance Check-Out",
      message: `${empName} (${empCode}) checked out at ${time}.`,
      type: "Attendance Check-Out",
      recipientRole: "Admin",
      recipientId: null,
      isRead: false,
    });

    await Notification.create({
      title: "Attendance Checked Out",
      message: `You have successfully checked out at ${time}. Great work today!`,
      type: "Attendance Check-Out",
      recipientRole: "Employee",
      recipientId: empCode || null,
      isRead: false,
    });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("employeeId");
    res.status(200).json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }
    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }
    res.status(200).json({ success: true, message: "Attendance record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
