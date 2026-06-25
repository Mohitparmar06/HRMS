const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = require("../controllers/notificationController");

router.use(protect);

router.post("/", createNotification);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id", markAsRead);
router.delete("/clear-all", clearAll);
router.delete("/:id", deleteNotification);

module.exports = router;
