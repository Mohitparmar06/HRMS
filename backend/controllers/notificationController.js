const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { title, type, recipientRole } = req.body;

    if (!title || !type || !recipientRole) {
      return res.status(400).json({
        success: false,
        message: "title, type, and recipientRole are required",
      });
    }

    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { recipientRole, recipientId } = req.query;
    const filter = {};
    if (recipientRole) filter.recipientRole = recipientRole;
    if (recipientId) filter.recipientId = recipientId;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const { recipientRole, recipientId } = req.query;
    const filter = { isRead: false };
    if (recipientRole) filter.recipientRole = recipientRole;
    if (recipientId) filter.recipientId = recipientId;

    const unreadCount = await Notification.countDocuments(filter);
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { recipientRole, recipientId } = req.query;
    const filter = { isRead: false };
    if (recipientRole) filter.recipientRole = recipientRole;
    if (recipientId) filter.recipientId = recipientId;

    await Notification.updateMany(filter, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    const { recipientRole, recipientId } = req.query;
    const filter = {};
    if (recipientRole) filter.recipientRole = recipientRole;
    if (recipientId) filter.recipientId = recipientId;

    const result = await Notification.deleteMany(filter);
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
