import { Wishlist } from "../models/index.js";

export const seedWishlists = async (users, tutors) => {
  // Filter student users
  const studentUsers = users.filter((user) => user.role === "student");

  // Create wishlists data
  const wishlistsData = [];

  // For each student, create a wishlist with 1-3 tutors
  for (const student of studentUsers) {
    // Randomly select 1-3 tutors
    const tutorCount = Math.floor(Math.random() * 3) + 1;
    const selectedTutors = [...tutors]
      .sort(() => 0.5 - Math.random()) // Shuffle array
      .slice(0, tutorCount); // Take first n elements

    wishlistsData.push({
      studentId: student._id,
      tutorIds: selectedTutors.map((tutor) => tutor._id),
    });
  }

  // Insert all wishlists into database
  const wishlists = await Wishlist.insertMany(wishlistsData);
  console.log(`${wishlists.length} wishlists created`);

  return wishlists;
};
