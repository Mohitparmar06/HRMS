const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createRequest,
  getRequests,
  getRequestById,
  updateStatus,
  deleteRequest,
  getStats,
} = require("../controllers/demoRequestController");

router.post("/", createRequest);

router.use(protect);

router.get("/", getRequests);
router.get("/stats", getStats);
router.get("/:id", getRequestById);
router.put("/:id", updateStatus);
router.delete("/:id", deleteRequest);

module.exports = router;
