import React, { useState, useEffect, useContext } from "react";
import { tutorAPI } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";

const TutorProfileForm = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
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

  // Load existing tutor data on mount
  useEffect(() => {
    const loadTutorData = async () => {
      try {
        const response = await tutorAPI.getTutorDetails(currentUser._id);
        if (response.data.success) {
          const tutor = response.data.data;
          setFormData({
            name: tutor.userId.name || "",
            location: tutor.location || "",
            bio: tutor.userId.bio || "",
            profilePicture: tutor.userId.profilePicture || "",
            qualifications: tutor.qualifications || "",
            subjects: tutor.subjects ? tutor.subjects.join(", ") : "",
            hourlyRate: tutor.hourlyRate || "",
            teachingPreference: tutor.teachingPreference || "both",
          });
        }
      } catch (err) {
        console.error("Load tutor data error:", err);
        setError("Could not load tutor data");
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
      const updateData = {
        ...formData,
        subjects: formData.subjects.split(",").map((s) => s.trim()),
      };
      const response = await tutorAPI.updateProfile(
        currentUser._id,
        updateData
      );
      if (response.data.success) {
        // Update auth context with returned user data
        setCurrentUser({ ...currentUser, ...response.data.data.user });
        setMessage("Profile updated successfully");
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error("Tutor profile update error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
        />
      </div>
      <div className="form-control">
        <label htmlFor="bio">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
        ></textarea>
      </div>
      <div className="form-control">
        <label htmlFor="profilePicture">Profile Picture URL</label>
        <input
          name="profilePicture"
          value={formData.profilePicture}
          onChange={handleChange}
        />
      </div>
      <div className="form-control">
        <label htmlFor="qualifications">Qualifications</label>
        <textarea
          name="qualifications"
          value={formData.qualifications}
          onChange={handleChange}
        ></textarea>
      </div>
      <div className="form-control">
        <label htmlFor="subjects">Subjects (comma-separated)</label>
        <input
          name="subjects"
          value={formData.subjects}
          onChange={handleChange}
        />
      </div>
      <div className="form-control">
        <label htmlFor="hourlyRate">Hourly Rate</label>
        <input
          name="hourlyRate"
          type="number"
          value={formData.hourlyRate}
          onChange={handleChange}
        />
      </div>
      <div className="form-control">
        <label htmlFor="teachingPreference">Teaching Preference</label>
        <select
          name="teachingPreference"
          value={formData.teachingPreference}
          onChange={handleChange}
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
