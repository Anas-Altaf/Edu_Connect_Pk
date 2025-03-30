import { Session } from "../models/index.js";

export const seedSessions = async (users, tutors) => {
  const studentUsers = users.filter((user) => user.role === "student");

  const sessionsData = [];

  const now = new Date();

  const createSession = (student, tutor, daysOffset, status) => {
    const sessionDate = new Date();
    sessionDate.setDate(now.getDate() + daysOffset);

    const date = new Date(sessionDate.toISOString().split("T")[0]);

    const startHour = Math.floor(Math.random() * 12) + 8;
    const endHour = startHour + 1;
    const timeSlot = `${String(startHour).padStart(2, "0")}:00-${String(
      endHour
    ).padStart(2, "0")}:00`;

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

  for (const student of studentUsers) {
    for (const tutor of tutors) {
      const completedCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < completedCount; i++) {
        sessionsData.push(
          createSession(student, tutor, -(i + 1) * 3, "completed")
        );
      }

      const confirmedCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < confirmedCount; i++) {
        sessionsData.push(createSession(student, tutor, i + 1, "confirmed"));
      }

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

  const result = await Session.collection.insertMany(sessionsData, {
    ordered: true,
  });
  console.log(`${result.insertedCount} sessions created`);

  return await Session.find({});
};
