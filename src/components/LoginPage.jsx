import React, { useState } from 'react';
import { Activity, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validación básica
      if (!credentials.email || !credentials.password) {
        setError('Por favor completa todos los campos');
        setIsLoading(false);
        return;
      }

      // Llamada a la API real
      const response = await authAPI.login(credentials.email, credentials.password);
      
      // La API devuelve: { success, message, token, user }
      // Datos del usuario de la respuesta
      const userData = {
        id: response.user.id,
        name: response.user.nombre,
        email: response.user.email,
        role: response.user.rol,
        telefono: response.user.telefono,
        cedula: response.user.cedula,
        especialidad: response.user.especialidad,
        token: response.token
      };

      // Callback con los datos del usuario
      onLogin(userData);
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  // Función para auto-completar credenciales de demo
  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setCredentials({
        email: 'arturdar16@gmail.com',
        password: 'Prime175'
      });
    } else if (type === 'laboratorista') {
      setCredentials({
        email: 'linitomm@gmail.com',
        password: 'lin123'
      });
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl mb-4 shadow-2xl">
            <Activity className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-poppins">
            FK-REPORTS
          </h1>
          <p className="text-blue-200 text-sm font-inter">
            Sistema de Gestión de Reportes Clínicos
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center font-poppins">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-inter">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-inter"
                placeholder="usuario@ejemplo.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-inter"
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-poppins"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-3 font-inter text-center">
              Credenciales de prueba:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors font-inter disabled:opacity-50 text-left"
              >
                🔐 <strong>Admin:</strong> arturdar16@gmail.com
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('laboratorista')}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors font-inter disabled:opacity-50 text-left"
              >
                👨‍⚕️ <strong>Laboratorista:</strong> linitomm@gmail.com
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm font-inter">
            Sistema seguro con cifrado Row Level Security
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;