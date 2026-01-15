import React, { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import TestManagement from './components/Test_Management';
import ReportesManagement from './components/ReportesManagement';
import PatientsManagement from './components/PatientsManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = useCallback((userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
  }, []);

  const navigateTo = useCallback((view) => {
    setCurrentView(view);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'patients':
        return (
          <PatientsManagement
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case 'tests':
        return (
          <TestManagement 
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case 'reports':
        return (
          <ReportesManagement
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case 'admin':
        return (
          <Dashboard 
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard 
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
    }
  };

  return <div className="app-container">{renderView()}</div>;
}

export default App;