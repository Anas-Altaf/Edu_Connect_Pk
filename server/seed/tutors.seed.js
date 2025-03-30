import { Tutor } from "../models/index.js";

export const seedTutors = async (users) => {
  // Filter out tutor users
  const tutorUsers = users.filter((user) => user.role === "tutor");

  // Create tutor profiles data
  const tutorsData = tutorUsers.map((user) => {
    let subjects, hourlyRate, qualifications;

    // Different data based on tutor name to provide variety
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
      averageRating: (Math.random() * 2 + 3).toFixed(1), // Random between 3-5
      earnings: Math.floor(Math.random() * 50000),
    };
  });

  // Insert all tutor profiles into database
  const tutors = await Tutor.insertMany(tutorsData);
  console.log(`${tutors.length} tutor profiles created`);

  return tutors;
};

// Helper function to generate random weekly availability
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

  // Generate 3-5 available slots per week
  for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
    const day = days[Math.floor(Math.random() * days.length)];

    // Generate a time slot
    const startHour = Math.floor(Math.random() * 12) + 9; // Between 9 AM and 8 PM
    const endHour = Math.min(startHour + 1 + Math.floor(Math.random() * 3), 22); // 1-3 hours long, end by 10 PM

    const startTime = `${String(startHour).padStart(2, "0")}:00`;
    const endTime = `${String(endHour).padStart(2, "0")}:00`;

    // Only add if not already added for this day
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
