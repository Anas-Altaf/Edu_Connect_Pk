import { Tutor } from "../models/index.js";

export const seedTutors = async (users) => {
  const tutorUsers = users.filter((user) => user.role === "tutor");

  const tutorsData = tutorUsers.map((user) => {
    let subjects, hourlyRate, qualifications;

    switch (user.name) {
      case "Dr. Imran Ahmad":
        subjects = ["Mathematics", "Calculus", "Algebra"];
        hourlyRate = 2500;
        qualifications =
          "PhD in Applied Mathematics from LUMS. Professor at Punjab University with 10+ years of teaching experience.";
        break;
      case "Sara Qureshi":
        subjects = ["English", "Literature", "ESL"];
        hourlyRate = 1800;
        qualifications =
          "Masters in English Literature from Karachi University. Certified TEFL instructor with 5 years of teaching experience.";
        break;
      case "Omar Hassan":
        subjects = ["Computer Science", "Programming", "Web Development"];
        hourlyRate = 2000;
        qualifications =
          "BS in Computer Science from FAST University. Full-stack developer with expertise in JavaScript, Python and database design.";
        break;
      case "Ayesha Khan":
        subjects = ["Physics", "Chemistry", "Science"];
        hourlyRate = 1500;
        qualifications =
          "MSc in Physics from Peshawar University. High school science teacher with experience in preparing students for entry tests.";
        break;
      default:
        subjects = ["General Studies"];
        hourlyRate = 1000;
        qualifications = "Bachelor's degree with teaching experience.";
    }

    return {
      userId: user._id,
      subjects,
      hourlyRate,
      qualifications,
      teachingPreference: ["online", "in-person", "both"][
        Math.floor(Math.random() * 3)
      ],
      location: user.location,
      availability: generateAvailability(),
      isVerified: true,
      averageRating: (Math.random() * 2 + 3).toFixed(1),
      earnings: Math.floor(Math.random() * 50000),
    };
  });

  const tutors = await Tutor.insertMany(tutorsData);
  console.log(`${tutors.length} tutor profiles created`);

  return tutors;
};

function generateAvailability() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const availability = [];

  for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
    const day = days[Math.floor(Math.random() * days.length)];

    const startHour = Math.floor(Math.random() * 12) + 9;
    const endHour = Math.min(startHour + 1 + Math.floor(Math.random() * 3), 22);

    const startTime = `${String(startHour).padStart(2, "0")}:00`;
    const endTime = `${String(endHour).padStart(2, "0")}:00`;

    if (!availability.find((slot) => slot.day === day)) {
      availability.push({
        day,
        startTime,
        endTime,
      });
    }
  }

  return availability;
}
