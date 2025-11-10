import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Edit3, Save, X, Key } from "lucide-react";

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [view, setView] = useState("details");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.patch("/user/update-profile", { name, email });
      setMessage("Profile updated successfully!");
      updateProfile({ name, email });
      setTimeout(() => setView("details"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
    setSaving(false);
  };

  const handlePwd = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg("");
    try {
      await api.post("/user/reset-password", { oldPassword, newPassword });
      setPwdMsg("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setView("details"), 1500);
    } catch (err) {
      setPwdMsg(err.response?.data?.message || "Password change failed.");
    }
    setPwdSaving(false);
  };

  return (
    <div className="profile-page-container">
      {/* Floating background accents */}
      <div className="profile-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="profile-card"
      >
        <div className="profile-header">
          <motion.div
            className="profile-avatar"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </motion.div>
          <h2 className="profile-title">My Profile</h2>
          <p className="profile-subtitle">Manage your account settings</p>
        </div>

        <AnimatePresence mode="wait">
          {view === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="profile-content"
            >
              <div className="info-section">
                <div className="info-item">
                  <div className="info-label">
                    <User size={18} />
                    <span>Full Name</span>
                  </div>
                  <div className="info-value">{user?.name}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <Mail size={18} />
                    <span>Email Address</span>
                  </div>
                  <div className="info-value">{user?.email}</div>
                </div>
              </div>

              <div className="button-group">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("edit")}
                  className="btn-primary"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("password")}
                  className="btn-secondary"
                >
                  <Key size={18} />
                  Change Password
                </motion.button>
              </div>
            </motion.div>
          )}

          {view === "edit" && (
            <motion.form
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleUpdate}
              className="profile-content"
            >
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`message ${
                      message.includes("success")
                        ? "message-success"
                        : "message-error"
                    }`}
                  >
                    {message}
                  </motion.div>
                )}
              </div>

              <div className="button-group">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setView("details")}
                  className="btn-cancel"
                >
                  <X size={18} />
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </motion.form>
          )}

          {view === "password" && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePwd}
              className="profile-content"
            >
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={16} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Key size={16} />
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                {pwdMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`message ${
                      pwdMsg.includes("success")
                        ? "message-success"
                        : "message-error"
                    }`}
                  >
                    {pwdMsg}
                  </motion.div>
                )}
              </div>

              <div className="button-group">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setView("details")}
                  className="btn-cancel"
                >
                  <X size={18} />
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={pwdSaving}
                  className="btn-secondary"
                >
                  <Key size={18} />
                  {pwdSaving ? "Changing..." : "Change Password"}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .profile-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fafafa 0%, #f8f6ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: "Poppins", sans-serif;
        }

        .profile-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: #c7d2fe;
          top: -100px;
          left: -100px;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: #fde68a;
          bottom: -120px;
          right: -120px;
          animation-delay: -5s;
        }

        .orb-3 {
          width: 380px;
          height: 380px;
          background: #fbcfe8;
          top: 40%;
          right: -150px;
          animation-delay: -10s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -40px);
          }
        }

        .profile-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 48px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }

        .profile-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #fbcfe8);
          color: white;
          font-size: 42px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(168, 85, 247, 0.25);
        }

        .profile-title {
          font-size: 30px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .profile-subtitle {
          font-size: 15px;
          color: #6b7280;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .info-value {
          color: #111827;
          font-size: 17px;
          font-weight: 600;
        }

        .form-label {
          color: #374151;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          background: #ffffff;
          font-size: 15px;
          transition: all 0.3s;
        }

        .form-input:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.15);
          outline: none;
        }

        .message {
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          font-weight: 600;
        }

        .message-success {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .message-error {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .button-group {
          display: flex;
          gap: 12px;
        }

        .btn-primary,
        .btn-secondary,
        .btn-cancel {
          flex: 1;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #a78bfa, #c084fc);
          color: white;
          box-shadow: 0 8px 20px rgba(168, 85, 247, 0.25);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.35);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #fca5a5, #fcd34d);
          color: #111827;
          box-shadow: 0 8px 20px rgba(252, 211, 77, 0.3);
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(252, 211, 77, 0.4);
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #111827;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .profile-card {
            padding: 32px 24px;
          }
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
