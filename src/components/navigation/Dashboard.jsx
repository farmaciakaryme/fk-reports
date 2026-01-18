/* eslint-disable react/prop-types */
import { 
  Users, 
  FlaskConical, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';
import UniversalNav from './UniversalNav';

const Dashboard = ({ currentUser, onLogout, onNavigate }) => {
  const menuItems = [
    {
      id: 'reports',
      title: 'Reportes',
      description: 'Crear reportes',
      detail: 'Generar y descargar PDFs profesionales',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      action: () => onNavigate('reports')
    },
    {
      id: 'patients',
      title: 'Pacientes',
      description: 'Gestionar pacientes',
      detail: 'Crear y administrar información de pacientes',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      action: () => onNavigate('patients')
    },
    {
      id: 'tests',
      title: 'Pruebas',
      description: 'Tipos de pruebas',
      detail: 'Antidoping, VIH, Embarazo, Alcoholímetro',
      icon: FlaskConical,
      color: 'from-purple-500 to-pink-500',
      action: () => onNavigate('tests')
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Administración',
      detail: 'Configuración del sistema y usuarios',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      action: () => console.log('Navigate to admin')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNav 
        currentUser={currentUser}
        onLogout={onLogout}
        currentView="dashboard"
        onNavigate={onNavigate}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3 font-poppins">
            Bienvenido, {currentUser.name.split(' ')[0]}
          </h2>
          <p className="text-lg text-gray-600 font-inter">
            Selecciona un módulo para comenzar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5">
                  <Icon className="w-full h-full text-gray-900" strokeWidth={1} />
                </div>
                
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 mb-3 font-inter">
                    {item.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-4 font-inter">
                    {item.detail}
                  </p>
                  
                  <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Acceder
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;