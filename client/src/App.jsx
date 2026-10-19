import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { WeatherPage } from './pages/WeatherPage';
import { UsersPage } from './pages/UsersPage';

function MainApp() {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('weather');

  if (loading) {
    return (
      <div className="app-loader">
        <div className="spinner-lg"></div>
        <p>Loading SkyCast Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Ensure normal user cannot be trapped on 'users' tab
  const currentTab = !isAdmin && activeTab === 'users' ? 'weather' : activeTab;

  return (
    <div className="app-layout">
      <Navbar activeTab={currentTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {currentTab === 'weather' && <WeatherPage />}
        {currentTab === 'users' && isAdmin && <UsersPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
