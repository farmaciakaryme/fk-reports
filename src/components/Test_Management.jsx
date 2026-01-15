import React, { useState, useEffect } from 'react';
import { 
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import UniversalNav from './UniversalNav';
import { pruebasAPI } from '../services/api';

const TestManagement = ({ currentUser, onLogout, onNavigate }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [currentTest, setCurrentTest] = useState(null);
  const [saving, setSaving] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '', // Se generará automáticamente
    categoria: 'general',
    subPruebas: [],
    camposAdicionales: []
  });

  // Estado para subprueba temporal
  const [tempSubPrueba, setTempSubPrueba] = useState({
    nombre: '',
    descripcion: ''
  });

  // Estado para campo adicional temporal
  const [tempCampo, setTempCampo] = useState({
    nombre: '',
    etiqueta: '',
    tipo: 'text' // Cambiado de 'texto' a 'text'
  });

  // Cargar pruebas al montar el componente
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
    setFormData({
      nombre: '',
      descripcion: '',
      codigo: '',
      categoria: 'general',
      subPruebas: [],
      camposAdicionales: []
    });
    setShowModal(true);
  };

  const handleEditTest = async (test) => {
    setModalMode('edit');
    setCurrentTest(test);
    
    // Cargar datos completos de la prueba
    try {
      const response = await pruebasAPI.getById(test._id);
      const fullTest = response.data;
      
      setFormData({
        nombre: fullTest.nombre || '',
        descripcion: fullTest.descripcion || '',
        codigo: fullTest.codigo || '',
        categoria: fullTest.categoria || 'general',
        subPruebas: fullTest.subPruebas || [],
        camposAdicionales: fullTest.camposAdicionales || []
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre de la prueba es obligatorio');
      return;
    }

    // Generar código automático si no existe
    const dataToSend = { ...formData };
    if (!dataToSend.codigo || dataToSend.codigo.trim() === '') {
      // Generar código basado en la categoría y el nombre
      const categoria = dataToSend.categoria.substring(0, 3).toUpperCase();
      const nombre = dataToSend.nombre
        .substring(0, 4)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z]/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      dataToSend.codigo = `${categoria}-${nombre}${random}`;
    }

    setSaving(true);
    try {
      if (modalMode === 'create') {
        await pruebasAPI.create(dataToSend);
        alert('Prueba creada exitosamente');
      } else {
        await pruebasAPI.update(currentTest._id, dataToSend);
        alert('Prueba actualizada exitosamente');
      }
      
      setShowModal(false);
      await loadTests();
    } catch (err) {
      alert('Error al guardar la prueba: ' + err.message);
      console.error('Error completo:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubPrueba = () => {
    if (!tempSubPrueba.nombre.trim()) {
      alert('El nombre de la subprueba es obligatorio');
      return;
    }

    // Generar clave automática basada en el nombre
    const clave = tempSubPrueba.nombre
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^A-Z0-9]/g, '_') // Reemplazar caracteres especiales con _
      .replace(/_+/g, '_') // Múltiples _ a uno solo
      .replace(/^_|_$/g, ''); // Quitar _ al inicio y final

    setFormData({
      ...formData,
      subPruebas: [
        ...formData.subPruebas,
        {
          clave: clave,
          nombre: tempSubPrueba.nombre,
          descripcion: tempSubPrueba.descripcion || '',
          unidad: '',
          valorReferencia: '',
          metodo: ''
        }
      ]
    });

    setTempSubPrueba({ nombre: '', descripcion: '' });
  };

  const handleRemoveSubPrueba = (index) => {
    setFormData({
      ...formData,
      subPruebas: formData.subPruebas.filter((_, i) => i !== index)
    });
  };

  const handleAddCampoAdicional = () => {
    if (!tempCampo.nombre.trim() || !tempCampo.etiqueta.trim()) {
      alert('El nombre y la etiqueta del campo son obligatorios');
      return;
    }

    // Generar clave automática basada en el nombre
    const clave = tempCampo.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-z0-9]/g, '_') // Reemplazar caracteres especiales con _
      .replace(/_+/g, '_') // Múltiples _ a uno solo
      .replace(/^_|_$/g, ''); // Quitar _ al inicio y final

    setFormData({
      ...formData,
      camposAdicionales: [
        ...formData.camposAdicionales,
        {
          clave: clave,
          nombre: tempCampo.nombre,
          etiqueta: tempCampo.etiqueta,
          tipo: tempCampo.tipo,
          requerido: false
        }
      ]
    });

    setTempCampo({ nombre: '', etiqueta: '', tipo: 'text' });
  };

  const handleRemoveCampoAdicional = (index) => {
    setFormData({
      ...formData,
      camposAdicionales: formData.camposAdicionales.filter((_, i) => i !== index)
    });
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Código
                  </th>
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
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-inter">
                      No hay pruebas registradas. Crea una nueva prueba para comenzar.
                    </td>
                  </tr>
                ) : (
                  tests.map((test) => (
                    <tr 
                      key={test._id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {test.codigo || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-poppins">
                          {test.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-inter max-w-md truncate">
                          {test.descripcion || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {test.subPruebas && test.subPruebas.length > 0 ? (
                            test.subPruebas.slice(0, 3).map((subprueba, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-inter"
                              >
                                {subprueba.nombre}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 font-inter">
                              Sin subpruebas
                            </span>
                          )}
                          {test.subPruebas && test.subPruebas.length > 3 && (
                            <span className="text-xs text-gray-500 font-inter">
                              +{test.subPruebas.length - 3} más
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditTest(test)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* Modal para Crear/Editar Prueba */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 font-poppins">
                {modalMode === 'create' ? 'Nueva Prueba' : 'Editar Prueba'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información General */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 font-poppins">
                  Información General
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                      Nombre de la Prueba *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                      placeholder="Ej: Antidoping, Alcoholímetro, VIH"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                      Descripción *
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                      rows="3"
                      placeholder="Describe brevemente esta prueba..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                      Categoría
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    >
                      <option value="general">General</option>
                      <option value="toxicologia">Toxicología</option>
                      <option value="hematologia">Hematología</option>
                      <option value="microbiologia">Microbiología</option>
                      <option value="inmunologia">Inmunología</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-inter">
                      <strong>Nota:</strong> El código de la prueba se generará automáticamente al guardar
                    </p>
                  </div>
                </div>
              </div>

              {/* Subpruebas */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 font-poppins flex items-center">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Subpruebas (Análisis que incluye esta prueba)
                </h4>

                {/* Lista de subpruebas */}
                {formData.subPruebas.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {formData.subPruebas.map((subprueba, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                              {subprueba.clave}
                            </span>
                            <p className="text-sm font-medium text-gray-900 font-poppins">
                              {subprueba.nombre}
                            </p>
                          </div>
                          {subprueba.descripcion && (
                            <p className="text-xs text-gray-600 font-inter mt-1">
                              {subprueba.descripcion}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubPrueba(index)}
                          className="ml-4 p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar subprueba */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={tempSubPrueba.nombre}
                      onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, nombre: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter text-sm"
                      placeholder="Nombre de la subprueba *"
                    />
                    <input
                      type="text"
                      value={tempSubPrueba.descripcion}
                      onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, descripcion: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter text-sm"
                      placeholder="Descripción (opcional)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-inter">
                    La clave se generará automáticamente a partir del nombre
                  </p>
                  <button
                    type="button"
                    onClick={handleAddSubPrueba}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-poppins"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Subprueba
                  </button>
                </div>
              </div>

              {/* Campos Adicionales */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 font-poppins">
                  Campos Adicionales (Opcional - Datos extra del reporte)
                </h4>

                {/* Lista de campos adicionales */}
                {formData.camposAdicionales.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {formData.camposAdicionales.map((campo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-purple-50 px-4 py-3 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 font-poppins">
                            {campo.etiqueta}
                          </p>
                          <p className="text-xs text-gray-600 font-inter mt-1">
                            Nombre: {campo.nombre} • Tipo: {campo.tipo}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCampoAdicional(index)}
                          className="ml-4 p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar campo adicional */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={tempCampo.nombre}
                      onChange={(e) => setTempCampo({ ...tempCampo, nombre: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Nombre técnico *"
                    />
                    <input
                      type="text"
                      value={tempCampo.etiqueta}
                      onChange={(e) => setTempCampo({ ...tempCampo, etiqueta: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter text-sm"
                      placeholder="Etiqueta visible *"
                    />
                    <select
                      value={tempCampo.tipo}
                      onChange={(e) => setTempCampo({ ...tempCampo, tipo: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter text-sm"
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="date">Fecha</option>
                      <option value="select">Selección</option>
                      <option value="textarea">Área de texto</option>
                      <option value="checkbox">Casilla</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 font-inter">
                    La clave se generará automáticamente a partir del nombre técnico
                  </p>
                  <button
                    type="button"
                    onClick={handleAddCampoAdicional}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-poppins"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Campo
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-poppins"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-poppins flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Crear Prueba' : 'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManagement;