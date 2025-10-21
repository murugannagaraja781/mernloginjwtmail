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

const RestaurantIcon = () => (
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
      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
    />
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    if (!formData.email || !formData.password) {
      setMsg({ text: "Please fill in all fields", type: "error" });
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
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (res.success && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: formData.email,
            name: res.user?.name || "User",
          })
        );

        setMsg({
          text: "✅ Login successful! Redirecting...",
          type: "success",
        });
        setSuccess(true);

        // Clear form
        setFormData({
          email: "",
          password: "",
        });

        // Redirect to POS after delay
        setTimeout(() => {
          navigate("/pos");
        }, 1500);
      } else {
        setMsg({
          text: res.message || "❌ Invalid email or password",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setMsg({
        text: "❌ Network error. Please check your connection.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: "demo@plutocafe.com",
      password: "demo123",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <RestaurantIcon />
            </div>
          </div>
          <Typography variant="h3" className="font-bold text-white mb-2">
            Welcome Back
          </Typography>
          <Typography variant="small" className="text-indigo-100">
            Sign in to your Pluto Café account
          </Typography>
        </div>

        <CardBody className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <SuccessIcon />
              <Typography variant="small" className="text-green-700">
                Login successful! Redirecting to POS...
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

          {/* Demo Account Hint */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Typography variant="small" className="text-blue-700 text-center">
              <strong>Demo Account:</strong> demo@plutocafe.com / demo123
            </Typography>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
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

            {/* Forgot Password Link */}
            <div className="flex justify-end -mt-2">
              <Typography
                variant="small"
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() =>
                  setMsg({
                    text: "Please contact admin to reset your password",
                    type: "error",
                  })
                }
              >
                Forgot password?
              </Typography>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className={`mt-2 flex items-center justify-center gap-2 ${
                success
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Signing In...
                </>
              ) : success ? (
                <>
                  <SuccessIcon />
                  Login Successful!
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Demo Login Button */}
            <Button
              type="button"
              variant="outlined"
              color="blue"
              size="lg"
              onClick={handleDemoLogin}
              disabled={loading || success}
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Use Demo Account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <Typography variant="small" className="mx-4 text-gray-500">
              New to Pluto Café?
            </Typography>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Button
              variant="outlined"
              color="green"
              fullWidth
              onClick={() => navigate("/register")}
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create New Account
            </Button>
          </div>

          {/* Admin Note */}
          <Typography
            variant="small"
            className="text-center text-gray-600 mt-6"
          >
            For admin access, please contact system administrator
          </Typography>
        </CardBody>
      </Card>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

      {/* Floating Elements for Visual Appeal */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
    </div>
  );
}
