const express = require("express");
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

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", applyLeave);
router.get("/", getLeaves);
router.get("/employee/:employeeId", getLeavesByEmployee);
router.put("/approve/:id", adminOnly, approveLeave);
router.put("/reject/:id", adminOnly, rejectLeave);
router.put("/cancel/:id", cancelLeave);
router.delete("/:id", adminOnly, deleteLeave);

module.exports = router;
