import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/pages.css";
import "./styles/sessions.css";
import "./styles/profile.css"; // Add the profile styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
