import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import TutorSearchPage from "./pages/tutors/TutorSearchPage";
import TutorDetailPage from "./pages/tutors/TutorDetailPage";
import WishlistPage from "./pages/wishlist/WishlistPage";
import SessionsPage from "./pages/sessions/SessionsPage";
import SessionDetailPage from "./pages/sessions/SessionDetailPage";
import SessionBookingPage from "./pages/sessions/SessionBookingPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import VerificationRequestsPage from "./pages/admin/VerificationRequestsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import UsersPage from "./pages/admin/UsersPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import "./styles/global.css";
import SessionEditPage from "./pages/sessions/SessionEditPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <HomePage />
                  </Layout>
                }
              />
              <Route
                path="/auth/login"
                element={
                  <Layout>
                    <LoginPage />
                  </Layout>
                }
              />
              <Route
                path="/auth/register"
                element={
                  <Layout>
                    <RegisterPage />
                  </Layout>
                }
              />
              <Route
                path="/auth/forgot-password"
                element={
                  <Layout>
                    <ForgotPasswordPage />
                  </Layout>
                }
              />
              <Route
                path="/unauthorized"
                element={
                  <Layout>
                    <UnauthorizedPage />
                  </Layout>
                }
              />
              <Route
                path="/tutors"
                element={
                  <Layout>
                    <TutorSearchPage />
                  </Layout>
                }
              />
              <Route
                path="/tutors/:id"
                element={
                  <Layout>
                    <TutorDetailPage />
                  </Layout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Layout>
                      <WishlistPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SessionsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SessionDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions/edit/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SessionEditPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions/book/:id"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Layout>
                      <SessionBookingPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NotificationsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/verifications"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <VerificationRequestsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <ReportsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <UsersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <Layout>
                    <NotFoundPage />
                  </Layout>
                }
              />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
