import React, { useContext, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const [view, setView] = useState("details");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  // password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  const navigate = useNavigate();

  // update profile handler
  const handleUpdate = async e => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.patch("/user/update-profile", { name, email });
      setMessage("Profile updated!");
      updateProfile({ name, email }); // <-- update context and localStorage
      setView("details");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
    setSaving(false);
  };

  // password reset handler
  const handlePwd = async e => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg("");
    try {
      await api.post("/user/reset-password", { oldPassword, newPassword });
      setPwdMsg("Password changed!");
      setOldPassword("");
      setNewPassword("");
      setView("details");
    } catch (err) {
      setPwdMsg(err.response?.data?.message || "Password change failed.");
    }
    setPwdSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-indigo-700 via-blue-700 to-purple-700 px-4">
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl px-8 py-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-7 text-white tracking-wide">My Profile</h2>

        {view === "details" && (
          <>
            <div className="mb-6">
              <div className="mb-3">
                <span className="text-gray-300">Name:</span>
                <span className="ml-2 text-white font-semibold">{user?.name}</span>
              </div>
              <div>
                <span className="text-gray-300">Email:</span>
                <span className="ml-2 text-white font-semibold">{user?.email}</span>
              </div>
            </div>
            <button
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold mb-3 text-white"
              onClick={() => setView("edit")}
            >
              Edit Profile
            </button>
            <button
              className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-400 to-pink-500 font-semibold text-white"
              onClick={() => setView("password")}
            >
              Reset Password
            </button>
          </>
        )}

        {view === "edit" && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm text-gray-100 font-semibold mb-1 block">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-white/30 border border-white/30 text-white placeholder-gray-300"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-100 font-semibold mb-1 block">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-white/30 border border-white/30 text-white placeholder-gray-300"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {message && <div className="text-sm text-center mt-2 text-teal-100">{message}</div>}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-gray-400/40 font-semibold text-white"
                onClick={() => setView("details")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold"
              >
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        )}

        {view === "password" && (
          <form onSubmit={handlePwd} className="space-y-4">
            <div>
              <label className="text-sm text-gray-100 font-semibold mb-1 block">Old Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-white/30 border border-white/30 text-white placeholder-gray-300"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-100 font-semibold mb-1 block">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-white/30 border border-white/30 text-white placeholder-gray-300"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            {pwdMsg && <div className="text-sm text-center mt-2 text-teal-100">{pwdMsg}</div>}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-gray-400/40 font-semibold text-white"
                onClick={() => setView("details")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pwdSaving}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-pink-500 font-semibold"
              >
                {pwdSaving ? "Saving..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
