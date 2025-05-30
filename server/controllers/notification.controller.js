import { Notification, Tutor, Session } from "../models/index.js";

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const notificationObj = notification.toObject();

        if (notification.relatedId && notification.onModel) {
          try {
            let relatedItem;

            if (notification.onModel === "Tutor") {
              relatedItem = await Tutor.findById(
                notification.relatedId
              ).populate("userId", "name profilePicture");
            } else if (notification.onModel === "Session") {
              relatedItem = await Session.findById(notification.relatedId)
                .populate("studentId", "name profilePicture")
                .populate({
                  path: "tutorId",
                  populate: {
                    path: "userId",
                    select: "name profilePicture",
                  },
                });
            }

            if (relatedItem) {
              notificationObj.relatedItem = relatedItem;
            }
          } catch (error) {
            console.error(
              `Error populating notification related item: ${error.message}`
            );
          }
        }

        return notificationObj;
      })
    );

    const total = await Notification.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: populatedNotifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};
