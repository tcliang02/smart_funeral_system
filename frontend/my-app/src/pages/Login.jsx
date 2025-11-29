'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { login, changePassword } from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: "", text: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const router = useRouter();
  const { updateUser } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      console.log('Attempting login with:', formData);
      const data = await login(formData);
      console.log('Login response:', data);

      if (data.success && data.user) {
        // Update auth context
        updateUser(data.user);

        // Redirect based on role - check both "provider" and case variations
        const userRole = data.user.role?.toLowerCase();
        if (userRole === "provider" || userRole === "service_provider") {
          router.replace("/service-provider-dashboard");
        } else {
          router.replace("/");
        }
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("⚠️ Server error. Please ensure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleChangePassword = () => {
    setShowChangePassword((prev) => !prev);
    setPasswordFeedback({ type: "", text: "" });
    setPasswordForm((prev) => ({
      username: formData.username || prev.username,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: "", text: "" });

    if (!passwordForm.username || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", text: "New passwords do not match." });
      return;
    }

    const trimmedUsername = passwordForm.username.trim();
    const newPasswordValue = passwordForm.newPassword;

    try {
      setPasswordLoading(true);
      const result = await changePassword({
        username: trimmedUsername,
        current_password: passwordForm.currentPassword,
        new_password: newPasswordValue,
        confirm_password: passwordForm.confirmPassword,
      });

      if (result.success) {
        setPasswordFeedback({ type: "success", text: result.message || "Password updated successfully. Please sign in." });
        setFormData({ username: trimmedUsername, password: newPasswordValue });
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordFeedback({ type: "", text: "" });
          setPasswordForm({
            username: trimmedUsername,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }, 2000);
      } else {
        setPasswordFeedback({ type: "error", text: result.message || "Failed to update password." });
      }
    } catch (err) {
      console.error('Change password error:', err);
      setPasswordFeedback({ type: "error", text: err.message || "Failed to update password. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 font-geist px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-gray-200"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to access your memorial and service features
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleChangePassword}
            className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            {showChangePassword ? "Back to sign in" : "Need to change your password?"}
          </button>
        </div>

        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Update Your Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={passwordForm.username}
                  onChange={handlePasswordInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Choose a new password (min. 6 characters)"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              {passwordFeedback.text && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm p-3 rounded-lg border ${passwordFeedback.type === 'success' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}
                >
                  {passwordFeedback.text}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-indigo-600 text-white rounded-lg py-3 font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors"
            >
              Create one here
            </span>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => router.push("/tribute")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-900 rounded-lg py-3 font-medium transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            Continue as Guest to View Tributes
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Browse memorial pages without signing in
          </p>
        </div>
      </motion.div>
    </main>
  );
}
