import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { User, Mail, Lock, Sparkles, Rocket, CheckCircle } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const features = [
    { icon: <CheckCircle size={18} />, text: "Secure & Encrypted" },
    { icon: <CheckCircle size={18} />, text: "Free Forever" },
    { icon: <CheckCircle size={18} />, text: "24/7 Support" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/user/", { name, email, password });
      setMessage("Profile created! OTP sent to your email. Please verify before login.");
      setTimeout(() => navigate("/login", { state: { email } }), 2500); // Pass email state for login page
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
    }
  };

  return (
    <div className="premium-signup-container">
      {/* Animated mesh gradient background */}
      <div className="mesh-gradient-bg-signup" />
      {/* Floating particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, scale: Math.random() * 0.5 + 0.5 }}
            animate={{ y: [null, Math.random() * window.innerHeight], x: [null, Math.random() * window.innerWidth] }}
            transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
      </div>
      {/* Floating orbs */}
      <div className="floating-orbs">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`orb orb-${i + 1}`}
            animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 5 + i, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="premium-signup-card"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Animated border gradient */}
        <div className="animated-border" />
        {/* Top badge with rotating rocket */}
        <motion.div className="top-badge" animate={{ rotate: isHovering ? 360 : 0 }} transition={{ duration: 0.8 }}>
          <Rocket size={24} className="badge-icon" />
        </motion.div>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="signup-header">
          <h1 className="signup-title">
            Create Account
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ display: "inline-block", marginLeft: "8px" }}>
              ✨
            </motion.span>
          </h1>
          <p className="signup-subtitle">Join thousands of happy users</p>
        </motion.div>
        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="features-list">
          {features.map((feature, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.1 }} className="feature-item">
              {feature.icon} <span>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
        {/* Signup form */}
        <form onSubmit={handleSubmit} className="signup-form">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="premium-input" required />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="premium-input" required />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="premium-input" required />
            </div>
          </motion.div>

          <AnimatePresence>
            {(error || message) && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={error ? "error-message" : "success-message"}>
                {error || message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="premium-signup-button"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(236, 72, 153, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Sparkles size={18} style={{ marginRight: "8px" }} />
            Create Account
            <Rocket size={18} style={{ marginLeft: "8px" }} />
          </motion.button>
        </form>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="signup-footer">
          Already have an account? <Link to="/login" className="footer-link">Sign In</Link>
        </motion.p>

        {/* CSS */}
        <style>{`
          .premium-signup-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: 2rem;
          }
          .mesh-gradient-bg-signup {
            position: absolute;
            inset: 0;
            background: 
              radial-gradient(at 0% 0%, #ec4899 0%, transparent 50%),
              radial-gradient(at 100% 0%, #8b5cf6 0%, transparent 50%),
              radial-gradient(at 100% 100%, #3b82f6 0%, transparent 50%),
              radial-gradient(at 0% 100%, #06b6d4 0%, transparent 50%),
              linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
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
            background: radial-gradient(circle, rgba(236, 72, 153, 0.8), transparent);
            border-radius: 50%;
            filter: blur(1px);
          }
          .floating-orbs {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
          .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.3;
          }
          .orb-1 { width: 300px; height: 300px; background: #ec4899; top: 10%; left: 10%; }
          .orb-2 { width: 250px; height: 250px; background: #8b5cf6; top: 60%; right: 10%; }
          .orb-3 { width: 200px; height: 200px; background: #3b82f6; bottom: 20%; left: 20%; }
          .orb-4 { width: 180px; height: 180px; background: #06b6d4; top: 30%; right: 30%; }
          .orb-5 { width: 220px; height: 220px; background: #a855f7; bottom: 40%; right: 20%; }
          .orb-6 { width: 190px; height: 190px; background: #f97316; top: 50%; left: 15%; }
          .premium-signup-card {
            position: relative;
            width: 100%;
            max-width: 460px;
            background: rgba(30, 27, 75, 0.85);
            backdrop-filter: blur(20px) saturate(180%);
            border-radius: 28px;
            padding: 32px;
            box-shadow: 
              0 0 0 1px rgba(236, 72, 153, 0.1),
              0 50px 100px -20px rgba(236, 72, 153, 0.3),
              inset 0 0 80px rgba(236, 72, 153, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .animated-border {
            position: absolute;
            inset: -3px;
            background: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6, #ec4899);
            background-size: 400% 400%;
            border-radius: 28px;
            opacity: 0.5;
            filter: blur(25px);
            z-index: -1;
            animation: glowRotate 8s ease infinite;
          }
          @keyframes glowRotate {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .top-badge {
            position: absolute;
            top: -20px;
            right: 36px;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 40px rgba(236, 72, 153, 0.5);
          }
          .badge-icon {
            color: white;
          }
          .signup-header {
            text-align: center;
            margin-bottom: 16px;
          }
          .signup-title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff, #ec4899, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 6px;
            letter-spacing: -0.02em;
          }
          .signup-subtitle {
            color: rgba(255, 255, 255, 0.6);
            font-size: 13px;
            font-weight: 500;
          }
          .features-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 18px;
            padding: 14px;
            background: rgba(236, 72, 153, 0.05);
            border-radius: 14px;
            border: 1px solid rgba(236, 72, 153, 0.1);
          }
          .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 13px;
            font-weight: 500;
          }
          .feature-item svg {
            color: #ec4899;
            flex-shrink: 0;
          }
          .signup-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .form-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.01em;
          }
          .input-wrapper {
            position: relative;
          }
          .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(236, 72, 153, 0.6);
            pointer-events: none;
          }
          .premium-input {
            width: 100%;
            padding: 11px 14px 11px 42px;
            background: rgba(255, 255, 255, 0.05);
            border: 1.5px solid rgba(236, 72, 153, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .premium-input::placeholder {
            color: rgba(255, 255, 255, 0.3);
          }
          .premium-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.08);
            border-color: #ec4899;
            box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1), 0 10px 30px rgba(236, 72, 153, 0.2);
            transform: translateY(-2px);
          }
          .error-message {
            padding: 10px 14px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 10px;
            color: #fca5a5;
            font-size: 13px;
            font-weight: 500;
          }
          .success-message {
            padding: 10px 14px;
            background: rgba(56, 204, 99, 0.15);
            border: 1px solid rgba(56, 204, 99, 0.4);
            border-radius: 10px;
            color: #38cc63;
            font-size: 13px;
            font-weight: 500;
          }
          .premium-signup-button {
            width: 100%;
            padding: 13px 20px;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .premium-signup-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s;
          }
          .premium-signup-button:hover::before {
            transform: translateX(100%);
          }
          .signup-footer {
            text-align: center;
            margin-top: 16px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 13px;
          }
          .footer-link {
            color: #ec4899;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
          }
          .footer-link:hover {
            color: #f9a8d4;
            text-decoration: underline;
          }
          @media (max-width: 600px) {
            .premium-signup-container {
              padding: 1.5rem;
            }
            .premium-signup-card {
              padding: 28px;
              max-width: 95%;
            }
            .signup-title {
              font-size: 28px;
            }
            .top-badge {
              width: 48px;
              height: 48px;
              top: -18px;
            }
            .features-list {
              padding: 12px;
              gap: 6px;
            }
            .signup-form {
              gap: 12px;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default Signup;
