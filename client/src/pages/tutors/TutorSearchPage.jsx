import React, { useState, useEffect, useContext } from "react";
import { tutorAPI, wishlistAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import TutorCard from "../../components/tutors/TutorCard";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const TutorSearchPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [filters, setFilters] = useState({
    subject: "",
    minRate: "",
    maxRate: "",
    rating: 0,
    location: "",
    sortBy: "rating",
    availableDay: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset error state when filters or page changes
    setError(null);
    fetchTutors();

    // If the user is a student, fetch their wishlist
    if (currentUser && currentUser.role === "student") {
      fetchWishlist();
    }
  }, [currentUser, currentPage, filters]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await tutorAPI.searchTutors({
        page: currentPage,
        limit: 12,
        ...filters,
      });

      if (response.data.success) {
        setTutors(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError("Failed to fetch tutors");
        toast.error("Failed to fetch tutors");
      }
    } catch (err) {
      console.error("Error fetching tutors:", err);
      setError(
        err.response?.data?.message || "An error occurred while fetching tutors"
      );
      toast.error("An error occurred while fetching tutors");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      if (response.data.success) {
        // Extract tutor IDs from wishlist response
        const tutorIds = response.data.data.tutorIds || [];
        setWishlist(tutorIds);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const handleToggleWishlist = async (tutorId) => {
    if (!currentUser) {
      toast.info("Please log in to add to wishlist");
      return;
    }

    if (currentUser.role !== "student") {
      toast.info("Only students can add tutors to wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.includes(tutorId);

      if (isInWishlist) {
        // Remove from wishlist
        await wishlistAPI.removeTutorFromWishlist(tutorId);
        setWishlist(wishlist.filter((id) => id !== tutorId));
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        await wishlistAPI.addTutorToWishlist(tutorId);
        setWishlist([...wishlist, tutorId]);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist operation error:", err);
      toast.error("Failed to update wishlist");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterClear = () => {
    setFilters({
      subject: "",
      minRate: "",
      maxRate: "",
      rating: 0,
      location: "",
      sortBy: "rating",
      availableDay: "",
    });
    setCurrentPage(1);
  };

  return (
    <div className="tutor-search-page">
      <h1 className="page-title">Find a Tutor</h1>

      <div className="tutor-search-container">
        <div className="filters-sidebar">
          <div className="tutor-filters">
            <div className="filter-header">
              <h2 className="filter-title">Filters</h2>
              <button
                onClick={handleFilterClear}
                className="btn btn-sm btn-outline"
              >
                Clear All
              </button>
            </div>

            <div className="filter-form">
              <div className="filter-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="input"
                  placeholder="e.g. Mathematics"
                  value={filters.subject}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="input"
                  placeholder="e.g. Lahore or online"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label>Hourly Rate (PKR)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="minRate"
                    className="input"
                    placeholder="Min"
                    value={filters.minRate}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="maxRate"
                    className="input"
                    placeholder="Max"
                    value={filters.maxRate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label htmlFor="rating">Rating Threshold</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  className="input"
                  placeholder="Minimum Rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.rating}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="availableDay">Availability</label>
                <select
                  id="availableDay"
                  name="availableDay"
                  className="input"
                  value={filters.availableDay}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select
                  name="sortBy"
                  className="input"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="rating">Rating (High to Low)</option>
                  <option value="priceAsc">Price (Low to High)</option>
                  <option value="priceDesc">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="tutors-content">
          {loading ? (
            <Loader
              size="lg"
              fullWidth
              message="Loading tutors..."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              }
            />
          ) : error ? (
            <EmptyState
              title="Something went wrong"
              message={error}
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              }
              action={
                <button className="btn btn-primary" onClick={fetchTutors}>
                  Try Again
                </button>
              }
            />
          ) : tutors.length === 0 ? (
            <EmptyState
              title="No tutors found"
              message="Try adjusting your filters to find more tutors"
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
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              }
            />
          ) : (
            <>
              <div className="search-results-info">
                <p className="results-count">Showing {tutors.length} tutors</p>
              </div>
              <div className="tutors-grid">
                {tutors.map((tutor) => (
                  <TutorCard
                    key={tutor._id}
                    tutor={tutor}
                    inWishlist={wishlist.includes(tutor._id)}
                    showBookButton={true}
                    onToggleWishlist={currentUser ? handleToggleWishlist : null}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination mt-lg">
                  <button
                    className="btn btn-outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="mx-md">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn btn-outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorSearchPage;
