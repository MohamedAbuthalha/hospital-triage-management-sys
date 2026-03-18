const Message = require("../models/Message");
const User = require("../models/User");

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ success: false, message: "receiverId and message are required" });
    }
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }
    const msg = await Message.create({ senderId: req.user._id, receiverId, message });
    return res.status(201).json({ success: true, data: msg });
  } catch (err) {
    return next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetId = userId || req.user._id;
    const messages = await Message.find({ receiverId: targetId })
      .populate("senderId", "name role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (err) {
    return next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await Message.updateMany({ receiverId: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    return next(err);
  }
};
