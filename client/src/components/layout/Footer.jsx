import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/">EduConnect</Link>
          </div>

          <div className="footer-links">
            <Link to="/about">About Us</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} EduConnect Pakistan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
