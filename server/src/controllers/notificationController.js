const notificationService = require('../services/notificationService');

const list = async (req, res, next) => {
  try {
    const { read, limit } = req.query;
    const notifications = await notificationService.listNotifications({
      userId: req.user.id,
      read,
      limit,
    });
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(req.user.id, id);
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  markRead,
  markAllRead,
};
