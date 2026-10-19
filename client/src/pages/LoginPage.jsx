import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CloudSun, Shield, User, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-backdrop-glow"></div>
      
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="login-logo-glow">
            <CloudSun size={36} className="text-cyan animate-pulse" />
          </div>
          <h1 className="login-title">SkyCast & Admin Portal</h1>
          <p className="login-subtitle">
            Sign in to access real-time weather analytics and role-controlled features.
          </p>
        </div>

        {error && (
          <div className="alert-box error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="username-input"
                type="text"
                placeholder="Enter username (e.g. admin or user1)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-sm"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials demo box */}
        <div className="demo-credentials-box">
          <span className="demo-title">Quick Demo Logins:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-pill admin-pill"
              onClick={() => handleQuickFill('admin', 'admin')}
            >
              <Shield size={14} />
              <span>admin / admin</span>
            </button>
            <button
              type="button"
              className="btn-pill user-pill"
              onClick={() => handleQuickFill('user1', 'user1')}
            >
              <User size={14} />
              <span>user1 / user1</span>
            </button>
            <button
              type="button"
              className="btn-pill user-pill"
              onClick={() => handleQuickFill('user50', 'user50')}
            >
              <User size={14} />
              <span>user50 / user50</span>
            </button>
          </div>
          <div className="demo-notes">
            <p><strong>Admin:</strong> Weather + Users CRUD Management</p>
            <p><strong>User:</strong> Weather only (Restricted)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
