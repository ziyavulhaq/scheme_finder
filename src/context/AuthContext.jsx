import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("sahayasetu_token") || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sahayasetu_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Validate token on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("sahayasetu_user", JSON.stringify(data.user));
          }
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn("Auth verification network error:", err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  // Login handler
  const login = async (identifier, password) => {
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please verify credentials.");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("sahayasetu_token", data.token);
      localStorage.setItem("sahayasetu_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register handler
  const register = async (profileData) => {
    setAuthError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed. Please check form fields.");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("sahayasetu_token", data.token);
      localStorage.setItem("sahayasetu_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update profile (name, profile picture)
  const updateProfile = async ({ name, profileImage }) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, profileImage })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      if (data.token) {
        setToken(data.token);
        localStorage.setItem("sahayasetu_token", data.token);
      }
      setUser(data.user);
      localStorage.setItem("sahayasetu_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 1-Click Quick Demo Citizen Login
  const demoLogin = async () => {
    return login("9876543210", "password123");
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthError("");
    localStorage.removeItem("sahayasetu_token");
    localStorage.removeItem("sahayasetu_user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        authError,
        setAuthError,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        updateProfile,
        demoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
