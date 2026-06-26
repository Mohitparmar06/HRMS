const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = require("../controllers/notificationController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", adminOnly, createNotification);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read", markAsRead);
router.put("/:id/unread", markAsUnread);
router.delete("/clear-all", clearAll);
router.delete("/:id", deleteNotification);

module.exports = router;
