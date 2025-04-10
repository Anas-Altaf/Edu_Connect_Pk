import { Notification, Session } from "../models/index.js";

export const seedNotifications = async (users, tutors) => {
  const allUsers = [...users];

  const sessions = await Session.find({}).limit(10);

  const notificationTypes = {
    RATE_CHANGE: [
      "Tutor {tutorName} has updated their hourly rate.",
      "The hourly rate for {tutorName} has been changed.",
    ],
    SESSION_REMINDER: [
      "Reminder: Your session is scheduled for tomorrow.",
      "Don't forget your upcoming session!",
    ],
    REVIEW_REQUEST: [
      "Please review your recent session with {tutorName}.",
      "Share your feedback about your session with {tutorName}.",
    ],
  };

  const notificationsData = [];

  for (const user of allUsers) {
    const notificationCount = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < notificationCount; i++) {
      const typesArray = ["RATE_CHANGE", "SESSION_REMINDER", "REVIEW_REQUEST"];
      const type = typesArray[Math.floor(Math.random() * typesArray.length)];

      const session = sessions[Math.floor(Math.random() * sessions.length)];

      const tutor = tutors[Math.floor(Math.random() * tutors.length)];
      const tutorUser = users.find(
        (u) => u._id.toString() === tutor.userId.toString()
      );
      const tutorName = tutorUser ? tutorUser.name : "your tutor";

      let message;
      let relatedId;
      let onModel;

      if (type === "RATE_CHANGE") {
        const templates = notificationTypes.RATE_CHANGE;
        message = templates[
          Math.floor(Math.random() * templates.length)
        ].replace("{tutorName}", tutorName);
        relatedId = tutor._id;
        onModel = "Tutor";
      } else if (type === "SESSION_REMINDER") {
        const templates = notificationTypes.SESSION_REMINDER;
        message = templates[Math.floor(Math.random() * templates.length)];
        relatedId = session._id;
        onModel = "Session";
      } else if (type === "REVIEW_REQUEST") {
        const templates = notificationTypes.REVIEW_REQUEST;
        message = templates[
          Math.floor(Math.random() * templates.length)
        ].replace("{tutorName}", tutorName);
        relatedId = session._id;
        onModel = "Session";
      }

      if (message && relatedId && onModel) {
        notificationsData.push({
          userId: user._id,
          type,
          message,
          relatedId,
          onModel,
          isRead: Math.random() > 0.7,
        });
      }
    }
  }

  const notifications = await Notification.insertMany(notificationsData);
  console.log(`${notifications.length} notifications created`);

  return notifications;
};
