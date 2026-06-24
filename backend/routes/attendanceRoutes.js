const express = require("express");

const router = express.Router();

const {
  checkIn,
  checkOut,
  getAttendance,
} = require("../controllers/attendanceController");

router.post("/checkin", checkIn);

router.put("/checkout/:id", checkOut);

router.get("/", getAttendance);

module.exports = router;