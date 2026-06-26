const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/checkin", checkIn);
router.put("/checkout/:id", checkOut);
router.get("/", getAttendance);
router.put("/:id", adminOnly, updateAttendance);
router.delete("/:id", adminOnly, deleteAttendance);

module.exports = router;
