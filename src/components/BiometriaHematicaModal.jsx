import React, { useState, useCallback } from 'react';
import { ArrowLeft, Download, AlertCircle, Save } from 'lucide-react';
import PatientSearchModal from './PatientSearchModal';

// Definir las pruebas de Biometría Hemática con valores de referencia
const BIOMETRIA_TESTS = [
  { key: 'hemoglobina', label: 'Hemoglobina', unidad: 'g/dL', referencia: 'H: 13.5-17.5, M: 12.0-16.0' },
  { key: 'hematocrito', label: 'Hematocrito', unidad: '%', referencia: 'H: 40-54, M: 37-47' },
  { key: 'leucocitos', label: 'Leucocitos', unidad: 'x10³/µL', referencia: '4.5-11.0' },
  { key: 'eritrocitos', label: 'Eritrocitos', unidad: 'x10⁶/µL', referencia: 'H: 4.5-5.9, M: 4.0-5.2' },
  { key: 'plaquetas', label: 'Plaquetas', unidad: 'x10³/µL', referencia: '150-400' },
  { key: 'vcm', label: 'VCM', unidad: 'fL', referencia: '80-100' },
  { key: 'hcm', label: 'HCM', unidad: 'pg', referencia: '27-31' },
  { key: 'chcm', label: 'CHCM', unidad: 'g/dL', referencia: '32-36' },
  { key: 'neutrofilos', label: 'Neutrófilos', unidad: '%', referencia: '40-70' },
  { key: 'linfocitos', label: 'Linfocitos', unidad: '%', referencia: '20-40' },
  { key: 'monocitos', label: 'Monocitos', unidad: '%', referencia: '2-8' },
  { key: 'eosinofilos', label: 'Eosinófilos', unidad: '%', referencia: '1-4' },
  { key: 'basofilos', label: 'Basófilos', unidad: '%', referencia: '0-1' }
];

