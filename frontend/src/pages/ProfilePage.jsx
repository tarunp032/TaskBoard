import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { User, Mail, Lock, Edit3, Save, X, Key, Eye, EyeOff, ShieldCheck } from "lucide-react";

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [view, setView] = useState("details");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // OTP Modal state
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  // Temporary memory for credentials while verifying OTP
  const [pendingCreds, setPendingCreds] = useState({ oldPassword: "", newPassword: "" });

  // Compose update change message for feedback
  const getUpdateMessage = (oldName, newName, oldEmail, newEmail) => {
    let changes = [];
    if (oldName !== newName) changes.push("Name updated");
    if (oldEmail !== newEmail) changes.push("Email updated");
    if (changes.length === 0) return "";
    return changes.join(" and ");
  };

  // Handle profile update (name/email)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.patch("/user/update-profile", { name, email });
      const mailMsg = getUpdateMessage(user.name, name, user.email, email);
      setMessage(mailMsg ? mailMsg + " successfully!" : "No changes detected.");
      updateProfile({ name, email });
      setTimeout(() => setView("details"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
    setSaving(false);
  };

  // =================== CHANGE PASSWORD LOGIC =====================

  // Step1: User submits credentials → open OTP modal
  const onPasswordForm = (e) => {
    e.preventDefault();
    setPendingCreds({ oldPassword, newPassword });
    setOtp(""); setOtpMsg(""); setOtpVerifying(false);
    setPwdMsg(""); setOtpSent(false);
    setOtpModal(true);
  };

  // Step2: Send OTP
  const handleSendOtp = async () => {
    setOtpSent(false);
    setOtpMsg("");
    setOtpSending(true);
    try {
      const res = await api.post("/user/send-otp-reset-password");
      if (res.data.success) {
        setOtpSent(true);
        setOtpMsg("OTP sent to your email!");
      }
    } catch (err) {
      setOtpMsg(err.response?.data?.message || "Failed to send OTP.");
    }
    setOtpSending(false);
  };

  // Step3: Verify OTP --> then call API to actually change password
const handleOtpVerify = async (e) => {
  e.preventDefault();
  setOtpVerifying(true); setOtpMsg("");
  try {
    await api.post("/user/reset-password-with-otp", {
      email: user.email.trim(),
      otp: otp.trim(),
      oldPassword: pendingCreds.oldPassword,
      newPassword: pendingCreds.newPassword,
    });
    setPwdMsg("Password changed successfully!");
    setOldPassword(""); setNewPassword(""); setOtp(""); setOtpModal(false); setOtpMsg(""); setPendingCreds({});
    setTimeout(() => setView("details"), 1400);
  } catch (err) {
    setOtpMsg(err.response?.data?.message || "OTP or password update failed.");
  }
  setOtpVerifying(false);
};


  // Cancel/Close Modal/Reset
  const resetPwdFlow = () => {
    setOtp(""); setOtpMsg(""); setOtpModal(false); setOtpVerifying(false);
    setOtpSent(false); setPwdSaving(false); setPendingCreds({});
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
              noValidate
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
                    autoComplete="name"
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
                    autoComplete="email"
                  />
                </div>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`message ${
                      message.toLowerCase().includes("success") ? "message-success" : "message-error"
                    }`}
                    role="alert"
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
              className="profile-content"
              onSubmit={onPasswordForm}
              autoComplete="off"
            >
              <div className="form-section">
                <div className="form-group password-group">
                  <label className="form-label" htmlFor="oldPassword">
                    <Lock size={16} />
                    Current Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="oldPassword"
                      type={showOldPwd ? "text" : "password"}
                      className="form-input"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowOldPwd((prev) => !prev)}
                      aria-label={showOldPwd ? "Hide password" : "Show password"}
                    >
                      {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group password-group">
                  <label className="form-label" htmlFor="newPassword">
                    <Key size={16} />
                    New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="newPassword"
                      type={showNewPwd ? "text" : "password"}
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowNewPwd((prev) => !prev)}
                      aria-label={showNewPwd ? "Hide password" : "Show password"}
                    >
                      {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {pwdMsg && (
                  <div
                    className={`message ${pwdMsg.toLowerCase().includes("success") ? "message-success" : "message-error"}`}
                    role="alert"
                  >
                    {pwdMsg}
                  </div>
                )}
              </div>
              <div className="button-group">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setView("details"); setOldPassword(""); setNewPassword(""); setPwdMsg("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-secondary"
                  disabled={!oldPassword || !newPassword}
                >
                  Change Password
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* OTP MODAL */}
      {otpModal && (
        <div className="otp-modal-backdrop">
          <motion.div
            className="otp-modal"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.36 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ShieldCheck size={22} style={{ color: "#7c3aed" }} />
              <span style={{ fontWeight: 700, fontSize: 18, color: "#18181b" }}>
                Verify with OTP
              </span>
            </div>
            <div style={{ margin: '20px 0 8px' }}>
              <button
                className="btn-primary"
                type="button"
                disabled={otpSending}
                onClick={handleSendOtp}
                style={{ marginBottom: 8, width: "100%" }}
              >
                {otpSending ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
            {otpSent && (
              <form onSubmit={handleOtpVerify} autoComplete="off" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500 }}>
                    Enter the OTP sent to your email
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
                  <button
                    className="btn-primary"
                    type="submit"
                    style={{ flex: 1 }}
                    disabled={otpVerifying || !otp}
                  >
                    {otpVerifying ? "Verifying..." : "Verify & Change Password"}
                  </button>
                </div>
              </form>
            )}
            {otpMsg && <div className={`message ${otpMsg.toLowerCase().includes("success") ? "message-success" : "message-error"}`} role="alert">{otpMsg}</div>}
            <button className="btn-cancel" style={{width:'100%', marginTop:12}} onClick={resetPwdFlow}>Cancel</button>
          </motion.div>
          <div className="otp-modal-bg"></div>
        </div>
      )}

      <style>{`
      .profile-page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fb, #ebf1fe 80%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: "Poppins", sans-serif;
}

.profile-bg {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.18;
  animation: float 16s ease-in-out infinite;
}
.orb-1 { width: 360px; height: 320px; background: #dbeafe; top: -60px; left: -120px;}
.orb-2 { width: 300px; height: 240px; background: #fee2e2; bottom: -120px; right: -110px; animation-delay: -7s;}
.orb-3 { width: 340px; height: 300px; background: #ede9fe; top: 45%; right: -100px; animation-delay: -3s;}

@keyframes float {
  0%, 100% { transform: translate(0, 0);}
  50% { transform: translate(28px, -36px);}
}

.profile-card {
  z-index: 2;
  max-width: 520px;
  width: 100%;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(18px);
  border-radius: 24px;
  padding: 44px 44px 38px 44px;
  box-shadow: 0 12px 44px rgba(120, 80, 200, 0.10);
  border: 1.5px solid #f3f4f8;
}

.profile-header { text-align: center; margin-bottom: 36px;}
.profile-avatar {
  width: 96px; height: 96px; margin: 0 auto 14px;
  border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #f472b6 80%);
  color: white; font-size: 40px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 7px 24px rgba(124,58,237,0.14);
}
.profile-title { font-size: 28px; font-weight: 800; color: #1e2532;}
.profile-subtitle { font-size: 15px; color: #757783;}

.info-section { display: flex; flex-direction: column; gap: 18px;}
.info-item {
  background: #f8fafc; border-radius: 13px;
  padding: 18px; margin-bottom: 3px; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04);
  border: 1px solid #e5e7eb;
}
.info-label { display: flex; align-items: center; gap: 7px; color: #6b7280; font-size: 13px; font-weight: 600;}
.info-value { color: #1e2333; font-size: 16px; font-weight: 600;}

.form-section { margin-bottom: 18px;}
.form-group { margin-bottom: 18px;}
.form-label { color: #374151; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.form-input {
  width: 100%; padding: 12px 16px; border-radius: 11px;
  border: 1.4px solid #e0e2e7; background: #fcfcff; font-size: 15px;
  transition: border 0.22s;
}
.form-input:focus { border-color: #a78bfa; outline: none;}
.password-input-wrapper { position: relative; display: flex; align-items: center;}
.pwd-toggle-btn {
  position: absolute; right: 12px; background: none; border: none; color: #857ab3;
  cursor: pointer; padding: 0; display: flex; align-items: center;
}

.button-group { display: flex; gap: 12px; margin-top: 8px;}
.btn-primary,
.btn-secondary,
.btn-cancel {
  flex: 1;
  padding: 13px 20px;
  border-radius: 11px;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.13s;
}
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 30%, #db2777 100%);
  color: white;
  box-shadow: 0 4px 16px #e0e0fc36;
}
.btn-primary:hover {
  box-shadow: 0 7px 22px #c4b5fd62;
  transform: translateY(-2px);
}
.btn-secondary {
  background: linear-gradient(135deg, #fcd34d, #fca5a5 100%);
  color: #22223b;
  box-shadow: 0 4px 14px #fde68ab4;
}
.btn-secondary:hover {
  box-shadow: 0 8px 18px #fde68aa8;
  transform: translateY(-2px);
}
.btn-cancel {
  background: #f3f4f6; color: #22223b;
  border: 1px solid #e6e6ef;
}
.btn-cancel:hover {
  background: #e0e7ef;
}

.message {
  border-radius: 9px;
  padding: 12px;
  font-size: 14.5px;
  text-align: center;
  font-weight: 600;
  margin-top: 7px;
}
.message-success { background: #ecfdf5; color: #22c55e;}
.message-error { background: #fef2f2; color: #e11d48; }

.otp-modal-backdrop { position: fixed; z-index: 99; inset: 0; display: flex; align-items: center; justify-content: center; }
.otp-modal {
  position: relative; z-index: 100; padding: 34px 30px 18px 30px; min-width:320px;
  width: 340px; max-width: 98vw; background: #ffffff; border-radius: 16px;
  box-shadow: 0 8px 38px #d1c4e9, 0 1.5px 6px #eee;
  border: 1.5px solid #ede9fe;
  display: flex; flex-direction: column; align-items: stretch;
}
.otp-modal-bg { position: fixed; inset: 0; z-index: 90; background: rgba(40,25,60,0.14); backdrop-filter: blur(2.6px);}
@media (max-width: 699px) {
  .profile-card { padding: 28px 9px 26px 9px;}
  .otp-modal {padding: 17px 8vw 10px 8vw;}
}

        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
