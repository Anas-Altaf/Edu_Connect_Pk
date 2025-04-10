import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const shouldShowFooter = () => {
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
