import React from "react";
import { Plus, Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { motion } from 'framer-motion';
import "./Topbar.css";

const Topbar = ({ onSaveClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-spacer"></div>

      {/* Right side */}
      <div className="topbar-right">

        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="add-save-btn"
          onClick={onSaveClick}
        >
          <Plus size={18} />
          <span>Save</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9, rotate: -15 }}
          className="icon-btn theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="icon-btn"
        >
          <Bell size={20} />
        </motion.button>

        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="user-avatar-wrapper"
        >
          <div className="user-avatar">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
        </motion.div>

      </div>
    </header>
  );
};

export default Topbar;