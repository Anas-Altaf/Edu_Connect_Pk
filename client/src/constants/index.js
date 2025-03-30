// Roles
export const ROLES = [
  { value: "student", label: "Student" },
  { value: "tutor", label: "Tutor" },
  { value: "admin", label: "Administrator" },
];

// Routes based on user role
export const APP_ROUTES = {
  PUBLIC: [
    { path: "/", label: "Home" },
    { path: "/tutors", label: "Find Tutors" },
  ],
  STUDENT: [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/tutors", label: "Find Tutors" },
    { path: "/sessions", label: "My Sessions" },
    { path: "/wishlist", label: "Wishlist" },
  ],
  TUTOR: [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/sessions", label: "Sessions" },
    { path: "/profile", label: "My Profile" },
  ],
  ADMIN: [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/verifications", label: "Verifications" },
    { path: "/users", label: "Users" },
    { path: "/reports", label: "Reports" },
  ],
};

// Session status constants
export const SESSION_STATUS = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "confirmed", label: "Confirmed", color: "info" },
  { value: "completed", label: "Completed", color: "success" },
  { value: "canceled", label: "Canceled", color: "danger" },
];

// Teaching preferences
export const TEACHING_PREFERENCES = [
  { value: "online", label: "Online" },
  { value: "in-person", label: "In-Person" },
  { value: "both", label: "Both" },
];

// Notification types
export const NOTIFICATION_TYPES = {
  RATE_CHANGE: "RATE_CHANGE",
  SESSION_REMINDER: "SESSION_REMINDER",
  REVIEW_REQUEST: "REVIEW_REQUEST",
};

// Subjects list
export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Urdu",
  "History",
  "Geography",
  "Economics",
  "Accounting",
  "Statistics",
  "Islamic Studies",
  "Pakistan Studies",
];

// Education levels
export const EDUCATION_LEVELS = [
  "Primary (1-5)",
  "Middle (6-8)",
  "Matric/O-Levels (9-10)",
  "Intermediate/A-Levels (11-12)",
  "Bachelor's",
  "Master's",
  "PhD",
];
