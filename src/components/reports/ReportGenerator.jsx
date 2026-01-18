  /* eslint-disable react/prop-types */
  import React, { useState, useCallback } from 'react';
  import { ArrowLeft, Download, AlertCircle, Loader2 } from 'lucide-react';
  import PatientSearchModal from '../patients/PatientSearchsModal';
  import ReportPreview from './ReportPreview';
  import { reportesAPI } from '../../services/api';

  // Configuración de pruebas
  const TESTS_CONFIG = {
    ANTIDOPING: {
      nombre: 'Perfil de Drogas de Abuso 6',
      codigo: 'ANTIDOPING',
      fields: [
        { key: 'canabinoides', label: 'CANABINOIDES', type: 'select', options: ['NEGATIVA', 'POSITIVA'], default: 'NEGATIVA' },
        { key: 'cocaina', label: 'COCAINA', type: 'select', options: ['NEGATIVA', 'POSITIVA'], default: 'NEGATIVA' },
        { key: 'anfetaminas', label: 'ANFETAMINAS', type: 'select', options: ['NEGATIVA', 'POSITIVA'], default: 'NEGATIVA' },
        { key: 'metanfetaminas', label: 'METANFETAMINAS', type: 'select', options: ['NEGATIVA', 'POSITIVA'], default: 'NEGATIVA' },
        { key: 'morfina', label: 'MORFINA OPIACEOS', type: 'select', options: ['NEGATIVA', 'POSITIVA'], default: 'NEGATIVA' },
        { key: 'benzodiazepinas', label: 'BENZODIAZEPINAS', type: 'select', options: ['NEGATIVA', 'POSITIVA'], default: 'NEGATIVA' }
      ],
      metodo: 'Inmunocromatografía',
      tecnica: 'RIA',
      referencia: 'NEG: <150 ng/ml, POS: ≥150 ng/ml'
    },
    ALCOHOLIMETRO: {
      nombre: 'Prueba de Alcohol en Aliento',
      codigo: 'ALCOHOLIMETRO',
      fields: [
        { key: 'gradosAlcohol', label: 'Grados de Alcohol (mg/L)', type: 'number', placeholder: '0.0', step: '0.01' },
        { key: 'resultado', label: 'Resultado', type: 'select', options: ['NEGATIVA', 'POSITIVA'], default: 'NEGATIVA' }
      ],
      metodo: 'Espectrofotometría',
      tecnica: 'Alcoholímetro Digital Certificado',
      referencia: 'POSITIVA: > 0.1 mg/L, NEGATIVA: ≤ 0.0 mg/L'
    },
    'HEM-BIOM689': {
      nombre: 'Biometría Hemática Completa',
      codigo: 'HEM-BIOM689',
      fields: [
        { key: 'hemoglobina', label: 'Hemoglobina', type: 'text', unidad: 'g/dL', referencia: 'H: 13.5-17.5, M: 12.0-16.0' },
        { key: 'hematocrito', label: 'Hematocrito', type: 'text', unidad: '%', referencia: 'H: 40-54, M: 37-47' },
        { key: 'leucocitos', label: 'Leucocitos', type: 'text', unidad: 'x10³/µL', referencia: '4.5-11.0' },
        { key: 'eritrocitos', label: 'Eritrocitos', type: 'text', unidad: 'x10⁶/µL', referencia: 'H: 4.5-5.9, M: 4.0-5.2' },
        { key: 'plaquetas', label: 'Plaquetas', type: 'text', unidad: 'x10³/µL', referencia: '150-400' },
        { key: 'vcm', label: 'VCM', type: 'text', unidad: 'fL', referencia: '80-100' },
        { key: 'hcm', label: 'HCM', type: 'text', unidad: 'pg', referencia: '27-31' },
        { key: 'chcm', label: 'CHCM', type: 'text', unidad: 'g/dL', referencia: '32-36' },
        { key: 'neutrofilos', label: 'Neutrófilos', type: 'text', unidad: '%', referencia: '40-70' },
        { key: 'linfocitos', label: 'Linfocitos', type: 'text', unidad: '%', referencia: '20-40' },
        { key: 'monocitos', label: 'Monocitos', type: 'text', unidad: '%', referencia: '2-8' },
        { key: 'eosinofilos', label: 'Eosinófilos', type: 'text', unidad: '%', referencia: '1-4' },
        { key: 'basofilos', label: 'Basófilos', type: 'text', unidad: '%', referencia: '0-1' }
      ],
      metodo: 'Citometría de flujo',
      tecnica: 'Automatizado'
    }
  };

  // Componente de Formulario Dinámico
  const DynamicForm = ({ testConfig, formData, onChange, selectedPatient, errors }) => {
    return (
      <div className="space-y-4">
        {/* Info del paciente */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-xs font-semibold text-blue-900 mb-2">Paciente Seleccionado</h3>
          <p className="text-sm font-medium text-gray-900">{selectedPatient?.nombre}</p>
          <div className="flex gap-3 text-xs text-gray-600 mt-1">
            <span>Exp: {selectedPatient?.numeroExpediente || 'N/A'}</span>
            {selectedPatient?.edad && <span>Edad: {selectedPatient.edad} años</span>}
          </div>
        </div>

        {/* ⭐ Fecha Y Hora */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              value={formData.fecha || ''}
              onChange={(e) => onChange('fecha', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.includes('Fecha') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
            <input
              type="time"
              value={formData.hora || ''}
              onChange={(e) => onChange('hora', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.includes('Hora') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Campos dinámicos según el tipo de prueba */}
        {testConfig.fields.map((field) => {
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.unidad && <span className="text-gray-500">({field.unidad})</span>}
              </label>
              
              {field.type === 'select' ? (
                <div className="flex gap-2">
                  {field.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onChange(field.key, option)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData[field.key] === option
                          ? option === 'POSITIVA' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  step={field.step || '1'}
                  value={formData[field.key] || ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.referencia}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              )}
              
              {field.referencia && (
                <p className="text-xs text-gray-500 mt-1">Ref: {field.referencia}</p>
              )}
            </div>
          );
        })}

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            value={formData.observaciones || ''}
            onChange={(e) => onChange('observaciones', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>
    );
  };

  // Componente Principal
  const ReportGenerator = ({ onBack, pruebaData }) => {
    const [currentStep, setCurrentStep] = useState('patient');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [formData, setFormData] = useState({ 
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5) // HH:MM
    });
    const [errors, setErrors] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const testConfig = TESTS_CONFIG[pruebaData?.codigo] || TESTS_CONFIG.ANTIDOPING;

    // Inicializar valores por defecto
    React.useEffect(() => {
      const defaults = {};
      testConfig.fields.forEach(field => {
        if (field.default) defaults[field.key] = field.default;
      });
      setFormData(prev => ({ ...prev, ...defaults }));
    }, [testConfig]);

    const handlePatientSelect = useCallback((patient) => {
      setSelectedPatient(patient);
      setFormData(prev => ({ ...prev, pacienteId: patient._id }));
      setCurrentStep('form');
    }, []);

    const handleInputChange = useCallback((field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors.length > 0) setErrors([]);
    }, [errors.length]);

    const validateForm = () => {
      const validationErrors = [];
      if (!formData.fecha) validationErrors.push('Fecha');
      if (!formData.hora) validationErrors.push('Hora');
      
      if (testConfig.codigo === 'HEM-BIOM689') {
        const hasAnyValue = testConfig.fields.some(f => formData[f.key]?.trim());
        if (!hasAnyValue) validationErrors.push('Al menos un resultado');
      }
      
      return validationErrors;
    };

    const handleGeneratePreview = () => {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors([]);
      setCurrentStep('preview');
    };

    const handlePrintAndSave = async () => {
      setIsSaving(true);
      try {
        let resultados = [];
        
        if (pruebaData?.subPruebas && pruebaData.subPruebas.length > 0) {
          resultados = testConfig.fields
            .filter(f => formData[f.key])
            .map((field, index) => ({
              subPruebaId: pruebaData.subPruebas[index % pruebaData.subPruebas.length]._id,
              clave: field.key.toUpperCase(),
              nombre: field.label,
              valor: formData[field.key],
              unidad: field.unidad || '',
              referencia: field.referencia || testConfig.referencia || ''
            }));
        } else {
          resultados = testConfig.fields
            .filter(f => formData[f.key])
            .map(field => ({
              clave: field.key.toUpperCase(),
              nombre: field.label,
              valor: formData[field.key],
              unidad: field.unidad || '',
              referencia: field.referencia || testConfig.referencia || ''
            }));
        }

        // ⭐ Combinar fecha y hora en un solo timestamp
        const fechaHoraRealizacion = new Date(`${formData.fecha}T${formData.hora}:00`);

        const reportData = {
          pacienteId: formData.pacienteId,
          pruebaId: pruebaData?._id,
          fechaRealizacion: fechaHoraRealizacion.toISOString(),
          resultados,
          observaciones: formData.observaciones || '',
          estado: 'completado',
          solicitadoPor: 'A QUIEN CORRESPONDA'
        };

        await reportesAPI.create(reportData);
        
        window.print();
        
        alert('Reporte guardado e impreso exitosamente');
        setTimeout(() => onBack(), 500);
        
      } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar el reporte: ' + error.message);
      } finally {
        setIsSaving(false);
      }
    };

    if (currentStep === 'patient') {
      return (
        <PatientSearchModal
          onClose={onBack}
          onSelectPatient={handlePatientSelect}
        />
      );
    }

    if (currentStep === 'preview') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            
            <div className="flex-shrink-0 bg-gray-50 border-b p-3 print:hidden">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setCurrentStep('form')}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Volver</span>
                </button>
                
                <button
                  onClick={handlePrintAndSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Imprimir y Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ReportPreview
                testConfig={testConfig}
                formData={formData}
                selectedPatient={selectedPatient}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
          
          <div className="bg-blue-600 text-white p-3 rounded-t-xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center">
              <button onClick={onBack} className="mr-2 p-1 hover:bg-blue-700 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold">{testConfig.nombre}</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {errors.length > 0 && (
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
            )}

            <DynamicForm
              testConfig={testConfig}
              formData={formData}
              onChange={handleInputChange}
              selectedPatient={selectedPatient}
              errors={errors}
            />
          </div>

          <div className="border-t p-3 flex-shrink-0">
            <button
              onClick={handleGeneratePreview}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Vista Previa del Reporte
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default ReportGenerator;