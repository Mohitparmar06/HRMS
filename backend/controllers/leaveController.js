const Leave = require("../models/Leave");

// Apply Leave
exports.applyLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);

    res.status(201).json({
      success: true,
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Leaves
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employeeId");

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve Leave
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Leave
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};