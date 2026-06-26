const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No Token Provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      firstLogin: user.firstLogin,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin only.",
  });
};

const employeeOnly = (req, res, next) => {
  if (req.user && req.user.role === "Employee") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Employee only.",
  });
};

module.exports = { protect, adminOnly, employeeOnly };
