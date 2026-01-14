import React, { useState } from 'react';
import { 
  FlaskConical,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import UniversalNav from './UniversalNav';

// Datos iniciales de pruebas
const INITIAL_TESTS = [
  {
    id: 1,
    nombre: 'Embarazo',
    descripcion: 'Prueba rápida de detección de embarazo (hCG en orina)',
    subpruebas: ['hCG EN ORINA']
  },
  {
    id: 2,
    nombre: 'VIH',
    descripcion: 'Prueba rápida de detección del Virus de Inmunodeficiencia Humana',
    subpruebas: ['ANTICUERPOS VIH 1', 'ANTICUERPOS VIH 2']
  },
  {
    id: 3,
    nombre: 'Alcoholímetro',
    descripcion: 'Prueba de detección de alcohol en aliento',
    subpruebas: ['ALCOHOL EN ALIENTO']
  },
  {
    id: 4,
    nombre: 'Antidoping',
    descripcion: 'Perfil completo de drogas de abuso',
    subpruebas: ['CANABINOIDES', 'COCAINA', 'ANFETAMINAS', 'BENZODIAZEPINAS', 'BARBITURICOS']
  }
];

const TestManagement = ({ currentUser, onLogout, onNavigate }) => {
  const [tests, setTests] = useState(INITIAL_TESTS);

  const handleEditTest = (testId) => {
    console.log('Editar prueba:', testId);
    // TODO: Implementar modal de edición
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta prueba?')) {
      setTests(tests.filter(test => test.id !== testId));
    }
  };

  const handleNewTest = () => {
    console.log('Nueva prueba');
    // TODO: Implementar modal de nueva prueba
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNav 
        currentUser={currentUser}
        onLogout={onLogout}
        currentView="tests"
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-poppins flex items-center">
              <FlaskConical className="w-6 h-6 mr-2 text-gray-700" />
              Gestión de Pruebas
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-inter">
              Tipos de pruebas clínicas con sus subpruebas
            </p>
          </div>
          <button
            onClick={handleNewTest}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-poppins"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Prueba
          </button>
        </div>

        {/* Tests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Subpruebas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tests.map((test) => (
                  <tr 
                    key={test.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-poppins">
                        {test.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-inter">
                        {test.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {test.subpruebas.map((subprueba, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-inter"
                          >
                            {subprueba}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditTest(test.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-inter">
            <strong>Nota:</strong> Esta sección es solo para gestionar los tipos de pruebas disponibles. 
            Para generar reportes, ve a la sección de <strong>Reportes</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestManagement;