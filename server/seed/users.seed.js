import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

export const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Password123", salt);

  const usersData = [
    {
      role: "admin",
      name: "Admin User",
      email: "admin@educonnect.pk",
      password: hashedPassword,
      location: "Islamabad",
      bio: "Platform administrator managing the EDUConnect Pakistan service.",
      profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      role: "student",
      name: "Fatima Khan",
      email: "fatima@example.com",
      password: hashedPassword,
      location: "Lahore",
      bio: "University student looking for help with calculus and physics.",
      profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      role: "student",
      name: "Ahmed Ali",
      email: "ahmed@example.com",
      password: hashedPassword,
      location: "Karachi",
      bio: "High school student preparing for entrance exams.",
      profilePicture: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      role: "student",
      name: "Zainab Malik",
      email: "zainab@example.com",
      password: hashedPassword,
      location: "Islamabad",
      bio: "College student studying computer science.",
      profilePicture: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    {
      role: "tutor",
      name: "Dr. Imran Ahmad",
      email: "imran@example.com",
      password: hashedPassword,
      location: "Lahore",
      bio: "PhD in Mathematics with 10+ years teaching experience.",
      profilePicture: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    {
      role: "tutor",
      name: "Sara Qureshi",
      email: "sara@example.com",
      password: hashedPassword,
      location: "Karachi",
      bio: "English language specialist with expertise in literature and composition.",
      profilePicture: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    {
      role: "tutor",
      name: "Omar Hassan",
      email: "omar@example.com",
      password: hashedPassword,
      location: "Islamabad",
      bio: "Computer Science graduate specializing in programming and data structures.",
      profilePicture: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    {
      role: "tutor",
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      password: hashedPassword,
      location: "Peshawar",
      bio: "Physics teacher with experience preparing students for competitive exams.",
      profilePicture: "https://randomuser.me/api/portraits/women/8.jpg",
    },
  ];

  const users = await User.insertMany(usersData);
  console.log(`${users.length} users created`);

  return users;
};
