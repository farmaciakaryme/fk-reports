import { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/navigation/Dashboard';
import TestManagement from './components/Tests/TestsManagement';
import ReportesManagement from './components/reports/ReportesManagement';
import PatientsManagement from './components/patients/PatientsManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CARGAR SESIÓN AL INICIAR
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedUser = localStorage.getItem('fk_reports_user');
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error al cargar sesión:', error);
        localStorage.removeItem('fk_reports_user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // ✅ GUARDAR SESIÓN AL HACER LOGIN
  const handleLogin = useCallback((userData) => {
    try {
      localStorage.setItem('fk_reports_user', JSON.stringify(userData));
      // El token ya se guarda en authAPI.login
      setIsAuthenticated(true);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  }, []);

  // ✅ LIMPIAR SESIÓN AL HACER LOGOUT
  const handleLogout = useCallback(() => {
    localStorage.removeItem('fk_reports_user');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
  }, []);

  const navigateTo = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Mostrar loading mientras carga la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

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