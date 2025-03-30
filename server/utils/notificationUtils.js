import { Notification } from "../models/index.js";

/**
 * Create notifications for rate changes
 * @param {Object} tutor - Tutor object
 * @param {Object} user - User object (tutor's user data)
 * @param {Number} previousRate - Previous hourly rate
 * @param {Number} newRate - New hourly rate
 * @param {Array} wishlists - Array of wishlist documents
 * @returns {Promise} - Promise that resolves with created notifications
 */
export const createRateChangeNotifications = async (
  tutor,
  user,
  previousRate,
  newRate,
  wishlists
) => {
  try {
    const notifications = wishlists.map((wishlist) => ({
      userId: wishlist.studentId,
      type: "RATE_CHANGE",
      message: `${user.name} has lowered their hourly rate from ${previousRate} to ${newRate}!`,
      relatedId: tutor._id,
      onModel: "Tutor",
    }));

    if (notifications.length > 0) {
      return await Notification.insertMany(notifications);
    }

    return [];
  } catch (error) {
    console.error("Error creating rate change notifications:", error);
    throw error;
  }
};

/**
 * Create a session reminder notification
 * @param {String} userId - User ID to notify
 * @param {Object} session - Session object
 * @param {String} partnerName - Name of the other party (tutor/student)
 * @returns {Promise} - Promise that resolves with created notification
 */
export const createSessionReminderNotification = async (
  userId,
  session,
  partnerName
) => {
  try {
    const notification = await Notification.create({
      userId,
      type: "SESSION_REMINDER",
      message: `Reminder: Your session with ${partnerName} is scheduled for ${new Date(
        session.date
      ).toLocaleDateString()} at ${session.timeSlot.split("-")[0]}`,
      relatedId: session._id,
      onModel: "Session",
    });

    return notification;
  } catch (error) {
    console.error("Error creating session reminder notification:", error);
    throw error;
  }
};

/**
 * Create a review request notification
 * @param {String} tutorUserId - Tutor's user ID
 * @param {String} studentName - Student's name
 * @param {String} sessionId - Session ID
 * @returns {Promise} - Promise that resolves with created notification
 */
export const createReviewRequestNotification = async (
  tutorUserId,
  studentName,
  sessionId
) => {
  try {
    const notification = await Notification.create({
      userId: tutorUserId,
      type: "REVIEW_REQUEST",
      message: `${studentName} is requesting your feedback on your recent session`,
      relatedId: sessionId,
      onModel: "Session",
    });

    return notification;
  } catch (error) {
    console.error("Error creating review request notification:", error);
    throw error;
  }
};
