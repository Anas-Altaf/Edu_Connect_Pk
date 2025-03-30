import { Session } from "../models/index.js";

export const seedSessions = async (users, tutors) => {
  // Filter student and tutor users
  const studentUsers = users.filter((user) => user.role === "student");

  // Create sessions data
  const sessionsData = [];

  // Current date for reference
  const now = new Date();

  // Helper for creating a session
  const createSession = (student, tutor, daysOffset, status) => {
    const sessionDate = new Date();
    sessionDate.setDate(now.getDate() + daysOffset);

    // Format the date as a proper Date object that MongoDB can handle
    const date = new Date(sessionDate.toISOString().split("T")[0]);

    // Generate a random time slot
    const startHour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
    const endHour = startHour + 1; // 1-hour session
    const timeSlot = `${String(startHour).padStart(2, "0")}:00-${String(
      endHour
    ).padStart(2, "0")}:00`;

    // Determine if payment is completed based on status
    const paymentStatus = status === "completed" ? "completed" : "pending";

    return {
      studentId: student._id,
      tutorId: tutor._id,
      date,
      timeSlot,
      type: Math.random() > 0.5 ? "online" : "in-person",
      status,
      amount: tutor.hourlyRate,
      paymentStatus,
      isApproved: status !== "pending",
    };
  };

  // Generate various sessions for each student
  for (const student of studentUsers) {
    for (const tutor of tutors) {
      // Past completed sessions (2-5 per tutor-student pair)
      const completedCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < completedCount; i++) {
        sessionsData.push(
          createSession(student, tutor, -(i + 1) * 3, "completed")
        );
      }

      // Upcoming confirmed sessions (0-2 per tutor-student pair)
      const confirmedCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < confirmedCount; i++) {
        sessionsData.push(createSession(student, tutor, i + 1, "confirmed"));
      }

      // Pending sessions (0-1 per tutor-student pair)
      if (Math.random() > 0.5) {
        sessionsData.push(
          createSession(
            student,
            tutor,
            Math.floor(Math.random() * 7) + 1,
            "pending"
          )
        );
      }

      // Canceled sessions (0-1 per tutor-student pair)
      if (Math.random() > 0.7) {
        sessionsData.push(
          createSession(
            student,
            tutor,
            -(Math.floor(Math.random() * 10) + 1),
            "canceled"
          )
        );
      }
    }
  }

  // Use a different approach with direct MongoDB insert to bypass Mongoose validation
  const result = await Session.collection.insertMany(sessionsData, {
    ordered: true,
  });
  console.log(`${result.insertedCount} sessions created`);

  return await Session.find({});
};
