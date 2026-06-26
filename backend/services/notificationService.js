const Notification = require("../models/Notification");

async function createNotification({ title, message, type, recipientRole, recipientId = null }) {
  try {
    return await Notification.create({
      title,
      message,
      type,
      recipientRole,
      recipientId,
      isRead: false,
    });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
    return null;
  }
}

async function notifyAdmin({ title, message, type }) {
  return createNotification({ title, message, type, recipientRole: "Admin", recipientId: null });
}

async function notifyEmployee({ title, message, type, employeeId }) {
  return createNotification({ title, message, type, recipientRole: "Employee", recipientId: employeeId || null });
}

async function notifyBoth({ title, message, type, employeeId }) {
  const adminNotif = createNotification({ title, message, type, recipientRole: "Admin", recipientId: null });
  const empNotif = createNotification({ title, message, type, recipientRole: "Employee", recipientId: employeeId || null });
  return Promise.all([adminNotif, empNotif]);
}

module.exports = { createNotification, notifyAdmin, notifyEmployee, notifyBoth };
