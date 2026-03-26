import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import "./Topbar.css";

const Topbar = ({ onSaveClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="topbar">

      {/* Mobile Logo */}
      <div className="topbar-mobile-logo">
        <Link to="/home">
          <img src="/logo.png" alt="MemoryOS" className="mobile-logo-img" />
        </Link>
      </div>

      {/* Left side (Desktop Search) */}
      <div className="topbar-left">
        <div className="global-search-wrapper">
          <Search size={16} className="search-icon" />

          <input
            type="text"
            placeholder="Global search..."
            className="global-search-input"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="topbar-right">

        <button
          className="add-save-btn"
          onClick={onSaveClick ? onSaveClick : () => navigate("/save")}
        >
          <Plus size={18} />
          <span>Save</span>
        </button>

        <button 
          className="icon-btn theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <div className="user-avatar-wrapper">
          <div className="user-avatar">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
        </div>

      </div>

    </header>
  );
};

export default Topbar;