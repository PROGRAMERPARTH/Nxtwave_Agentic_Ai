const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

const listNotifications = async ({ userId, read, limit = 20 }) => {
  const query = { owner: userId };
  if (read !== undefined) query.read = read === 'true' || read === true;

  return await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ owner: userId, read: false });
};

const markAsRead = async (userId, notificationId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, owner: userId },
    { read: true },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ owner: userId, read: false }, { read: true });
  return { success: true };
};

const createNotification = async ({ userId, workflowId, executionId, title, message, type = 'info' }) => {
  const notification = await Notification.create({
    owner: userId,
    workflowId,
    executionId,
    title,
    message,
    type,
    read: false,
  });

  // Emit over Socket.IO if connected
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }
  } catch (err) {
    // Socket not ready or not connected; ignore silently
  }

  return notification;
};

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
};
