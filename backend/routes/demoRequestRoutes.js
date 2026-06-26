const express = require("express");
const router = express.Router();

const {
  createRequest,
  getRequests,
  getRequestById,
  updateStatus,
  deleteRequest,
  getStats,
} = require("../controllers/demoRequestController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", createRequest);

router.use(protect);

router.get("/", getRequests);
router.get("/stats", getStats);
router.get("/:id", getRequestById);
router.put("/:id", adminOnly, updateStatus);
router.delete("/:id", adminOnly, deleteRequest);

module.exports = router;
