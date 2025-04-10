import React, { useState, useEffect, useContext } from "react";
import { tutorAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Loader from "../ui/Loader";

const TutorProfileForm = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    profilePicture: "",
    qualifications: "",
    subjects: "",
    hourlyRate: "",
    teachingPreference: "both",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTutorData = async () => {
      try {
        // Check if user is a tutor
        if (currentUser.role !== "tutor") {
          toast.error("Only tutors can access this profile");
          setError("Access denied: Only tutors can access this profile");
          setLoading(false);
          return;
        }

        const response = await tutorAPI.getTutorByUserId(currentUser._id);
        if (response.data.success) {
          const tutor = response.data.data;

          // If tutor data exists, populate the form
          if (tutor) {
            setFormData({
              name: tutor.userId?.name || currentUser.name || "",
              location: tutor.location || "",
              bio: tutor.userId?.bio || currentUser.bio || "",
              profilePicture:
                tutor.userId?.profilePicture ||
                currentUser.profilePicture ||
                "",
              qualifications: tutor.qualifications || "",
              subjects: tutor.subjects ? tutor.subjects.join(", ") : "",
              hourlyRate: tutor.hourlyRate || "1000",
              teachingPreference: tutor.teachingPreference || "both",
            });
          } else {
            // If no tutor data yet, initialize with user data
            setFormData({
              name: currentUser.name || "",
              location: currentUser.location || "",
              bio: currentUser.bio || "",
              profilePicture: currentUser.profilePicture || "",
              qualifications: "",
              subjects: "",
              hourlyRate: "1000",
              teachingPreference: "both",
            });
          }
        } else {
          toast.error("Failed to load tutor data");
          setError("Could not load tutor data");
        }
      } catch (err) {
        console.error("Load tutor data error:", err);

        // If it's a 404, it means the tutor profile doesn't exist yet
        if (err.response?.status === 404) {
          console.log("No tutor profile found, initializing with user data");
          // Initialize with user data
          setFormData({
            name: currentUser.name || "",
            location: currentUser.location || "",
            bio: currentUser.bio || "",
            profilePicture: currentUser.profilePicture || "",
            qualifications: "",
            subjects: "",
            hourlyRate: "1000",
            teachingPreference: "both",
          });
        } else {
          toast.error("An error occurred while loading tutor data");
          setError(
            "Could not load tutor data: " +
              (err.response?.data?.message || err.message)
          );
        }
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) loadTutorData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      // Validate required fields
      if (!formData.qualifications || formData.qualifications.length < 10) {
        setError("Qualifications must be at least 10 characters long");
        toast.error("Qualifications must be at least 10 characters long");
        setSubmitting(false);
        return;
      }

      if (!formData.subjects) {
        setError("At least one subject is required");
        toast.error("At least one subject is required");
        setSubmitting(false);
        return;
      }

      if (!formData.hourlyRate || formData.hourlyRate < 5) {
        setError("Hourly rate must be at least 5 Rs.");
        toast.error("Hourly rate must be at least 5 Rs.");
        setSubmitting(false);
        return;
      }

      // Validate location if teaching preference is not online
      if (formData.teachingPreference !== "online" && !formData.location) {
        setError(
          "Location is required for in-person or both teaching preferences"
        );
        toast.error(
          "Location is required for in-person or both teaching preferences"
        );
        setSubmitting(false);
        return;
      }

      // Prepare data for submission
      const updateData = {
        ...formData,
        subjects: formData.subjects.split(",").map((s) => s.trim()),
        hourlyRate: Number(formData.hourlyRate),
      };

      const response = await tutorAPI.updateProfile(
        currentUser._id,
        updateData
      );
      if (response.data.success) {
        // Update the current user in context
        updateCurrentUser({ ...currentUser, ...response.data.data.user });

        // Show success message
        toast.success("Profile updated successfully!");
        setMessage("Profile updated successfully");

        // Scroll to top to show the success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(response.data.message || "Failed to update profile");
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Tutor profile update error:", err);

      // Handle validation errors from the server
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (err.response?.status === 403) {
        setError("You don't have permission to update this profile");
        toast.error("You don't have permission to update this profile");
      } else {
        setError("An error occurred. Please try again.");
        toast.error("An error occurred while updating profile");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader size="md" />;
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-control">
        <label htmlFor="name">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-control">
        <label htmlFor="location">Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="input"
          required={formData.teachingPreference !== "online"}
        />
      </div>
      <div className="form-control">
        <label htmlFor="bio">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="input"
          rows="4"
        ></textarea>
      </div>
      <div className="form-control">
        <label htmlFor="profilePicture">Profile Picture URL</label>
        <input
          name="profilePicture"
          value={formData.profilePicture}
          onChange={handleChange}
          className="input"
          type="url"
          placeholder="https://example.com/your-image.jpg"
        />
        {formData.profilePicture && (
          <div className="profile-image-preview">
            <img
              src={formData.profilePicture}
              alt="Profile Preview"
              className="preview-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/150?text=Invalid+Image";
              }}
            />
          </div>
        )}
      </div>
      <div className="form-control">
        <label htmlFor="qualifications">Qualifications</label>
        <textarea
          name="qualifications"
          value={formData.qualifications}
          onChange={handleChange}
          className="input"
          rows="4"
          required
          minLength="10"
          placeholder="Describe your educational background and teaching experience"
        ></textarea>
      </div>
      <div className="form-control">
        <label htmlFor="subjects">Subjects (comma-separated)</label>
        <input
          name="subjects"
          value={formData.subjects}
          onChange={handleChange}
          className="input"
          required
          placeholder="Math, Physics, Chemistry"
        />
      </div>
      <div className="form-control">
        <label htmlFor="hourlyRate">Hourly Rate (Rs.)</label>
        <input
          name="hourlyRate"
          type="number"
          value={formData.hourlyRate}
          onChange={handleChange}
          className="input"
          required
          min="5"
          max="10000"
          placeholder="Enter your hourly rate in Rupees"
        />
      </div>
      <div className="form-control">
        <label htmlFor="teachingPreference">Teaching Preference</label>
        <select
          name="teachingPreference"
          value={formData.teachingPreference}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="online">Online</option>
          <option value="in-person">In-Person</option>
          <option value="both">Both</option>
        </select>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
};

export default TutorProfileForm;
