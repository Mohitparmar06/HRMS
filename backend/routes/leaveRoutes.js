const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  applyLeave,
  getLeaves,
  getLeavesByEmployee,
  approveLeave,
  rejectLeave,
  cancelLeave,
  deleteLeave,
} = require("../controllers/leaveController");

router.use(protect);

router.post("/", applyLeave);
router.get("/", getLeaves);
router.get("/employee/:employeeId", getLeavesByEmployee);
router.put("/approve/:id", approveLeave);
router.put("/reject/:id", rejectLeave);
router.put("/cancel/:id", cancelLeave);
router.delete("/:id", deleteLeave);

module.exports = router;
