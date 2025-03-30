import { Wishlist } from "../models/index.js";

export const seedWishlists = async (users, tutors) => {
  const studentUsers = users.filter((user) => user.role === "student");

  const wishlistsData = [];

  for (const student of studentUsers) {
    const tutorCount = Math.floor(Math.random() * 3) + 1;
    const selectedTutors = [...tutors]
      .sort(() => 0.5 - Math.random())
      .slice(0, tutorCount);

    wishlistsData.push({
      studentId: student._id,
      tutorIds: selectedTutors.map((tutor) => tutor._id),
    });
  }

  const wishlists = await Wishlist.insertMany(wishlistsData);
  console.log(`${wishlists.length} wishlists created`);

  return wishlists;
};
