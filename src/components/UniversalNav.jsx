import React, { useState } from 'react';
import { 
  Activity,
  LogOut,
  LayoutDashboard,
  FlaskConical,
  Users,
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';

const UniversalNav = ({ currentUser, onLogout, currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tests', label: 'Pruebas', icon: FlaskConical },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'admin', label: 'Admin', icon: Settings }
  ];

  const handleNavigation = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-poppins">
                  FK-REPORTS
                </h1>
                <p className="text-xs text-gray-500 font-inter hidden sm:block">
                  Sistema de Gestión de Reportes Clínicos
                </p>
              </div>
            </div>

            {/* Desktop User Info & Logout */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 font-poppins">
                  Usuario
                </p>
                <p className="text-xs text-gray-500 font-inter">
                  {currentUser.email}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-semibold text-sm">
                  DE
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors font-inter ${
                    isActive
                      ? 'text-gray-900 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-semibold text-sm">
                  DE
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 font-poppins">
                  Usuario
                </p>
                <p className="text-xs text-gray-500 font-inter truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors font-inter ${
                    isActive
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-inter"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UniversalNav;