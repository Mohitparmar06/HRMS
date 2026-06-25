const DemoRequest = require("../models/DemoRequest");

exports.createRequest = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "fullName and email are required",
      });
    }

    const request = await DemoRequest.create(req.body);

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { status, search, sortBy, sortOrder, page, limit } = req.query;

    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      DemoRequest.find(filter).sort(sort).skip(skip).limit(limitNum),
      DemoRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await DemoRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, statusNote } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }

    const allowed = ["Pending", "Approved", "Rejected", "Completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowed.join(", ")}`,
      });
    }

    const request = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        statusNote: statusNote || "",
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await DemoRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    res.status(200).json({ success: true, message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected, completed] = await Promise.all([
      DemoRequest.countDocuments(),
      DemoRequest.countDocuments({ status: "Pending" }),
      DemoRequest.countDocuments({ status: "Approved" }),
      DemoRequest.countDocuments({ status: "Rejected" }),
      DemoRequest.countDocuments({ status: "Completed" }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, pending, approved, rejected, completed },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
