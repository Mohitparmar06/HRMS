const Employee = require("../models/Employee");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { notifyAdmin, notifyEmployee } = require("../services/notificationService");

function generateTempPassword(fullName) {
  const firstName = fullName.split(" ")[0];
  return `${firstName}@123`;
}

exports.createEmployee = async (req, res) => {
  try {
    const { fullName, employeeId, email, department, designation } = req.body;

    if (!fullName || !employeeId || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: "fullName, employeeId, email, department, and designation are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user account with this email already exists",
      });
    }

    const employee = await Employee.create(req.body);

    const tempPassword = generateTempPassword(fullName);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "Employee",
      employeeId,
      department,
      designation,
      phone: req.body.phone || "",
      joiningDate: req.body.joinDate || new Date(),
      firstLogin: true,
      status: "Active",
    });

    await notifyAdmin({
      title: "New Employee Added",
      message: `${employee.fullName} (${employee.employeeId}) has been added to the ${employee.department} department as ${employee.designation}.`,
      type: "Employee Added",
    });

    res.status(201).json({
      success: true,
      employee,
      userAccount: {
        email,
        tempPassword,
        role: "Employee",
        message: `Login credentials created. Employee must change password on first login.`,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (employee.email) {
      await User.findOneAndUpdate(
        { employeeId: employee.employeeId },
        {
          fullName: employee.fullName,
          department: employee.department,
          designation: employee.designation,
          phone: employee.phone || "",
        }
      );
    }

    await notifyAdmin({
      title: "Employee Updated",
      message: `${employee.fullName} (${employee.employeeId}) profile has been updated.`,
      type: "Employee Updated",
    });

    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    await User.findOneAndDelete({ employeeId: employee.employeeId });

    await Employee.findByIdAndDelete(req.params.id);

    await notifyAdmin({
      title: "Employee Deleted",
      message: `${employee.fullName} (${employee.employeeId}) has been removed from the system.`,
      type: "Employee Deleted",
    });

    res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (updated.email) {
      await User.findOneAndUpdate(
        { employeeId: updated.employeeId },
        {
          fullName: updated.fullName,
          department: updated.department,
          designation: updated.designation,
          phone: updated.phone || "",
        }
      );
    }

    await notifyEmployee({
      title: "Profile Updated",
      message: `Your profile has been updated successfully.`,
      type: "Profile Updated",
      employeeId: updated.employeeId,
    });

    await notifyAdmin({
      title: "Profile Updated",
      message: `${updated.fullName} (${updated.employeeId}) has updated their profile.`,
      type: "Profile Updated",
    });

    res.status(200).json({ success: true, employee: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
