import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Alert,
  Spinner,
} from "@material-tailwind/react";

// SVG Icons
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setMsg({ text: "All fields are required", type: "error" });
      return false;
    }

    if (formData.password.length < 6) {
      setMsg({ text: "Password must be at least 6 characters", type: "error" });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMsg({ text: "Passwords do not match", type: "error" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMsg({ text: "Please enter a valid email address", type: "error" });
      return false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      console.log("Sending registration request...");

      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log("Registration response:", res);

      if (res.success) {
        setMsg({
          text: "✅ Registration successful! Redirecting to login...",
          type: "success",
        });
        setSuccess(true);

        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        // Redirect after delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMsg({
          text: res.message || "❌ Registration failed. Please try again.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMsg({
        text: "❌ Network error. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <Typography variant="h3" className="font-bold text-white mb-2">
            Join Pluto Café
          </Typography>
          <Typography variant="small" className="text-blue-100">
            Create your account and start managing your restaurant
          </Typography>
        </div>

        <CardBody className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <SuccessIcon />
              <Typography variant="small" className="text-green-700">
                Registration successful! Redirecting...
              </Typography>
            </div>
          )}

          {/* Error/Success Alert */}
          {msg.text && !success && (
            <Alert
              color={msg.type === "error" ? "red" : "green"}
              className="mb-4 rounded-lg"
            >
              {msg.text}
            </Alert>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Name Field */}
            <div className="relative">
              <div className="absolute left-3 top-3">
                <UserIcon />
              </div>
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-10"
                size="lg"
                disabled={loading || success}
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="absolute left-3 top-3">
                <EmailIcon />
              </div>
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10"
                size="lg"
                disabled={loading || success}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-3 top-3">
                <LockIcon />
              </div>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10"
                size="lg"
                disabled={loading || success}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <div className="absolute left-3 top-3">
                <LockIcon />
              </div>
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="pl-10"
                size="lg"
                disabled={loading || success}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className={`mt-4 flex items-center justify-center gap-2 ${
                success
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Creating Account...
                </>
              ) : success ? (
                <>
                  <SuccessIcon />
                  Registration Successful!
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <Typography variant="small" className="mx-4 text-gray-500">
              Already have an account?
            </Typography>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Button
              variant="outlined"
              color="blue"
              fullWidth
              onClick={() => navigate("/login")}
              disabled={loading}
              className="flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In to Existing Account
            </Button>
          </div>

          {/* Additional Info */}
          <Typography
            variant="small"
            className="text-center text-gray-600 mt-6"
          >
            By creating an account, you agree to our{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </Typography>
        </CardBody>
      </Card>

      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
    </div>
  );
}
