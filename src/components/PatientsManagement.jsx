import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Eye, Edit2, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import UniversalNav from './UniversalNav';
import { pacientesAPI } from '../services/api';

// Modal de nuevo/editar paciente
const PatientModal = ({ isOpen, onClose, onSave, patient = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    curp: '',
    numeroExpediente: '',
    direccion: '',
    fechaNacimiento: '',
    alergias: '',
    enfermedadesCronicas: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (patient) {
      setFormData({
        nombre: patient.nombre || '',
        edad: patient.edad || '',
        genero: patient.genero || 'masculino',
        telefono: patient.telefono || '',
        email: patient.email || '',
        curp: patient.curp || '',
        numeroExpediente: patient.numeroExpediente || '',
        direccion: patient.direccion || '',
        fechaNacimiento: patient.fechaNacimiento ? patient.fechaNacimiento.split('T')[0] : '',
        alergias: patient.alergias || '',
        enfermedadesCronicas: patient.enfermedadesCronicas || ''
      });
    }
  }, [patient]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const validateForm = () => {
    const validationErrors = [];
    if (!formData.nombre.trim()) validationErrors.push('Nombre completo');
    if (!formData.edad) validationErrors.push('Edad');
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
      await onSave(formData);
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      alert('Error al guardar el paciente: ' + error.message);
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
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
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

            <p className="text-sm text-gray-600 font-inter">
              Completa los datos del {patient ? 'paciente' : 'nuevo paciente'}
            </p>

            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Juan Pérez García"
              />
            </div>

            {/* Edad y Género */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad *
                </label>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => handleChange('edad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                  min="0"
                  max="150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  value={formData.genero}
                  onChange={(e) => handleChange('genero', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Teléfono y Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5512345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            {/* CURP y Número de Expediente */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CURP
                </label>
                <input
                  type="text"
                  value={formData.curp}
                  onChange={(e) => handleChange('curp', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CURP180XXXXXXXX"
                  maxLength="18"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Expediente
                </label>
                <input
                  type="text"
                  value={formData.numeroExpediente}
                  onChange={(e) => handleChange('numeroExpediente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="EXP-001"
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento (opcional)
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección (opcional)
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Calle, número, colonia, ciudad..."
              />
            </div>

            {/* Alergias */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alergias (opcional)
              </label>
              <textarea
                value={formData.alergias}
                onChange={(e) => handleChange('alergias', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Penicilina, polen, etc..."
              />
            </div>

            {/* Enfermedades Crónicas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enfermedades crónicas (opcional)
              </label>
              <textarea
                value={formData.enfermedadesCronicas}
                onChange={(e) => handleChange('enfermedadesCronicas', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Diabetes, hipertensión, etc..."
              />
            </div>
          </div>

          {/* Footer con botones */}
          <div className="border-t p-4 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
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

// Componente principal de gestión de pacientes
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
        activo: 'true'
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
        // Actualizar paciente existente
        await pacientesAPI.update(selectedPatient._id, patientData);
        alert('Paciente actualizado exitosamente');
      } else {
        // Crear nuevo paciente
        await pacientesAPI.create(patientData);
        alert('Paciente creado exitosamente');
      }
      
      setShowModal(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
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
        alert('Paciente eliminado exitosamente');
        fetchPatients();
      } catch (err) {
        console.error('Error al eliminar paciente:', err);
        alert('Error al eliminar el paciente: ' + err.message);
      }
    }
  };

  const filteredPatients = patients.filter(patient => {
    const search = searchTerm.toLowerCase();
    return (
      patient.nombre?.toLowerCase().includes(search) ||
      patient.telefono?.toLowerCase().includes(search) ||
      patient.numeroExpediente?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNav
        currentUser={currentUser}
        onLogout={onLogout}
        currentView="patients"
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-bold text-gray-900 font-poppins">Gestión de Pacientes</h1>
              </div>
              <p className="text-sm text-gray-600 font-inter">Administra los pacientes y sus historiales</p>
            </div>
            <button
              onClick={() => {
                setSelectedPatient(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium font-poppins"
            >
              <Plus className="w-4 h-4" />
              Nuevo Paciente
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-inter"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-inter">{error}</p>
            </div>
          )}

          {/* Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-inter">
              Mostrando {filteredPatients.length} de {totalPatients} pacientes
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">
                    Edad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">
                    Pruebas Aplicadas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">
                    Última Visita
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-inter">Cargando pacientes...</p>
                    </td>
                  </tr>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-inter">{patient.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-inter">{patient.edad ? `${patient.edad} años` : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-inter">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          VIH
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-inter">
                        {formatDate(patient.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => console.log('Ver paciente', patient)}
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleEdit(patient)}
                            className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                            title="Editar paciente"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient)}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                            title="Eliminar paciente"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-inter">No hay pacientes registrados</p>
                      <p className="text-gray-400 text-xs mt-1 font-inter">Crea tu primer paciente</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPatients > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 font-inter">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-inter">
            <strong>Conexión segura:</strong> Tus datos están protegidos con cifrado y Row Level Security (RLS).
            Solo tú puedes ver tu información.
          </p>
        </div>
      </div>

      {/* Modal */}
      <PatientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPatient(null);
        }}
        onSave={handleSavePatient}
        patient={selectedPatient}
      />
    </div>
  );
};

export default PatientsManagement;