'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function Register() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState("family");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Provider-specific fields
    businessName: "",
    location: "",
    workingHours: "",
    phone: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check URL parameters for role
  useEffect(() => {
    if (typeof window !== 'undefined' && searchParams) {
      const roleParam = searchParams.get('role');
      if (roleParam === 'provider') {
        setRole('provider');
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("⚠️ Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("⚠️ Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/backend/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          `✅ Registration successful as ${
            role === "family" ? "Family Member" : "Service Provider"
          }! Please login.`
        );
        router.push("/login");
      } else {
        setError(data.message || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Server error. Please ensure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 font-geist px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full ${role === 'provider' ? 'max-w-2xl' : 'max-w-md'} bg-white rounded-2xl shadow-sm p-8 border border-gray-200`}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {role === 'provider' ? 'Join as Service Provider' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {role === 'provider' 
              ? 'Register your funeral service business with our platform'
              : 'Join us to access memorial and service features'
            }
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex justify-center gap-3 mb-8">
          {["family", "provider"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                role === r
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r === "family" ? "Family Member" : "Service Provider"}
            </button>
          ))}
        </div>
        
        {/* Guest Access Info */}
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-900">
            <strong>Funeral Attendees:</strong> No registration needed! You can access tributes and view memorial pages as a guest from the{" "}
            <span className="font-semibold underline cursor-pointer" onClick={() => router.push("/login")}>
              login page
            </span>.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-6">
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
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>

          {/* Provider-specific fields */}
          {role === "provider" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="Enter your funeral service business name"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="">Select your location</option>
                  <option value="Kuala Lumpur">Kuala Lumpur</option>
                  <option value="Selangor">Selangor</option>
                  <option value="Penang">Penang</option>
                  <option value="Johor">Johor</option>
                  <option value="Perak">Perak</option>
                  <option value="Kedah">Kedah</option>
                  <option value="Kelantan">Kelantan</option>
                  <option value="Terengganu">Terengganu</option>
                  <option value="Pahang">Pahang</option>
                  <option value="Negeri Sembilan">Negeri Sembilan</option>
                  <option value="Malacca">Malacca</option>
                  <option value="Sabah">Sabah</option>
                  <option value="Sarawak">Sarawak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your business phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Hours
                </label>
                <select
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="">Select working hours</option>
                  <option value="24/7 Service Available">24/7 Service Available</option>
                  <option value="8:00 AM - 8:00 PM">8:00 AM - 8:00 PM</option>
                  <option value="9:00 AM - 6:00 PM">9:00 AM - 6:00 PM</option>
                  <option value="9:00 AM - 5:00 PM">9:00 AM - 5:00 PM</option>
                  <option value="Custom Hours">Custom Hours</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  name="description"
                  placeholder="Briefly describe your funeral services and specialties"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                />
              </div>
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors"
            >
              Sign in here
            </span>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
