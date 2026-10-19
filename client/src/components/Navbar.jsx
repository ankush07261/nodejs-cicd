import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CloudSun, Users, LogOut, ShieldCheck, User } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab('weather')}>
          <div className="brand-icon">
            <CloudSun size={26} className="text-cyan" />
          </div>
          <div className="brand-text">
            <span className="brand-title">SkyCast</span>
            <span className="brand-subtitle">Fullstack Portal</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            id="nav-weather-btn"
            className={`nav-btn ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            <CloudSun size={18} />
            <span>Weather</span>
          </button>

          {/* Admin-only menu item */}
          {isAdmin && (
            <button
              id="nav-users-btn"
              className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span>Users Management</span>
              <span className="badge-admin">Admin</span>
            </button>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="nav-user-section">
          <div className="user-profile-badge">
            <div className={`avatar-icon ${isAdmin ? 'admin-avatar' : 'user-avatar'}`}>
              {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className={`role-pill ${isAdmin ? 'role-admin' : 'role-user'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            id="nav-logout-btn"
            className="btn-logout"
            onClick={logout}
            title="Sign out"
          >
            <LogOut size={18} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
