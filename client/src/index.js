import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import global styles
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/admin.css"; // Add admin styles

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
