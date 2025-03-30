import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  // Define navbar links based on user role
  const getNavLinks = () => {
    const commonLinks = [{ to: "/tutors", label: "Find Tutors" }];

    if (!currentUser) return commonLinks;

    switch (currentUser.role) {
      case "student":
        return [
          ...commonLinks,
          { to: "/dashboard", label: "Dashboard" },
          { to: "/sessions", label: "My Sessions" },
          { to: "/wishlist", label: "Wishlist" },
        ];
      case "tutor":
        return [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/sessions", label: "My Sessions" },
        ];
      case "admin":
        return [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/verifications", label: "Verifications" },
          { to: "/reports", label: "Reports" },
          { to: "/users", label: "Users" },
        ];
      default:
        return commonLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="header">
      <div className="container">
        <div className="header-wrapper">
          <Link to="/" className="header-logo">
            <span className="logo-text">
              Edu<span className="logo-accent">Connect</span>
            </span>
          </Link>

          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
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
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className={`header-nav-container ${mobileMenuOpen ? "mobile-open" : ""}`}>
            <nav className="header-nav">
              {navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="header-actions">
              {currentUser ? (
                <>
                  <div className="user-info">
                    <Link to="/profile" className="profile-link" onClick={closeMobileMenu}>
                      {currentUser.profilePicture ? (
                        <img
                          src={currentUser.profilePicture}
                          alt={currentUser.name}
                          className="avatar"
                        />
                      ) : (
                        <div className="avatar avatar-placeholder">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="user-name">{currentUser.name}</span>
                    </Link>
                  </div>
                  <button onClick={handleLogout} className="btn btn-outline btn-sm logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link
                    to="/auth/login"
                    className="btn btn-outline btn-sm"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="btn btn-primary btn-sm"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