// Componente de Vista Previa del Reporte
const BiometriaReport = ({ formData, selectedPatient, onBack, onSaveAndPrint, isSaving }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        
        {/* Header con botones - NO se imprime */}
        <div className="flex-shrink-0 bg-gray-50 border-b p-3 print:hidden">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Volver</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Imprimir</span>
              </button>
              <button
                onClick={onSaveAndPrint}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Guardar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del reporte - SE IMPRIME */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0">
          <div className="max-w-4xl mx-auto bg-white print:shadow-none">
            <div className="space-y-4 print:space-y-3">
              
              {/* Header */}
              <div className="border-b-2 border-blue-600 pb-3 print:pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 print:w-10 print:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="text-white font-bold text-xs print:text-[10px]">SALUD</div>
                    </div>
                    <div>
                      <h1 className="text-lg print:text-base font-bold text-gray-800 leading-tight">"SALUD AL ALCANCE DE TODOS"</h1>
                      <p className="text-sm print:text-xs text-gray-600">Laboratorio Médico Especializado</p>
                    </div>
                  </div>
                  <div className="text-right text-sm print:text-xs text-gray-500">
                    <p>Folio: #{Math.floor(Math.random() * 10000)}</p>
                    <p>Fecha: {formatDate(formData.fecha)}</p>
                  </div>
                </div>
              </div>

              {/* Información del Paciente */}
              <div className="bg-gray-50 print:bg-gray-100 rounded-lg p-4 print:p-3">
                <h2 className="text-sm print:text-xs font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">INFORMACIÓN DEL PACIENTE</h2>
                <div className="grid grid-cols-2 gap-3 print:gap-2 text-sm print:text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Paciente:</span>
                    <p className="text-gray-800 font-medium">{selectedPatient?.nombre || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fecha:</span>
                    <p className="text-gray-800">{formatDate(formData.fecha) || 'No especificada'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Edad:</span>
                    <p className="text-gray-800">{selectedPatient?.edad || 'No especificada'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Expediente:</span>
                    <p className="text-gray-800">{selectedPatient?.numeroExpediente || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Título */}
              <div className="text-center py-2">
                <div className="bg-blue-600 text-white py-2 px-4 rounded-lg inline-block">
                  <h2 className="text-sm print:text-xs font-bold">BIOMETRÍA HEMÁTICA COMPLETA</h2>
                </div>
              </div>

              {/* Tabla de Resultados */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm print:text-xs border-2 border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700 border-r border-gray-300">PRUEBA</th>
                      <th className="px-4 py-3 print:px-3 print:py-2 text-center font-bold text-gray-700 border-r border-gray-300">RESULTADO</th>
                      <th className="px-4 py-3 print:px-3 print:py-2 text-center font-bold text-gray-700 border-r border-gray-300">UNIDAD</th>
                      <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700">VALORES REF.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {BIOMETRIA_TESTS.map((test) => {
                      const valor = formData[test.key];
                      if (!valor || valor.trim() === '') return null;

                      return (
                        <tr key={test.key} className="border-t border-gray-200">
                          <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700 border-r border-gray-300">{test.label}</td>
                          <td className="px-4 py-3 print:px-3 print:py-2 text-center border-r border-gray-300">
                            <span className="font-bold text-gray-800">{valor}</span>
                          </td>
                          <td className="px-4 py-3 print:px-3 print:py-2 text-center border-r border-gray-300 text-gray-600">
                            {test.unidad}
                          </td>
                          <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700">
                            <div className="text-xs print:text-[10px] leading-tight">
                              {test.referencia}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Observaciones */}
              {formData.observaciones && (
                <div className="bg-yellow-50 print:bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                  <p className="text-sm print:text-xs font-bold text-gray-700 mb-1">OBSERVACIONES:</p>
                  <p className="text-xs print:text-[10px] text-gray-600">{formData.observaciones}</p>
                </div>
              )}

              {/* Método */}
              <div className="bg-blue-50 print:bg-blue-100 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm print:text-xs gap-4">
                  <div>
                    <span className="font-bold text-gray-700">TÉCNICA:</span>
                    <span className="ml-2 text-gray-600">Automatizado</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">MÉTODO:</span>
                    <span className="ml-2 text-gray-600">Citometría de flujo</span>
                  </div>
                </div>
              </div>

              {/* Fin del informe */}
              <div className="text-center py-2">
                <div className="bg-gray-800 text-white py-2 px-4 rounded-lg inline-block">
                  <p className="text-sm print:text-xs font-bold">FIN DEL INFORME</p>
                </div>
              </div>

              {/* Espacio para firma */}
              <div className="h-16 print:h-12"></div>

              {/* Firma */}
              <div className="border-t-2 border-gray-300 pt-4 print:pt-3">
                <div className="text-center space-y-1">
                  <p className="text-sm print:text-xs font-bold text-gray-800">ATENTAMENTE</p>
                  <p className="text-sm print:text-xs font-bold text-gray-800">Q.F.B ELIUTH GARCIA CRUZ</p>
                  <p className="text-xs print:text-[10px] text-gray-600">CED.PROF. 4362774</p>
                  <p className="text-xs print:text-[10px] text-gray-600">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
                  <p className="text-xs print:text-[10px] text-gray-600">Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
                  
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs print:text-[10px] font-medium text-gray-700">Asistente Médico</p>
                    <p className="text-xs print:text-[10px] text-gray-600">Linn Castillo - 7731333631</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const BiometriaHematicaModal = ({ onClose, onSave, pruebaData }) => {
  const [showPatientSearch, setShowPatientSearch] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentView, setCurrentView] = useState('search'); // 'search', 'form', 'report'
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    pacienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    ...BIOMETRIA_TESTS.reduce((acc, test) => ({ ...acc, [test.key]: '' }), {})
  });
  const [errors, setErrors] = useState([]);

  const handlePatientSelect = useCallback((patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      pacienteId: patient._id
    }));
    setShowPatientSearch(false);
    setCurrentView('form');
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  }, [errors.length]);

  const validateForm = () => {
    const validationErrors = [];
    
    if (!formData.fecha) {
      validationErrors.push('Fecha de realización');
    }

    // Validar que al menos un valor esté lleno
    const hasAnyValue = BIOMETRIA_TESTS.some(test => formData[test.key]?.trim());
    if (!hasAnyValue) {
      validationErrors.push('Al menos un resultado de análisis');
    }

    return validationErrors;
  };

  const handleGenerateReport = () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setCurrentView('report');
  };

  const handleSaveAndPrint = async () => {
    setIsSaving(true);

    try {
      // Preparar resultados en el formato correcto
      let resultados = [];

      if (pruebaData?.subPruebas && pruebaData.subPruebas.length > 0) {
        // Usar los IDs reales de las subpruebas si existen
        resultados = BIOMETRIA_TESTS.map((test, index) => {
          const valor = formData[test.key];
          if (!valor || valor.trim() === '') return null;

          const subPrueba = pruebaData.subPruebas.find(sp => 
            sp.nombre.toLowerCase().includes(test.label.toLowerCase())
          ) || pruebaData.subPruebas[index % pruebaData.subPruebas.length];

          return {
            subPruebaId: subPrueba?._id,
            clave: test.key.toUpperCase(),
            nombre: test.label,
            valor: valor,
            unidad: test.unidad,
            referencia: test.referencia
          };
        }).filter(Boolean);
      } else {
        // Si no hay subpruebas, crear sin subPruebaId
        resultados = BIOMETRIA_TESTS.map(test => {
          const valor = formData[test.key];
          if (!valor || valor.trim() === '') return null;

          return {
            clave: test.key.toUpperCase(),
            nombre: test.label,
            valor: valor,
            unidad: test.unidad,
            referencia: test.referencia
          };
        }).filter(Boolean);
      }

      // Preparar datos del reporte
      const reportData = {
        pacienteId: formData.pacienteId,
        pruebaId: pruebaData?._id,
        fechaRealizacion: formData.fecha,
        resultados: resultados,
        observaciones: formData.observaciones || '',
        estado: 'completado',
        solicitadoPor: 'A QUIEN CORRESPONDA'
      };

      // Llamar a la función onSave del componente padre
      await onSave(reportData);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Si estamos en la vista de búsqueda de paciente
  if (showPatientSearch && currentView === 'search') {
    return (
      <PatientSearchModal
        onClose={onClose}
        onSelectPatient={handlePatientSelect}
      />
    );
  }

  // Si estamos en la vista de reporte (PDF)
  if (currentView === 'report') {
    return (
      <BiometriaReport
        formData={formData}
        selectedPatient={selectedPatient}
        onBack={() => setCurrentView('form')}
        onSaveAndPrint={handleSaveAndPrint}
        isSaving={isSaving}
      />
    );
  }

  // Vista de formulario
  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold">Biometría Hemática Completa</h2>
            <p className="text-xs text-blue-100">Ingresa los resultados del análisis</p>
          </div>
        </div>
      </div>

      {/* Información del Paciente */}
      <div className="flex-shrink-0 p-4 bg-blue-50 border-b">
        <h3 className="text-xs font-semibold text-blue-900 mb-2">Paciente Seleccionado</h3>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">{selectedPatient?.nombre}</p>
          <div className="flex gap-3 text-xs text-gray-600">
            <span>Exp: {selectedPatient?.numeroExpediente || 'N/A'}</span>
            {selectedPatient?.edad && <span>Edad: {selectedPatient.edad} años</span>}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start mb-2">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 font-medium text-sm">
                Por favor completa los siguientes campos:
              </span>
            </div>
            <ul className="text-xs text-red-600 list-disc list-inside ml-7">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de realización *
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Resultados */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resultados de Análisis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BIOMETRIA_TESTS.map((test) => (
                <div key={test.key} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    {test.label}
                    <span className="text-gray-500 text-[10px] ml-1">({test.unidad})</span>
                  </label>
                  <input
                    type="text"
                    value={formData[test.key]}
                    onChange={(e) => handleInputChange(test.key, e.target.value)}
                    placeholder={test.referencia}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-gray-500">
                    Ref: {test.referencia}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingresa observaciones adicionales..."
            />
          </div>
        </div>
      </div>

      {/* Footer con botones */}
      <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Vista Previa del Reporte
        </button>
      </div>
    </div>
  );
};

export default BiometriaHematicaModal;