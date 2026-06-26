const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { notifyAdmin, notifyEmployee } = require("../services/notificationService");

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, department, designation } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, and password are required",
      });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      department,
      designation,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error during registration",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Contact administrator.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        ...sanitizeUser(user),
        firstLogin: user.firstLogin,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error during login",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Server error" });
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

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

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

    if (user.firstLogin) {
      user.firstLogin = false;
    }

    await user.save();

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
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

exports.forceChangePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "newPassword is required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.firstLogin = false;
    await user.save();

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
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const { employeeId, newPassword } = req.body;

    if (!employeeId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "employeeId and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    let user = await User.findOne({ employeeId }).select("+password");

    if (!user) {
      const Employee = require("../models/Employee");
      const employee = await Employee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      const hashedPass = await bcrypt.hash(newPassword, 10);

      user = await User.create({
        fullName: employee.fullName,
        email: employee.email,
        password: hashedPass,
        role: "Employee",
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        phone: employee.phone || "",
        joiningDate: employee.joinDate || new Date(),
        firstLogin: true,
        status: employee.status || "Active",
      });

      return res.status(200).json({ success: true, message: `User account created and password set for ${employee.fullName}. Employee must change password on next login.` });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.firstLogin = true;
    await user.save();

    await notifyEmployee({
      title: "Password Reset",
      message: `Your password has been reset by an administrator. You must change it on next login.`,
      type: "Password Reset",
      employeeId: employeeId,
    });

    await notifyAdmin({
      title: "Password Reset",
      message: `Password has been reset for ${user.fullName} (${employeeId}).`,
      type: "Password Reset",
    });

    res.status(200).json({ success: true, message: `Password reset for ${user.fullName}. Employee must change password on next login.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

exports.adminGetTempPassword = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required",
      });
    }

    let user = await User.findOne({ employeeId }).select("+password");

    if (!user) {
      const Employee = require("../models/Employee");
      const employee = await Employee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      const firstName = employee.fullName.split(" ")[0];
      const tempPassword = `${firstName}@123`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      user = await User.create({
        fullName: employee.fullName,
        email: employee.email,
        password: hashedPassword,
        role: "Employee",
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        phone: employee.phone || "",
        joiningDate: employee.joinDate || new Date(),
        firstLogin: true,
        status: employee.status || "Active",
      });

      user = await User.findOne({ employeeId }).select("+password");
    }

    const firstName = user.fullName.split(" ")[0];
    const tempPassword = `${firstName}@123`;

    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    user.password = hashedPassword;
    user.firstLogin = true;
    await user.save();

    res.status(200).json({
      success: true,
      tempPassword,
      email: user.email,
      role: user.role,
      status: user.status,
      message: `Password regenerated for ${user.fullName}. Employee must change password on next login.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
