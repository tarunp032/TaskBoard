import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 backdrop-blur-lg bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-purple-800/70 border-b border-white/20 shadow-xl z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="text-3xl font-extrabold bg-gradient-to-r from-blue-300 via-teal-300 to-purple-300 bg-clip-text text-transparent tracking-wide drop-shadow-sm"
        >
          Task<span className="text-white">Manager</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 text-sm font-semibold">
          {[
            { name: "Dashboard", to: "/dashboard" },
            { name: "Inbox", to: "/tasks-to-me" },
            { name: "Outbox", to: "/tasks-by-me" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative group text-gray-200 hover:text-white transition-colors"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 text-gray-100 text-sm font-medium shadow-md">
            👋 <span className="truncate max-w-[120px]">{user?.name}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.07, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-400 px-5 py-2 rounded-full font-semibold text-white shadow-md hover:shadow-red-500/40 transition-all duration-300"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;
