import axios from "axios";

// Set baseURL for all requests - ensure this points to your running backend
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5500";

// Request interceptor to add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - add more detailed logging
axios.interceptors.response.use(
  (response) => {
    console.log(
      "API response:",
      response.config.url,
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      "API error:",
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    // Remove forced reload on unauthorized errors.
    if (error.response?.status === 401 && !error.config._retry) {
      localStorage.removeItem("token");
      // Instead of reloading the page:
      // window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

// Auth API - ensure method names match what you actually use in components
export const authAPI = {
  login: (email, password, role) =>
    axios.post("/api/v1/auth/sign-in", { email, password, role }),
  register: (name, email, password, role) =>
    axios.post("/api/v1/auth/sign-up", { name, email, password, role }),
  logout: () => axios.post("/api/v1/auth/sign-out"),
  getUser: () => axios.get("/api/v1/auth/me"),
  forgotPassword: (email) =>
    axios.post("/api/v1/auth/forgot-password", { email }),
};

// User API
export const userAPI = {
  getProfile: () => axios.get("/api/v1/users/profile"),
  updateProfile: (data) => axios.put("/api/v1/users/profile", data),
  changePassword: (currentPassword, newPassword) =>
    axios.put("/api/v1/users/password", { currentPassword, newPassword }),
  deleteAccount: () => axios.delete("/api/v1/users"),

  // Admin user management endpoints
  getAllUsers: (params) => axios.get("/api/v1/admin/users", { params }),
  updateUserStatus: (userId, status) =>
    axios.put(`/api/v1/admin/users/${userId}/status`, { status }),
  deleteUserAccount: (userId) => axios.delete(`/api/v1/admin/users/${userId}`),
};

// Tutor API
export const tutorAPI = {
  getAllTutors: (filters) => axios.get("/api/v1/tutors", { params: filters }),
  getTutorDetails: (id) => axios.get(`/api/v1/tutors/${id}`),
  getTutorPreview: (id) => axios.get(`/api/v1/tutors/${id}/preview`),
  updateProfile: (id, data) => axios.put(`/api/v1/tutors/${id}`, data),
  updateAvailability: (id, availability) =>
    axios.put(`/api/v1/tutors/${id}/availability`, { availability }),
  updateRate: (id, hourlyRate) =>
    axios.put(`/api/v1/tutors/${id}/rate`, { hourlyRate }),
  deleteProfile: (id) => axios.delete(`/api/v1/tutors/${id}`),
  updateProfileImage: (id, profilePicture) =>
    axios.post(`/api/v1/tutors/${id}/profile-image`, { profilePicture }),
  searchTutors: async (filters) => {
    // Convert filters to query string parameters
    const queryParams = new URLSearchParams();

    if (filters.subject) queryParams.append("subject", filters.subject);
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.minRate) queryParams.append("minRate", filters.minRate);
    if (filters.maxRate) queryParams.append("maxRate", filters.maxRate);
    if (filters.rating && filters.rating > 0)
      queryParams.append("rating", filters.rating);
    if (filters.availableDay) queryParams.append("day", filters.availableDay);
    if (filters.sortBy) {
      // Convert frontend sort params to backend sort params
      let sort = "";
      switch (filters.sortBy) {
        case "rating":
          sort = "-averageRating"; // Descending order
          break;
        case "priceAsc":
          sort = "hourlyRate"; // Ascending order
          break;
        case "priceDesc":
          sort = "-hourlyRate"; // Descending order
          break;
        default:
          sort = "-averageRating";
      }
      queryParams.append("sortBy", sort);
    }

    queryParams.append("page", filters.page || 1);
    queryParams.append("limit", filters.limit || 12);

    return axios.get(`/api/v1/tutors?${queryParams.toString()}`);
  },
};

// Session API
export const sessionAPI = {
  bookSession: (data) => axios.post("/api/v1/sessions", data),
  getSessionDetails: (id) => axios.get(`/api/v1/sessions/${id}`),
  getStudentSessions: (filters) => {
    console.log("Calling getStudentSessions with filters:", filters);
    return axios.get("/api/v1/sessions/student", { params: filters });
  },
  getTutorSessions: (filters) => {
    console.log("Calling getTutorSessions with filters:", filters);
    return axios.get("/api/v1/sessions/tutor", { params: filters });
  },
  updateSession: (id, data) => axios.put(`/api/v1/sessions/${id}`, data),
  cancelSession: (id) => axios.delete(`/api/v1/sessions/${id}`),
  approveSession: (id, isApproved) =>
    axios.put(`/api/v1/sessions/${id}/approval`, { isApproved }),
  completeSession: (id) => axios.put(`/api/v1/sessions/${id}/complete`),
  getEarningsSummary: () => axios.get(`/api/v1/sessions/tutor/earnings`),
  checkAvailability: (tutorId, date, timeSlot) => {
    // Ensure date is in the correct format (YYYY-MM-DD)
    let formattedDate = date;
    if (date instanceof Date) {
      formattedDate = date.toISOString().split("T")[0];
    }

    // Ensure timeSlot is properly formatted (HH:MM-HH:MM)
    let formattedTimeSlot = timeSlot;
    if (timeSlot && timeSlot.includes("-")) {
      const [start, end] = timeSlot.split("-");
      const formatTime = (t) => {
        if (/^\d{2}:\d{2}$/.test(t)) return t;
        return t.padStart(2, "0") + ":00";
      };
      formattedTimeSlot = `${formatTime(start)}-${formatTime(end)}`;
    }

    return axios.get("/api/v1/sessions/availability", {
      params: {
        tutorId,
        date: formattedDate,
        timeSlot: formattedTimeSlot,
      },
    });
  },
  getCalendarSessions: (startDate, endDate) =>
    axios.get("/api/v1/sessions/calendar", { params: { startDate, endDate } }),
  getSessionStats: () => axios.get("/api/v1/sessions/stats"),
};

// Review API
export const reviewAPI = {
  addReview: (tutorId, rating, comment) =>
    axios.post("/api/v1/reviews", { tutorId, rating, comment }),
  getTutorReviews: (id) => axios.get(`/api/v1/reviews/tutor/${id}`),
  deleteReview: (id) => axios.delete(`/api/v1/reviews/${id}`),
};

// Wishlist API
export const wishlistAPI = {
  addTutorToWishlist: (tutorId) => axios.post("/api/v1/wishlist", { tutorId }),
  
  getWishlist: () => axios.get("/api/v1/wishlist"),
  
  removeFromWishlist: (tutorId) => axios.delete(`/api/v1/wishlist/${tutorId}`),
  
  getFilteredWishlist: (filters) =>
    axios.get("/api/v1/wishlist/filtered", { params: filters }),
    
  getWishlistCount: () => axios.get("/api/v1/wishlist/count"),
};

// Verification API
export const verificationAPI = {
  submitRequest: (documents) =>
    axios.post("/api/v1/verification", { documents }),
  getPendingRequests: (page, limit) =>
    axios.get("/api/v1/verification/pending", { params: { page, limit } }),
  handleRequest: (id, status, adminComment) =>
    axios.put(`/api/v1/verification/${id}`, { status, adminComment }),
  getStats: () => axios.get("/api/v1/verification/stats"),
};

// Report API
export const reportAPI = {
  getAllReports: (type, page, limit) =>
    axios.get("/api/v1/reports", { params: { type, page, limit } }),
  generateReport: (type, startDate, endDate) =>
    axios.post("/api/v1/reports/generate", { type, startDate, endDate }),
  getSubjectsReport: (startDate, endDate) =>
    axios.get("/api/v1/reports/subjects", { params: { startDate, endDate } }),
  getSessionsReport: (startDate, endDate) =>
    axios.get("/api/v1/reports/sessions", { params: { startDate, endDate } }),
  getLocationsReport: (startDate, endDate) =>
    axios.get("/api/v1/reports/locations", { params: { startDate, endDate } }),
  getGrowthReport: (startDate, endDate) =>
    axios.get("/api/v1/reports/growth", { params: { startDate, endDate } }),
  exportReportData: (type, format, startDate, endDate) =>
    axios.get(`/api/v1/reports/export/${type}`, {
      params: { format, startDate, endDate },
      responseType: format === "csv" ? "blob" : "json",
    }),
};

// Notification API
export const notificationAPI = {
  getNotifications: (page, limit) =>
    axios.get("/api/v1/notifications", { params: { page, limit } }),
  markAsRead: (id) => axios.put(`/api/v1/notifications/${id}/read`),
  deleteNotification: (id) => axios.delete(`/api/v1/notifications/${id}`),
};
