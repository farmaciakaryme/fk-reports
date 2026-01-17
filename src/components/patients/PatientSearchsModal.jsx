/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Search, X, User, Plus } from 'lucide-react';
import { pacientesAPI } from '../../services/api';

const PatientSearchsModal = ({ onClose, onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    nombre: '',
    edad: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => {
        const search = searchTerm.toLowerCase();
        return (
          patient.nombre?.toLowerCase().includes(search) ||
          patient.numeroExpediente?.toLowerCase().includes(search) ||
          patient.curp?.toLowerCase().includes(search)
        );
      });
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await pacientesAPI.getAll({ limit: 100 });
      setPatients(response.data || []);
      setFilteredPatients(response.data || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatientData.nombre || !newPatientData.edad) {
      alert('Por favor completa nombre y edad');
      return;
    }

    setIsSaving(true);
    try {
      // ⭐ Calcular fechaNacimiento desde edad
      const edad = parseInt(newPatientData.edad);
      const hoy = new Date();
      const fechaNacimiento = new Date(
        hoy.getFullYear() - edad,
        hoy.getMonth(),
        hoy.getDate()
      );

      const response = await pacientesAPI.create({
        nombre: newPatientData.nombre,
        edad: edad,
        fechaNacimiento: fechaNacimiento.toISOString().split('T')[0] // YYYY-MM-DD
      });
      
      onSelectPatient(response.data);
    } catch (error) {
      console.error('Error al crear paciente:', error);
      alert('Error al crear paciente. ' + (error.message || 'Intenta de nuevo.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <h2 className="text-lg font-semibold font-poppins">Crear Paciente Nuevo</h2>
            </div>
            <button
              onClick={() => setShowCreateForm(false)}
              disabled={isSaving}
              className="p-1 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 font-inter">
              Completa los datos básicos del nuevo paciente
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={newPatientData.nombre}
                onChange={(e) => setNewPatientData({...newPatientData, nombre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Juan Pérez García"
                autoFocus
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad *
              </label>
              <input
                type="number"
                value={newPatientData.edad}
                onChange={(e) => setNewPatientData({...newPatientData, edad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="30"
                min="0"
                max="150"
                disabled={isSaving}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-inter">
                ℹ️ Podrás completar más información del paciente después desde "Gestión de Pacientes"
              </p>
            </div>
          </div>

          <div className="p-4 border-t flex items-center justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreatePatient}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <span>Crear y Continuar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">
              Seleccionar Paciente
            </h2>
            <p className="text-sm text-gray-600 font-inter">
              Busca y selecciona el paciente para esta prueba
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, expediente o CURP..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-inter"
              autoFocus
            />
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Crear Paciente Nuevo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 font-inter">Cargando pacientes...</p>
              </div>
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient._id}
                  onClick={() => onSelectPatient(patient)}
                  className="w-full p-3 border border-gray-200 rounded-lg text-left hover:bg-blue-50 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 font-poppins truncate">
                        {patient.nombre}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-600 font-inter">
                          <span className="font-medium">Exp:</span> {patient.numeroExpediente || 'N/A'}
                        </p>
                        {patient.curp && (
                          <p className="text-xs text-gray-600 font-inter">
                            <span className="font-medium">CURP:</span> {patient.curp}
                          </p>
                        )}
                      </div>
                      {patient.edad && (
                        <p className="text-xs text-gray-500 font-inter mt-1">
                          Edad: {patient.edad} años
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <User className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-inter text-center">
                {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-400 font-inter mt-1">
                  Intenta con otro término de búsqueda
                </p>
              )}
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Crear Paciente Nuevo
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 font-inter">
            💡 <strong>Tip:</strong> Escribe el nombre, número de expediente o CURP del paciente para filtrar los resultados
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchsModal;