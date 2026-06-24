const express = require("express");

const router = express.Router();

const {
  applyLeave,
  getLeaves,
  approveLeave,
  rejectLeave,
} = require("../controllers/leaveController");

router.post("/", applyLeave);

router.get("/", getLeaves);

router.put("/approve/:id", approveLeave);

router.put("/reject/:id", rejectLeave);

module.exports = router;