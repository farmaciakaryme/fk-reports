/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { FlaskConical, Plus, Loader2, AlertCircle } from 'lucide-react';
import UniversalNav from '../navigation/UniversalNav';
import { pruebasAPI } from '../../services/api';
import TestModal from './components/modaltest';
import TestsTable from './components/TestsTable';

const TestManagement = ({ currentUser, onLogout, onNavigate }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentTest, setCurrentTest] = useState(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pruebasAPI.getAll({ limit: 100, activo: 'true' });
      setTests(response.data || []);
    } catch (err) {
      setError('Error al cargar las pruebas: ' + err.message);
      console.error('Error loading tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTest = () => {
    setModalMode('create');
    setCurrentTest(null);
    setShowModal(true);
  };

  const handleEditTest = async (test) => {
    setModalMode('edit');
    try {
      const response = await pruebasAPI.getById(test._id);
      setCurrentTest(response.data);
      setShowModal(true);
    } catch (err) {
      alert('Error al cargar la prueba: ' + err.message);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta prueba?')) {
      return;
    }

    try {
      await pruebasAPI.delete(testId);
      await loadTests();
      alert('Prueba eliminada exitosamente');
    } catch (err) {
      alert('Error al eliminar la prueba: ' + err.message);
    }
  };

  const handleSaveTest = async (testData) => {
    try {
      if (modalMode === 'create') {
        await pruebasAPI.create(testData);
        alert('Prueba creada exitosamente');
      } else {
        await pruebasAPI.update(currentTest._id, testData);
        alert('Prueba actualizada exitosamente');
      }
      setShowModal(false);
      await loadTests();
    } catch (err) {
      throw new Error('Error al guardar la prueba: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-inter">Cargando pruebas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNav 
        currentUser={currentUser}
        onLogout={onLogout}
        currentView="tests"
        onNavigate={onNavigate}
      />

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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 font-poppins">Error</h3>
              <p className="text-sm text-red-700 font-inter mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tests Table */}
        <TestsTable 
          tests={tests}
          onEdit={handleEditTest}
          onDelete={handleDeleteTest}
        />

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-inter">
            <strong>Nota:</strong> Esta sección es solo para gestionar los tipos de pruebas disponibles. 
            Para generar reportes, ve a la sección de <strong>Reportes</strong>.
          </p>
        </div>
      </div>

      {/* Modal para Crear/Editar Prueba */}
      {showModal && (
        <TestModal
          mode={modalMode}
          test={currentTest}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTest}
        />
      )}
    </div>
  );
};

export default TestManagement;