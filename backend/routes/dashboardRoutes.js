const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

router.use(protect);

router.get("/stats", getDashboardStats);

module.exports = router;
