import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Home,
  Inbox,
  Send,
  User,
  LogOut,
} from "lucide-react";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-container">
      <div className="header-content">
        {/* Logo */}
        <Link to="/dashboard" className="header-logo">
          <motion.div
            className="logo-icon"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <CheckSquare size={32} />
          </motion.div>
          <span className="logo-text">
            Task<span className="logo-highlight">Board</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          {[
            { name: "Dashboard", to: "/dashboard", icon: Home },
            { name: "Inbox", to: "/tasks-to-me", icon: Inbox },
            { name: "Outbox", to: "/tasks-by-me", icon: Send },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? "nav-link-active" : ""}`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="header-actions">
          {/* User */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="user-profile"
            onClick={() => navigate("/profile")}
          >
            <div className="user-avatar">
              <User size={18} />
            </div>
            <span className="user-name">{user?.name}</span>
          </motion.div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>

      <style>{`
        .header-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* Logo */
        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: transform 0.3s;
        }
        .header-logo:hover {
          transform: translateY(-2px);
        }
        .logo-icon {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }
        .logo-text {
          font-size: 28px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.5px;
        }
        .logo-highlight {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Navigation */
        .header-nav {
          display: flex;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-2px);
        }
        .nav-link-active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-color: rgba(139, 92, 246, 0.5);
          color: white;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        /* Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .user-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
          transition: all 0.3s;
        }
        .logout-btn:hover {
          box-shadow: 0 6px 24px rgba(239, 68, 68, 0.5);
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .header-nav { gap: 4px; }
          .nav-link { padding: 8px 16px; font-size: 14px; }
        }
        @media (max-width: 768px) {
          .header-content { gap: 16px; }
          .header-nav { display: none; }
          .logo-text { font-size: 24px; }
          .user-name { display: none; }
          .logout-btn span { display: none; }
        }
        @media (max-width: 640px) {
          .header-content { padding: 12px 16px; }
          .logo-icon { width: 36px; height: 36px; }
          .user-profile { padding: 8px 12px;}
          .logout-btn { padding: 8px 12px;}
        }
      `}</style>
    </header>
  );
};

export default Header;
