import React, { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { pacientesAPI } from '../services/api';

const PatientSearchModal = ({ onClose, onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filtrar pacientes mientras el usuario escribe
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
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

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
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
        </div>

        {/* Patient List */}
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 font-inter">
            💡 <strong>Tip:</strong> Escribe el nombre, número de expediente o CURP del paciente para filtrar los resultados
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchModal;