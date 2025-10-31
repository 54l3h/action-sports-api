import asyncHandler from "express-async-handler";
import Message from "../../models/message.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Create a guest message
 * POST /api/messages
 * public (no auth)
 */
export const createGuestMessage = asyncHandler(async (req, res, next) => {
  const { name, email, topic, message } = req.body;

  if (!name || !email || !topic || !message) {
    throw new AppError(
      "All fields (name, email, topic, message) are required",
      400
    );
  }

  const created = await Message.create({ name, email, topic, message });

  return res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: created,
  });
});

/**
 * @description Get all messages (admin) with pagination and optional filter (isWatched)
 * @route GET /api/messages
 * @access Admin
 */
export const getAllMessages = asyncHandler(async (req, res, next) => {
  const filter = {};

  // Handle isWatched query (accepts "true" or "false")
  if (req.query.isWatched === "true") {
    filter.isWatched = true;
  } else if (req.query.isWatched === "false") {
    filter.isWatched = false;
  }

  // Pagination setup
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 20, 1);
  const skip = (page - 1) * limit;

  // Count total messages
  const total = await Message.countDocuments(filter);

  // Retrieve paginated data
  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    count: messages.length,
    data: messages,
  });
});

/**
 * Mark message as watched (admin)
 * PATCH /api/messages/:id/watch
 * admin only
 */
export const markMessageWatched = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const message = await Message.findById(id);
  if (!message) {
    throw new AppError("Message not found", 404);
  }

  if (message.isWatched) {
    throw new AppError("This message has already been marked as watched", 400);
  }

  message.isWatched = true;
  message.watchedAt = Date.now();
  message.watchedBy = adminId;

  await message.save();

  return res.status(200).json({
    success: true,
    message: "Message marked as watched",
    data: message,
  });
});
