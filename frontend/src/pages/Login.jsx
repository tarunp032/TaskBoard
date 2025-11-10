import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import {
  Lock, Mail, LogIn, Sparkles, Shield, Zap,
  RefreshCcw, Eye, EyeOff
} from "lucide-react";

// Helper for sleep (for UI transitions)
const sleep = ms => new Promise(r => setTimeout(r, ms));

const Login = () => {
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";
  // Login states
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Forgot password flow
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=newpass, 4=done
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  const [forgotInfo, setForgotInfo] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetRepeat, setResetRepeat] = useState("");
  const [showResetPass1, setShowResetPass1] = useState(false);
  const [showResetPass2, setShowResetPass2] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // LOGIN/OTP FLOW
  const handleSendOtp = async () => {
    setError("");
    setInfoMessage("");
    setResendLoading(true);
    if (!email) {
      setError("Enter your email first.");
      setResendLoading(false);
      return;
    }
    try {
      await api.post("/user/resend-otp", { email: email.trim() });
      setInfoMessage("OTP sent to your email. Please enter OTP below.");
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
      setOtpSent(false);
    }
    setResendLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoginLoading(true);
    if (!email || !password) {
      setError("Email and password are required.");
      setLoginLoading(false);
      return;
    }
    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      setLoginLoading(false);
      return;
    }
    try {
      await api.post("/user/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });
      const resp = await api.post("/user/login", {
        email: email.trim(),
        password: password,
      });
      login(resp.data.data, resp.data.data.token);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
    }
    setLoginLoading(false);
  };

  // FORGOT PASSWORD FLOW: step 1 - send OTP
  const handleForgotOtpSend = async () => {
    setForgotError("");
    setForgotInfo("");
    setForgotOtpLoading(true);
    if (!forgotEmail) {
      setForgotError("Enter your email first.");
      setForgotOtpLoading(false);
      return;
    }
    try {
      await api.post("/user/forgot-password", { email: forgotEmail.trim() });
      setForgotInfo("If that email exists, OTP sent to your email.");
      setForgotStep(2);
    } catch (err) {
      setForgotError("Something went wrong. Please try again.");
    }
    setForgotOtpLoading(false);
  };

  // step 2 - verify OTP (UI only, actual check is with reset-password-forgot)
  const handleForgotOtpVerify = async () => {
    setForgotError("");
    setForgotInfo("");
    setForgotOtpLoading(true);
    if (!forgotOtp) {
      setForgotError("Enter OTP sent to your email.");
      setForgotOtpLoading(false);
      return;
    }
    // Directly proceed to password reset form, actual OTP+password check is in next call
    await sleep(500);
    setForgotInfo("OTP entered. Please enter new password.");
    setForgotStep(3);
    setForgotOtpLoading(false);
  };

  // step 3 - reset password
  const handleForgotResetPassword = async () => {
    setForgotError("");
    setForgotInfo("");
    setForgotOtpLoading(true);
    if (!resetNewPass || !resetRepeat) {
      setForgotError("Please fill both password fields.");
      setForgotOtpLoading(false);
      return;
    }
    if (resetNewPass !== resetRepeat) {
      setForgotError("Passwords do not match.");
      setForgotOtpLoading(false);
      return;
    }
    try {
      // MAIN CALL: send the correct payload!
      const res = await api.post("/user/reset-password-forgot", {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: resetNewPass
      });
      if (res.data.success) {
        setForgotStep(4);
        setForgotInfo("Password updated. You can now login.");
        await sleep(1200);
        setForgotMode(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotOtp("");
        setResetNewPass("");
        setResetRepeat("");
        setShowResetPass1(false);
        setShowResetPass2(false);
      } else {
        setForgotError(res.data.message || "Failed to reset password.");
      }
    } catch (err) {
      setForgotError(
        err.response?.data?.message || "Failed to reset password. Try again."
      );
    }
    setForgotOtpLoading(false);
  };

  // RENDER =========================
  return (
    <div className="premium-login-container">
      <div className="mesh-gradient-bg" />
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="premium-card"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="glow-border" />
        <motion.div className="card-decoration" animate={{ rotate: isHovering ? 180 : 0 }} transition={{ duration: 0.6 }}>
          <Sparkles size={32} className="decoration-icon" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-header">
          <h1 className="premium-title">
            {forgotMode ? "Reset Password" : "Welcome Back"}
            <motion.span animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ duration: 1.5, delay: 0.5 }} style={{ display: "inline-block", marginLeft: "8px" }}>
              👋
            </motion.span>
          </h1>
          <p className="premium-subtitle">
            <Shield size={16} style={{ display: "inline", marginRight: "6px" }} />
            Secure access to your workspace
          </p>
        </motion.div>

        {/* ----- LOGIN FORM ---------- */}
        {!forgotMode && (
          <form onSubmit={handleLogin} className="premium-form">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="premium-input"
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper" style={{ display: "flex", alignItems: "center" }}>
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="premium-input"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="show-hide-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#a78bfa"
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="form-group otp-group"
            >
              <label className="form-label">Enter OTP</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="OTP"
                  maxLength={6}
                  className="premium-input"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleSendOtp}
                  disabled={resendLoading || !email}
                  style={{
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <RefreshCcw size={16} style={{ marginBottom: -2 }} />
                  {resendLoading
                    ? "Sending..."
                    : otpSent
                    ? "Send Again"
                    : "Send OTP"}
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {(error || infoMessage) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={error ? "error-message" : "info-message"}
                  style={{ marginBottom: 8 }}
                >
                  {error || infoMessage}
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                style={{
                  border: "none", background: "transparent", color: "#a78bfa",
                  fontWeight: 600, padding: 0, margin: 0, cursor: "pointer"
                }}
                onClick={() => {
                  setForgotMode(true);
                  setForgotStep(1);
                }}
              >
                Forgot password?
              </button>
            </div>
            <motion.button
              type="submit"
              className="premium-button"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              disabled={loginLoading}
            >
              <Zap size={20} style={{ marginRight: "8px" }} />
              Sign In
              <LogIn size={20} style={{ marginLeft: "8px" }} />
            </motion.button>
          </form>
        )}

        {/* ------ FORGOT FLOW ------- */}
        {forgotMode && (
          <form className="premium-form" onSubmit={e => e.preventDefault()}>
            {forgotStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="form-group">
                <label className="form-label">Enter your email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="premium-input"
                    required
                  />
                </div>
                <button
                  type="button"
                  className="premium-button"
                  style={{ marginTop: 20 }}
                  disabled={forgotOtpLoading}
                  onClick={handleForgotOtpSend}
                >
                  {forgotOtpLoading ? "Sending..." : "Send OTP"}
                  <Mail size={18} style={{ marginLeft: 8 }} />
                </button>
              </motion.div>
            )}

            {forgotStep === 2 && (
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="form-group">
                <label className="form-label">Verify OTP</label>
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={e => setForgotOtp(e.target.value)}
                  placeholder="Enter the OTP"
                  className="premium-input"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  className="premium-button"
                  style={{ marginTop: 20 }}
                  onClick={handleForgotOtpVerify}
                  disabled={forgotOtpLoading}
                >
                  {forgotOtpLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </motion.div>
            )}

            {forgotStep === 3 && (
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="form-group">
                <label className="form-label">Enter new password</label>
                <div className="input-wrapper" style={{ display: "flex", alignItems: "center" }}>
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showResetPass1 ? "text" : "password"}
                    value={resetNewPass}
                    onChange={e => setResetNewPass(e.target.value)}
                    placeholder="New password"
                    className="premium-input"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="show-hide-btn"
                    onClick={() => setShowResetPass1((v) => !v)}
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#a78bfa"
                    }}
                  >
                    {showResetPass1 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="input-wrapper" style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showResetPass2 ? "text" : "password"}
                    value={resetRepeat}
                    onChange={e => setResetRepeat(e.target.value)}
                    placeholder="Repeat new password"
                    className="premium-input"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="show-hide-btn"
                    onClick={() => setShowResetPass2((v) => !v)}
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#a78bfa"
                    }}
                  >
                    {showResetPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  type="button"
                  className="premium-button"
                  style={{ marginTop: 20 }}
                  onClick={handleForgotResetPassword}
                  disabled={forgotOtpLoading}
                >
                  {forgotOtpLoading ? "Updating..." : "Set New Password"}
                </button>
              </motion.div>
            )}

            {forgotStep === 4 && (
              <div className="info-message" style={{ margin: 16, textAlign: "center" }}>
                Password updated! Redirecting to login...
              </div>
            )}

            <AnimatePresence>
              {(forgotInfo || forgotError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={forgotError ? "error-message" : "info-message"}
                  style={{ marginBottom: 8, marginTop: 12 }}
                >
                  {forgotError || forgotInfo}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              style={{
                border: "none", background: "transparent", color: "#8b5cf6",
                fontWeight: 600, padding: 0, marginTop: 16, cursor: "pointer"
              }}
              onClick={() => {
                setForgotMode(false);
                setForgotStep(1);
                setForgotEmail("");
                setForgotOtp("");
                setResetNewPass("");
                setResetRepeat("");
                setForgotError("");
                setForgotInfo("");
              }}
            >
              &larr; Back to login
            </button>
          </form>
        )}

        {/* footer nav */}
        {!forgotMode && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="card-footer">
            Don't have an account? <Link to="/signup" className="footer-link">Create one</Link>
          </motion.p>
        )}
        <style>{`
          .premium-login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: 2rem;
          }
          .show-hide-btn { background: none; border: none; cursor: pointer;}
          .mesh-gradient-bg {
            position: absolute;
            inset: 0;
            background:
              radial-gradient(at 0% 0%, #7c3aed 0%, transparent 50%),
              radial-gradient(at 100% 0%, #2563eb 0%, transparent 50%),
              radial-gradient(at 100% 100%, #db2777 0%, transparent 50%),
              radial-gradient(at 0% 100%, #0891b2 0%, transparent 50%),
              linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            animation: meshMove 20s ease infinite;
          }
          @keyframes meshMove {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(2deg); }
          }
          .particles {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
          }
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.8), transparent);
            border-radius: 50%;
            filter: blur(1px);
          }
          .premium-card {
            position: relative;
            width: 100%;
            max-width: 480px;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px) saturate(180%);
            border-radius: 32px;
            padding: 48px;
            box-shadow:
              0 0 0 1px rgba(139, 92, 246, 0.1),
              0 50px 100px -20px rgba(139, 92, 246, 0.3),
              inset 0 0 80px rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .glow-border {
            position: absolute;
            inset: -2px;
            background: linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6, #8b5cf6);
            background-size: 400% 400%;
            border-radius: 32px;
            opacity: 0.4;
            filter: blur(20px);
            z-index: -1;
            animation: glowRotate 8s ease infinite;
          }
          @keyframes glowRotate {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .card-decoration {
            position: absolute;
            top: -20px;
            right: 40px;
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.5);
          }
          .decoration-icon {
            color: white;
          }
          .card-header {
            text-align: center;
            margin-bottom: 36px;
          }
          .premium-title {
            font-size: 36px;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          }
          .premium-subtitle {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .premium-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .form-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.01em;
          }
          .input-wrapper {
            position: relative;
          }
          .input-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(139, 92, 246, 0.6);
            pointer-events: none;
          }
          .premium-input {
            width: 100%;
            padding: 14px 16px 14px 48px;
            background: rgba(255, 255, 255, 0.05);
            border: 1.5px solid rgba(139, 92, 246, 0.2);
            border-radius: 14px;
            color: white;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .premium-input::placeholder {
            color: rgba(255, 255, 255, 0.3);
          }
          .premium-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.08);
            border-color: #8b5cf6;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1),
              0 10px 30px rgba(139, 92, 246, 0.2);
            transform: translateY(-2px);
          }
          .resend-button {
            margin-top: 0;
            margin-left: 8px;
            background: none;
            border: none;
            color: #8b5cf6;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: underline;
            padding: 0 4px;
            transition: 0.15s;
          }
          .resend-button:disabled {
            color: rgba(139, 92, 246, 0.5);
            cursor: not-allowed;
          }
          .error-message {
            padding: 12px 16px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 10px;
            color: #fca5a5;
            font-size: 14px;
            font-weight: 500;
          }
          .info-message {
            padding: 12px 16px;
            background: rgba(139, 92, 246, 0.05);
            border-radius: 10px;
            color: #a78bfa;
            font-size: 14px;
            text-align: center;
          }
          .premium-button {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            border: none;
            border-radius: 14px;
            color: white;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .premium-button::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              135deg,
              transparent,
              rgba(255, 255, 255, 0.2),
              transparent
            );
            transform: translateX(-100%);
            transition: transform 0.6s;
          }
          .premium-button:hover::before {
            transform: translateX(100%);
          }
          .premium-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .card-footer {
            text-align: center;
            margin-top: 24px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
          }
          .footer-link {
            color: #a78bfa;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
          }
          .footer-link:hover {
            color: #c4b5fd;
            text-decoration: underline;
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default Login;
