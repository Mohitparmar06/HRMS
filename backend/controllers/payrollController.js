const Payroll = require("../models/Payroll");

// Create Payroll
exports.createPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);

    res.status(201).json({
      success: true,
      payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Payrolls
exports.getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate("employeeId");

    res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Payroll
exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    res.status(200).json({
      success: true,
      payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Payroll
exports.deletePayroll = async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Payroll Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};