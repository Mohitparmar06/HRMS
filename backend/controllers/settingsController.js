const Settings = require("../models/Settings");
const { notifyAdmin, notifyEmployee } = require("../services/notificationService");

const DEFAULTS = {
  company: {
    name: "Dayflow Inc.",
    email: "info@dayflow.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
    website: "https://dayflow.com",
    logo: "",
  },
  attendance: {
    startTime: "09:00",
    endTime: "18:00",
    lateThreshold: 15,
    halfDayThreshold: 4,
    workingHours: 8,
    gracePeriod: 15,
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    overtimeEnabled: true,
    autoAbsent: false,
  },
  payroll: {
    currency: "USD",
    currencySymbol: "$",
    salaryCycle: "Monthly",
    taxPercentage: 18,
    pfPercentage: 12,
    overtimeRate: 1.5,
    bonusPercentage: 5,
    generateDay: 28,
  },
  leave: {
    casualLeave: 12,
    sickLeave: 10,
    earnedLeave: 15,
    maternityLeave: 90,
    paternityLeave: 15,
    managerApproval: true,
  },
  preferences: {
    theme: "dark",
    language: "en",
    timezone: "UTC+00:00",
    dateFormat: "YYYY-MM-DD",
    emailNotifications: true,
    browserNotifications: false,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
  },
};

exports.getAllSettings = async (req, res) => {
  try {
    const sections = Object.keys(DEFAULTS);
    const settings = {};

    for (const section of sections) {
      const data = await Settings.getSection(section);
      settings[section] = data || DEFAULTS[section];
    }

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSection = async (req, res) => {
  try {
    const { section } = req.params;

    if (!DEFAULTS[section]) {
      return res.status(400).json({ success: false, message: "Invalid section" });
    }

    const data = await Settings.getSection(section);
    res.status(200).json({ success: true, data: data || DEFAULTS[section] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { section } = req.params;

    if (!DEFAULTS[section]) {
      return res.status(400).json({ success: false, message: "Invalid section" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "No data provided" });
    }

    const data = await Settings.updateSection(section, req.body, req.user?.id || "admin");

    res.status(200).json({ success: true, message: `${section} settings updated`, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const User = require("../models/User");
    const bcrypt = require("bcrypt");

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const Employee = require("../models/Employee");
    const emp = await Employee.findOne({ employeeId: user.employeeId });
    const empCode = emp?.employeeId || user.employeeId || "";

    await notifyEmployee({
      title: "Password Reset",
      message: `Your password has been changed successfully.`,
      type: "Password Reset",
      employeeId: empCode,
    });

    await notifyAdmin({
      title: "Password Reset",
      message: `${user.fullName} (${empCode}) has changed their password.`,
      type: "Password Reset",
    });

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.backupData = async (req, res) => {
  try {
    const Employee = require("../models/Employee");
    const Attendance = require("../models/Attendance");
    const Leave = require("../models/Leave");
    const Payroll = require("../models/Payroll");
    const Notification = require("../models/Notification");
    const DemoRequest = require("../models/DemoRequest");
    const UserPreference = require("../models/UserPreference");

    const [employees, attendance, leaves, payrolls, notifications, demoRequests, settings, userPreferences] =
      await Promise.all([
        Employee.find(),
        Attendance.find(),
        Leave.find(),
        Payroll.find(),
        Notification.find(),
        DemoRequest.find(),
        Settings.find(),
        UserPreference.find(),
      ]);

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      data: { employees, attendance, leaves, payrolls, notifications, demoRequests, settings, userPreferences },
    };

    res.status(200).json({ success: true, backup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreData = async (req, res) => {
  try {
    const { backup } = req.body;

    if (!backup || !backup.data) {
      return res.status(400).json({ success: false, message: "Invalid backup data" });
    }

    const Employee = require("../models/Employee");
    const Attendance = require("../models/Attendance");
    const Leave = require("../models/Leave");
    const Payroll = require("../models/Payroll");
    const Notification = require("../models/Notification");
    const DemoRequest = require("../models/DemoRequest");
    const Settings = require("../models/Settings");
    const UserPreference = require("../models/UserPreference");

    const d = backup.data;

    if (d.employees) { await Employee.deleteMany({}); await Employee.insertMany(d.employees || []); }
    if (d.attendance) { await Attendance.deleteMany({}); await Attendance.insertMany(d.attendance || []); }
    if (d.leaves) { await Leave.deleteMany({}); await Leave.insertMany(d.leaves || []); }
    if (d.payrolls) { await Payroll.deleteMany({}); await Payroll.insertMany(d.payrolls || []); }
    if (d.notifications) { await Notification.deleteMany({}); await Notification.insertMany(d.notifications || []); }
    if (d.demoRequests) { await DemoRequest.deleteMany({}); await DemoRequest.insertMany(d.demoRequests || []); }
    if (d.settings) { await Settings.deleteMany({}); await Settings.insertMany(d.settings || []); }
    if (d.userPreferences) { await UserPreference.deleteMany({}); await UserPreference.insertMany(d.userPreferences || []); }

    res.status(200).json({ success: true, message: "Data restored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetData = async (req, res) => {
  try {
    const { confirm } = req.body;

    if (confirm !== true) {
      return res.status(400).json({
        success: false,
        message: "Set confirm=true to reset all data",
      });
    }

    const Employee = require("../models/Employee");
    const Attendance = require("../models/Attendance");
    const Leave = require("../models/Leave");
    const Payroll = require("../models/Payroll");
    const Notification = require("../models/Notification");
    const DemoRequest = require("../models/DemoRequest");
    const Settings = require("../models/Settings");
    const UserPreference = require("../models/UserPreference");

    await Promise.all([
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Payroll.deleteMany({}),
      Notification.deleteMany({}),
      DemoRequest.deleteMany({}),
      Settings.deleteMany({}),
      UserPreference.deleteMany({}),
    ]);

    res.status(200).json({ success: true, message: "All data has been reset" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
