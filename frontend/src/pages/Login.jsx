import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { Lock, Mail, LogIn } from "lucide-react";

// --- ADD FORGOT PASSWORD STATE ---
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/user/login", { email, password });
      login(response.data.data, response.data.data.token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      alert(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 relative overflow-hidden">
      {/* Floating background circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>

      {/* Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-8 w-96 text-white"
      >
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-center mb-2 drop-shadow-lg">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-100 mb-8 text-sm tracking-wide">
          Sign in to continue managing your tasks efficiently
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-200 text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-200 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300 transition"
                required
              />
            </div>
          </div>
          
          {/* Forgot Password Link */}
          <div className="text-right mt-2 mb-4">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-cyan-200 hover:text-white text-xs font-semibold underline"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center font-semibold">
              {error}
            </p>
          )}

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6,182,212,0.6)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 rounded-lg font-bold text-white shadow-md hover:shadow-cyan-400/50 transition"
          >
            <LogIn size={18} /> Login
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-gray-200 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-300 font-semibold hover:underline hover:text-white transition"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-8 w-96 text-white">
            <button
              className="absolute top-2 right-3 text-lg"
              onClick={() => setShowForgot(false)}
            >×</button>
            <h2 className="text-xl font-bold mb-4 text-center">Forgot Password</h2>
            <input
              type="email"
              className="w-full px-4 py-2 mb-3 rounded-lg bg-white/20 border border-white/20 text-white placeholder-gray-200"
              value={forgotEmail}
              placeholder="Enter your registered email"
              onChange={e => setForgotEmail(e.target.value)}
            />
            <button
              className="w-full py-2 bg-cyan-500 rounded-lg font-semibold"
              disabled={forgotLoading}
              onClick={async () => {
                setForgotLoading(true);
                setForgotMsg("");
                try {
                  await api.post("/user/forgot-password", { email: forgotEmail });
                  setForgotMsg("If an account exists, reset instructions sent.");
                } catch {
                  setForgotMsg("Failed. Try again later.");
                }
                setForgotLoading(false);
              }}
            >{forgotLoading ? "Sending..." : "Request Reset"}</button>
            {forgotMsg && <div className="mt-3 text-center text-sm text-teal-200">{forgotMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
