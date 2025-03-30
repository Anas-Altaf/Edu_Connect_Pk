import React, { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getUser();
          if (response.data.success) {
            setCurrentUser(response.data.data);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth check error:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
      setAuthInitialized(true);
    };

    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await authAPI.login(email, password, role);
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        setCurrentUser(user);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "An error occurred during login",
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await authAPI.register(name, email, password, role);
      if (response.data.success) {
        toast.success("Registration successful! Please log in.");
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "An error occurred during registration",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const updateCurrentUser = (userData) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...userData,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authInitialized,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
