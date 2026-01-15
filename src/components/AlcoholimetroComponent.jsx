import React, { useState, useCallback } from 'react';
import { ArrowLeft, Download, AlertCircle, Save } from 'lucide-react';
import PatientSearchModal from './PatientSearchModal';
import { reportesAPI } from '../services/api';

const ValidationAlert = ({ errors }) => {
  if (errors.length === 0) return null;
  
  return (
    <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-sm">
      <div className="flex items-start mb-1.5">
        <AlertCircle className="w-4 h-4 text-red-500 mr-1.5 flex-shrink-0 mt-0.5" />
        <span className="text-red-700 font-medium">Completa los siguientes campos:</span>
      </div>
      <ul className="text-xs text-red-600 list-disc list-inside ml-5">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

const AlcoholimetroForm = ({ formData, handleInputChange, onBack, generateReport, selectedPatient }) => {
  const [errors, setErrors] = useState([]);

  const handleChange = useCallback((field, value) => {
    handleInputChange(field, value);
    if (errors.length > 0) setErrors([]);
  }, [handleInputChange, errors.length]);

  const handleAlcoholChange = useCallback((value) => {
    handleInputChange('alcohol', value);
    if (value === 'NEGATIVA') {
      handleInputChange('gradosAlcohol', '0.0');
    }
  }, [handleInputChange]);

  const handleGradosAlcoholChange = useCallback((value) => {
    handleInputChange('gradosAlcohol', value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleInputChange('alcohol', numValue > 0.0 ? 'POSITIVA' : 'NEGATIVA');
    }
  }, [handleInputChange]);

  const handleGenerateReport = useCallback(() => {
    const validationErrors = [];
    if (!formData.fecha) validationErrors.push('Fecha');
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    generateReport();
  }, [formData, generateReport]);

  const inputClass = (field) => `w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    errors.includes(field) ? 'border-red-300 bg-red-50' : 'border-gray-300'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[75vh]">
        
        <div className="bg-blue-600 text-white p-3 rounded-t-xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-2 p-1 hover:bg-blue-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold">Alcoholímetro</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ValidationAlert errors={errors} />
          
          {/* Información del Paciente */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-xs font-semibold text-blue-900 mb-2">Paciente Seleccionado</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">{selectedPatient?.nombre}</p>
              <div className="flex gap-3 text-xs text-gray-600">
                <span>Exp: {selectedPatient?.numeroExpediente || 'N/A'}</span>
                <span>Edad: {selectedPatient?.edad || 'N/A'} años</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={formData.fecha || ''}
                onChange={(e) => handleChange('fecha', e.target.value)}
                className={inputClass('Fecha')}
              />
            </div>

            <div className="border-t pt-3 mt-2">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Grados de Alcohol (mg/L)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.gradosAlcohol || ''}
                  onChange={(e) => handleGradosAlcoholChange(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Valores &gt; 0.1 mg/L se consideran positivos
                </p>
              </div>

              <h3 className="text-xs font-semibold text-gray-800 mb-2">Resultado de Alcohol</h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                <div className="mb-1.5">
                  <span className="font-medium text-gray-800 text-xs">GRADOS DE ALCOHOL</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAlcoholChange('NEGATIVA')}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      (formData.alcohol === 'NEGATIVA' || !formData.alcohol)
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    NEGATIVA
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlcoholChange('POSITIVA')}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      formData.alcohol === 'POSITIVA'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    POSITIVA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-3 flex-shrink-0">
          <button
            onClick={handleGenerateReport}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Vista Previa del Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

const AlcoholimetroReport = ({ formData, selectedPatient, onBack, onSaveAndPrint, isSaving }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  const alcoholResult = formData.alcohol || 'NEGATIVA';

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
                  <h2 className="text-sm print:text-xs font-bold">PRUEBA DE ALCOHOL EN ALIENTO</h2>
                </div>
              </div>

              {/* Tabla de Resultados */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm print:text-xs border-2 border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700 border-r border-gray-300">PRUEBA DE ALCOHOL</th>
                      <th className="px-4 py-3 print:px-3 print:py-2 text-center font-bold text-gray-700 border-r border-gray-300">RESULTADO</th>
                      <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700">VALORES DE REFERENCIA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700 border-r border-gray-300">Grados de Alcohol</td>
                      <td className="px-4 py-3 print:px-3 print:py-2 text-center border-r border-gray-300">
                        <div className="space-y-1">
                          <span className={`font-bold px-2 py-1 rounded text-xs inline-block ${
                            alcoholResult === 'POSITIVA' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {alcoholResult}
                          </span>
                          <div className="text-xs print:text-[10px] text-gray-600">{formData.gradosAlcohol || '0.0'} mg/L</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700">
                        <div className="text-xs print:text-[10px] leading-tight">
                          <p>POSITIVA: &gt; 0.1 mg/L</p>
                          <p>NEGATIVA: ≤ 0.0 mg/L</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Método */}
              <div className="bg-blue-50 print:bg-blue-100 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm print:text-xs gap-4">
                  <div>
                    <span className="font-bold text-gray-700">TÉCNICA:</span>
                    <span className="ml-2 text-gray-600">Alcoholímetro Digital Certificado</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">MÉTODO:</span>
                    <span className="ml-2 text-gray-600">Espectrofotometría</span>
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

const AlcoholimetroComponent = ({ onBack, pruebaData }) => {
  const [showPatientSearch, setShowPatientSearch] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentView, setCurrentView] = useState('search'); // 'search', 'form', 'report'
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    pacienteId: '',
    nombre: '',
    numeroExpediente: '',
    edad: '',
    fecha: new Date().toISOString().split('T')[0],
    alcohol: 'NEGATIVA',
    gradosAlcohol: '0.0'
  });

  const handlePatientSelect = useCallback((patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      pacienteId: patient._id,
      nombre: patient.nombre,
      numeroExpediente: patient.numeroExpediente,
      edad: patient.edad
    }));
    setShowPatientSearch(false);
    setCurrentView('form');
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const generateReport = useCallback(() => {
    setCurrentView('report');
  }, []);

  const handleSaveAndPrint = async () => {
    setIsSaving(true);
    try {
      // Preparar resultados
      let resultados = [];
      
      if (pruebaData?.subPruebas && pruebaData.subPruebas.length > 0) {
        // Si tenemos subpruebas, usamos el ID real de la primera
        resultados = [{
          subPruebaId: pruebaData.subPruebas[0]._id,
          clave: 'ALCOHOL',
          nombre: 'Grados de Alcohol',
          valor: formData.alcohol || 'NEGATIVA',
          unidad: 'mg/L',
          referencia: 'POSITIVA: > 0.1 mg/L, NEGATIVA: ≤ 0.0 mg/L',
          valorNumerico: parseFloat(formData.gradosAlcohol) || 0.0
        }];
      } else {
        // Si no hay subpruebas definidas, crear resultado sin subPruebaId
        resultados = [{
          clave: 'ALCOHOL',
          nombre: 'Grados de Alcohol',
          valor: formData.alcohol || 'NEGATIVA',
          unidad: 'mg/L',
          referencia: 'POSITIVA: > 0.1 mg/L, NEGATIVA: ≤ 0.0 mg/L',
          valorNumerico: parseFloat(formData.gradosAlcohol) || 0.0
        }];
      }

      // Preparar datos para la API
      const reportData = {
        pacienteId: formData.pacienteId,
        pruebaId: pruebaData?._id,
        fechaRealizacion: formData.fecha,
        resultados: resultados,
        observaciones: `Grados de alcohol medidos: ${formData.gradosAlcohol} mg/L`,
        estado: 'completado',
        solicitadoPor: 'A QUIEN CORRESPONDA'
      };

      // Guardar en BD
      await reportesAPI.create(reportData);
      alert('Reporte guardado exitosamente');
      
      // Cerrar modal después de guardar
      setTimeout(() => {
        onBack();
      }, 1000);
      
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
      alert('Error al guardar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Si estamos en la vista de búsqueda de paciente
  if (showPatientSearch && currentView === 'search') {
    return (
      <PatientSearchModal
        onClose={onBack}
        onSelectPatient={handlePatientSelect}
      />
    );
  }

  // Si estamos en la vista de reporte (PDF)
  if (currentView === 'report') {
    return (
      <AlcoholimetroReport 
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
    <AlcoholimetroForm 
      formData={formData}
      handleInputChange={handleInputChange}
      onBack={onBack}
      generateReport={generateReport}
      selectedPatient={selectedPatient}
    />
  );
};

export default AlcoholimetroComponent;