import { Review, Tutor } from "../models/index.js";

export const seedReviews = async (users, tutors) => {
  // Filter student users
  const studentUsers = users.filter((user) => user.role === "student");

  // Create reviews data
  const reviewsData = [];

  // Sample review comments based on rating
  const reviewComments = {
    1: [
      "Very disappointed with the session. The tutor was not prepared.",
      "Not helpful at all. Would not recommend.",
    ],
    2: [
      "Below average tutoring experience. Explanations were unclear.",
      "Some concepts were explained well, but overall not what I expected.",
    ],
    3: [
      "Decent tutoring session. Room for improvement in teaching methods.",
      "Average experience. The tutor was knowledgeable but not engaging.",
      "OK session, but needs to provide more practice examples.",
    ],
    4: [
      "Very good tutor! Explained concepts clearly and was patient.",
      "Great session. The tutor was well-prepared and helpful.",
      "I learned a lot in this session. Would book again.",
    ],
    5: [
      "Outstanding tutor! Extremely knowledgeable and made complex topics simple.",
      "Best tutoring experience ever! Highly recommend!",
      "Excellent session. The tutor went above and beyond to help me understand.",
    ],
  };

  // For each student-tutor pair, create 0-3 reviews
  for (const student of studentUsers) {
    for (const tutor of tutors) {
      // Randomly decide if this student will review this tutor
      if (Math.random() > 0.3) {
        // 70% chance to create a review
        // Generate a random rating between 3-5 (most likely positive)
        const rating = Math.floor(Math.random() * 3) + 3;

        // Select a random comment for this rating
        const comments = reviewComments[rating];
        const comment = comments[Math.floor(Math.random() * comments.length)];

        reviewsData.push({
          studentId: student._id,
          tutorId: tutor._id,
          rating,
          comment,
        });
      }
    }
  }

  // Insert all reviews into database
  const reviews = await Review.insertMany(reviewsData);
  console.log(`${reviews.length} reviews created`);

  // Update tutor average ratings
  for (const tutor of tutors) {
    const tutorReviews = reviews.filter(
      (review) => review.tutorId.toString() === tutor._id.toString()
    );

    if (tutorReviews.length > 0) {
      const averageRating =
        tutorReviews.reduce((sum, review) => sum + review.rating, 0) /
        tutorReviews.length;
      await Tutor.findByIdAndUpdate(tutor._id, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviews: tutorReviews.map((review) => review._id),
      });
    }
  }

  return reviews;
};
