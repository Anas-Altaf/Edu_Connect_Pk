import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  // Effect to scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Determine if the footer should be shown
  const shouldShowFooter = () => {
    // Hide footer on auth pages
    return !location.pathname.startsWith("/auth/");
  };

  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      {shouldShowFooter() && <Footer />}
    </>
  );
};

export default Layout;
