const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

router.use(protect);

router.post("/checkin", checkIn);
router.put("/checkout/:id", checkOut);
router.get("/", getAttendance);
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

module.exports = router;
