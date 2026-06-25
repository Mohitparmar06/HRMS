const Payroll = require("../models/Payroll");
const Notification = require("../models/Notification");

function toLocalDateStr(d) {
  if (!d) return null;
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function transformRecord(payroll) {
  const emp = payroll.employeeId;
  const empObj = typeof emp === 'object' ? emp : null;

  return {
    _id: payroll._id,
    id: payroll._id,
    employeeId: empObj?.employeeId || '',
    employeeName: empObj?.fullName || '',
    employeeAvatar: empObj?.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '',
    department: empObj?.department || '',
    position: empObj?.designation || '',
    period: payroll.period,
    periodKey: payroll.periodKey,
    baseSalary: payroll.baseSalary,
    allowances: payroll.allowances,
    hra: payroll.hra,
    transport: payroll.transport,
    medical: payroll.medical,
    specialAllowance: payroll.specialAllowance,
    bonus: payroll.bonus,
    overtimePay: payroll.overtimePay,
    grossSalary: payroll.grossSalary,
    pf: payroll.pf,
    professionalTax: payroll.professionalTax,
    incomeTax: payroll.incomeTax,
    insurance: payroll.insurance,
    otherDeductions: payroll.otherDeductions,
    totalDeductions: payroll.totalDeductions,
    netSalary: payroll.netSalary,
    status: payroll.status,
    paymentDate: toLocalDateStr(payroll.paymentDate),
  };
}

exports.createPayroll = async (req, res) => {
  try {
    const { employeeId, periodKey, period, baseSalary } = req.body;

    if (!employeeId || !periodKey || !period || baseSalary == null) {
      return res.status(400).json({
        success: false,
        message: "employeeId, periodKey, period, and baseSalary are required",
      });
    }

    const existing = await Payroll.findOne({ employeeId, periodKey });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Payroll already exists for this employee in this period",
      });
    }

    const payroll = await Payroll.create(req.body);
    const populated = await Payroll.findById(payroll._id).populate('employeeId');
    const emp = populated.employeeId;

    await Notification.create({
      title: "Payroll Generated",
      message: `Payroll for ${populated.period} has been generated for ${emp?.fullName || 'Employee'}. Net salary: $${populated.netSalary?.toLocaleString()}.`,
      type: "Payroll Generated",
      recipientRole: "Employee",
      recipientId: emp?.employeeId || null,
      isRead: false,
    });

    await Notification.create({
      title: "Payroll Generated",
      message: `Payroll for ${emp?.fullName || 'Employee'} (${emp?.employeeId || ''}) has been generated for ${populated.period}. Net salary: $${populated.netSalary?.toLocaleString()}.`,
      type: "Payroll Generated",
      recipientRole: "Admin",
      recipientId: null,
      isRead: false,
    });

    res.status(201).json({ success: true, payroll: transformRecord(populated) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Payroll already exists for this employee in this period",
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employeeId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payrolls.length, payrolls: payrolls.map(transformRecord) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayrollsByEmployee = async (req, res) => {
  try {
    const Employee = require("../models/Employee");
    const emp = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!emp) {
      return res.status(200).json({ success: true, count: 0, payrolls: [] });
    }

    const payrolls = await Payroll.find({ employeeId: emp._id })
      .populate('employeeId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payrolls.length, payrolls: payrolls.map(transformRecord) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employeeId');
    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll not found" });
    }
    res.status(200).json({ success: true, payroll: transformRecord(payroll) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('employeeId');

    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll not found" });
    }

    if (req.body.status === 'Paid') {
      const emp = payroll.employeeId;
      await Notification.create({
        title: "Payroll Paid",
        message: `Your salary for ${payroll.period} ($${payroll.netSalary?.toLocaleString()}) has been deposited.`,
        type: "Payroll Paid",
        recipientRole: "Employee",
        recipientId: emp?.employeeId || null,
        isRead: false,
      });
    }

    res.status(200).json({ success: true, payroll: transformRecord(payroll) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll not found" });
    }
    res.status(200).json({ success: true, message: "Payroll Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
