import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import TutorSearchPage from "./pages/tutors/TutorSearchPage";
import TutorDetailPage from "./pages/tutors/TutorDetailPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SessionsPage from "./pages/sessions/SessionsPage";
import SessionDetailPage from "./pages/sessions/SessionDetailPage";
import SessionBookingPage from "./pages/sessions/SessionBookingPage";
import SessionEditPage from "./pages/sessions/SessionEditPage";
import WishlistPage from "./pages/wishlist/WishlistPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

import UsersManagementPage from "./pages/admin/UsersManagementPage";
import UserDetailsPage from "./pages/admin/UserDetailsPage";
import VerificationRequestsPage from "./pages/admin/VerificationRequestsPage";
import ReportsPage from "./pages/admin/ReportsPage";

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <ToastContainer position="top-right" autoClose={3000} />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/tutors" element={<TutorSearchPage />} />
                <Route path="/tutors/:id" element={<TutorDetailPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <SessionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/:id"
                  element={
                    <ProtectedRoute>
                      <SessionDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/book/:tutorId"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <SessionBookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/:id/edit"
                  element={
                    <ProtectedRoute>
                      <SessionEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UsersManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:id"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UserDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verifications"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <VerificationRequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Error Pages */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
