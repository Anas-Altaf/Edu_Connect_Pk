import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { wishlistAPI } from "../../services/api";
import TutorCard from "../../components/tutors/TutorCard";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";

const WishlistPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [wishlistTutors, setWishlistTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistAPI.getWishlist();
      if (response.data.success) {
        const tutorsData = response.data.data?.tutors || [];
        setWishlistTutors(tutorsData);
      } else {
        toast.error("Failed to load wishlist");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      toast.error("An error occurred while loading wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (tutorId) => {
    try {
      await wishlistAPI.removeTutorFromWishlist(tutorId);
      setWishlistTutors(
        wishlistTutors.filter((tutor) => tutor._id !== tutorId)
      );
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("Wishlist operation error:", err);
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) return <Loader size="lg" fullWidth />;

  if (!currentUser || currentUser.role !== "student") {
    return (
      <div className="wishlist-page">
        <h1 className="page-title">My Wishlist</h1>
        <div className="alert alert-warning">
          Only students can access the wishlist feature.
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="page-title">My Wishlist</h1>

      {wishlistTutors.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="Add tutors to your wishlist to keep track of them"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          }
          action={
            <Link to="/tutors" className="btn btn-primary">
              Browse Tutors
            </Link>
          }
        />
      ) : (
        <div className="tutors-grid">
          {wishlistTutors.map((tutor) => (
            <TutorCard
              key={tutor._id}
              tutor={tutor}
              inWishlist={true}
              showBookButton={true}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
