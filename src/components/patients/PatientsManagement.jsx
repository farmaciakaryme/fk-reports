/* eslint-disable react/prop-types */
/* eslint-disable no-useless-catch */
import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import UniversalNav from '../navigation/UniversalNav';
import { pacientesAPI } from '../../services/api';

// Modal de nuevo/editar paciente
const PatientModal = ({ isOpen, onClose, onSave, patient = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    edad: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (patient) {
      // Cargar datos del paciente a editar
      setFormData({
        nombre: patient.nombre || '',
        edad: patient.edad || ''
      });
    } else {
      // Limpiar formulario para nuevo paciente
      setFormData({
        nombre: '',
        edad: ''
      });
    }
    // Limpiar errores al cambiar de paciente
    setErrors([]);
  }, [patient]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const validateForm = () => {
    const validationErrors = [];
    if (!formData.nombre.trim()) validationErrors.push('Nombre completo');
    if (!formData.edad || formData.edad < 0) validationErrors.push('Edad válida');
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        edad: parseInt(formData.edad)
      };

      await onSave(dataToSend);
    } catch (error) {
      console.error('❌ Error al guardar paciente:', error);
      alert('Error al guardar el paciente: ' + error.message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold font-poppins">
            {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-4">
            {errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700 font-medium text-sm">
                    Completa los siguientes campos obligatorios:
                  </span>
                </div>
                <ul className="text-xs text-red-600 list-disc list-inside ml-7">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Juan Pérez García"
                autoFocus
              />
            </div>

            {/* Edad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad *
              </label>
              <input
                type="number"
                value={formData.edad}
                onChange={(e) => handleChange('edad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="30"
                min="0"
                max="150"
              />
            </div>

            {/* Separador */}
            <div className="border-t border-gray-300 pt-4 mt-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                  🚧 Campos adicionales (Próxima versión)
                </span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 font-inter">
                <strong>ℹ️ Nota:</strong> Por ahora solo se utilizan <strong>Nombre</strong> y <strong>Edad</strong>. 
                Los campos adicionales mostrados abajo estarán disponibles en próximas actualizaciones.
              </p>
            </div>

            {/* Campos deshabilitados */}
            <div className="space-y-4 opacity-40">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Género <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Próximamente</span>
                </label>
                <select disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed">
                  <option>Masculino</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
                  <input disabled placeholder="Próximamente" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input disabled placeholder="Próximamente" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">CURP</label>
                  <input disabled placeholder="Próximamente" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Número de Expediente</label>
                  <input disabled placeholder="Próximamente" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
                <textarea disabled rows={2} placeholder="Próximamente" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Alergias</label>
                <textarea disabled rows={2} placeholder="Próximamente" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Enfermedades crónicas</label>
                <textarea disabled rows={2} placeholder="Próximamente" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"></textarea>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{patient ? 'Actualizar' : 'Crear'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal
const PatientsManagement = ({ currentUser, onLogout, onNavigate }) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pacientesAPI.getAll({
        page: currentPage,
        limit: 10,
        activo: 'all',
        sort: '-createdAt'
      });

      setPatients(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalPatients(response.pagination?.total || 0);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError(err.message);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (selectedPatient) {
        await pacientesAPI.update(selectedPatient._id, patientData);
        alert('✅ Paciente actualizado exitosamente');
      } else {
        await pacientesAPI.create(patientData);
        alert('✅ Paciente creado exitosamente');
      }
      
      setShowModal(false);
      setSelectedPatient(null);
      await fetchPatients();
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error al guardar: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleDelete = async (patient) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${patient.nombre}?`)) {
      try {
        await pacientesAPI.delete(patient._id);
        alert('✅ Paciente eliminado exitosamente');
        fetchPatients();
      } catch (err) {
        alert('❌ Error al eliminar el paciente: ' + err.message);
      }
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNav currentUser={currentUser} onLogout={onLogout} currentView="patients" onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-bold text-gray-900 font-poppins">Gestión de Pacientes</h1>
              </div>
              <p className="text-sm text-gray-600 font-inter">Administra pacientes (Nombre y Edad)</p>
            </div>
            <button onClick={() => { setSelectedPatient(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              Nuevo Paciente
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600">Mostrando {filteredPatients.length} de {totalPatients} pacientes</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Edad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha Registro</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Cargando pacientes...</p>
                    </td>
                  </tr>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{patient.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{patient.edad ? `${patient.edad} años` : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(patient.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(patient)} className="p-1.5 hover:bg-blue-100 rounded" title="Editar">
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button onClick={() => handleDelete(patient)} className="p-1.5 hover:bg-red-100 rounded" title="Eliminar">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No hay pacientes registrados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPatients > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50">
                Anterior
              </button>
              <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50">
                Siguiente
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>📝 Versión actual:</strong> Solo se manejan <strong>Nombre</strong> y <strong>Edad</strong>. 
            Los campos adicionales estarán disponibles en próximas actualizaciones.
          </p>
        </div>
      </div>

      <PatientModal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedPatient(null); }} onSave={handleSavePatient} patient={selectedPatient} />
    </div>
  );
};

export default PatientsManagement;