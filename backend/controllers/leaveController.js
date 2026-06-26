const Leave = require("../models/Leave");
const { notifyAdmin, notifyEmployee } = require("../services/notificationService");

function toLocalDateStr(d) {
  if (!d) return null;
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function transformRecord(leave) {
  const emp = leave.employeeId;
  const empObj = typeof emp === 'object' ? emp : null;

  return {
    _id: leave._id,
    id: leave._id,
    employeeId: empObj?.employeeId || '',
    employeeName: empObj?.fullName || '',
    employeeAvatar: empObj?.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '',
    department: empObj?.department || '',
    leaveType: leave.leaveType,
    startDate: toLocalDateStr(leave.startDate),
    endDate: toLocalDateStr(leave.endDate),
    duration: leave.duration,
    reason: leave.reason,
    status: leave.status,
    appliedDate: toLocalDateStr(leave.appliedDate),
    approvedDate: toLocalDateStr(leave.approvedDate),
    approvedBy: leave.approvedBy,
    rejectedBy: leave.rejectedBy,
    rejectionReason: leave.rejectionReason,
  };
}

exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "employeeId, leaveType, startDate, and endDate are required",
      });
    }

    const leave = await Leave.create(req.body);
    const populated = await Leave.findById(leave._id).populate('employeeId');
    const emp = populated.employeeId;

    await notifyAdmin({
      title: "Leave Applied",
      message: `${emp?.fullName || 'Employee'} (${emp?.employeeId || ''}) has applied for ${populated.leaveType} from ${toLocalDateStr(populated.startDate)} to ${toLocalDateStr(populated.endDate)} (${populated.duration} days).`,
      type: "Leave Applied",
    });

    res.status(201).json({ success: true, leave: transformRecord(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employeeId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, leaves: leaves.map(transformRecord) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeavesByEmployee = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId })
      .populate('employeeId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, leaves: leaves.map(transformRecord) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        approvedDate: new Date(),
        approvedBy: req.body.approvedBy || "Admin",
      },
      { new: true }
    ).populate('employeeId');

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    const emp = leave.employeeId;

    await notifyEmployee({
      title: "Leave Approved",
      message: `Your ${leave.leaveType} request for ${toLocalDateStr(leave.startDate)} to ${toLocalDateStr(leave.endDate)} (${leave.duration} days) has been approved.`,
      type: "Leave Approved",
      employeeId: emp?.employeeId || null,
    });

    res.status(200).json({ success: true, leave: transformRecord(leave) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        approvedDate: new Date(),
        rejectedBy: req.body.rejectedBy || "Admin",
        rejectionReason: req.body.rejectionReason || "",
      },
      { new: true }
    ).populate('employeeId');

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    const emp = leave.employeeId;

    await notifyEmployee({
      title: "Leave Rejected",
      message: `Your ${leave.leaveType} request for ${toLocalDateStr(leave.startDate)} to ${toLocalDateStr(leave.endDate)} has been rejected. ${leave.rejectionReason ? 'Reason: ' + leave.rejectionReason : ''}`,
      type: "Leave Rejected",
      employeeId: emp?.employeeId || null,
    });

    res.status(200).json({ success: true, leave: transformRecord(leave) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    ).populate('employeeId');

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    res.status(200).json({ success: true, leave: transformRecord(leave) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }
    res.status(200).json({ success: true, message: "Leave deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
