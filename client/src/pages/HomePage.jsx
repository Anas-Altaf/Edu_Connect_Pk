import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Connect with Expert Tutors in Pakistan</h1>
          <p className="hero-subtitle">
            Find the perfect tutor to help you reach your educational goals,
            online or in-person.
          </p>
          <div className="hero-buttons">
            <Link to="/tutors" className="btn btn-primary">
              Find a Tutor
            </Link>
            <Link to="/auth/register" className="btn btn-outline">
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose EduConnect</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-verified"></i>
              </div>
              <h3 className="feature-title">Verified Tutors</h3>
              <p className="feature-description">
                All tutors are verified for their qualifications and expertise.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-flexible"></i>
              </div>
              <h3 className="feature-title">Flexible Sessions</h3>
              <p className="feature-description">
                Choose between online or in-person sessions based on your needs.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-affordable"></i>
              </div>
              <h3 className="feature-title">Affordable Rates</h3>
              <p className="feature-description">
                Find tutors within your budget with transparent pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="subjects-section">
        <div className="section-container">
          <h2 className="section-title">Popular Subjects</h2>
          <div className="subjects-grid">
            <div className="subject-card">Mathematics</div>
            <div className="subject-card">Physics</div>
            <div className="subject-card">Chemistry</div>
            <div className="subject-card">Biology</div>
            <div className="subject-card">English</div>
            <div className="subject-card">Computer Science</div>
            <div className="subject-card">Urdu</div>
            <div className="subject-card">Islamiyat</div>
          </div>
          <div className="section-action mt-lg">
            <Link to="/tutors" className="btn btn-primary">
              Browse All Subjects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
