const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

exports.createEmployee = async (req, res) => {
  try {
    const { fullName, employeeId, email, department, designation } = req.body;

    if (!fullName || !employeeId || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: "fullName, employeeId, email, department, and designation are required",
      });
    }

    const employee = await Employee.create(req.body);

    await Notification.create({
      title: "New Employee Added",
      message: `${employee.fullName} (${employee.employeeId}) has been added to the ${employee.department} department as ${employee.designation}.`,
      type: "Employee Added",
      recipientRole: "Admin",
      recipientId: null,
      isRead: false,
    });

    res.status(201).json({ success: true, employee });
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

    await Notification.create({
      title: "Employee Updated",
      message: `${employee.fullName} (${employee.employeeId}) profile has been updated.`,
      type: "Employee Updated",
      recipientRole: "Admin",
      recipientId: null,
      isRead: false,
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

    await Employee.findByIdAndDelete(req.params.id);

    await Notification.create({
      title: "Employee Deleted",
      message: `${employee.fullName} (${employee.employeeId}) has been removed from the system.`,
      type: "Employee Deleted",
      recipientRole: "Admin",
      recipientId: null,
      isRead: false,
    });

    res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
