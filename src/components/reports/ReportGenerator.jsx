/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, AlertCircle, Loader2 } from 'lucide-react';
import PatientSearchModal from '../patients/PatientSearchsModal';
import ReportPreview from './ReportPreview';
import { reportesAPI, pruebasAPI } from '../../services/api';

// ✅ FUNCIÓN AUXILIAR: Generar PDF usando método de impresión del navegador
const generatePrintPDF = async (reportElement, firmaBase64) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear iframe oculto
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // Obtener el HTML del reporte
      const reportHTML = reportElement.innerHTML;
      
      // Reemplazar la ruta de la imagen con base64
      const htmlWithBase64 = firmaBase64 
        ? reportHTML.replace(/src="[^"]*firma\.png[^"]*"/g, `src="${firmaBase64}"`)
        : reportHTML;

      // Escribir el contenido en el iframe
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte Médico</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page { 
                size: A4; 
                margin: 0.5in; 
              }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              * { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            ${htmlWithBase64}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Esperar a que Tailwind CSS se cargue y el contenido esté listo
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          // Limpiar después de un tiempo
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (err) {
          document.body.removeChild(iframe);
          reject(err);
        }
      }, 1500); // Dar más tiempo para que Tailwind cargue
      
    } catch (err) {
      reject(err);
    }
  });
};

// Componente de Formulario Dinámico (sin cambios)
const DynamicForm = ({ testConfig, formData, onChange, selectedPatient, errors }) => {
  if (!testConfig) return null;

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

      {/* Fecha Y Hora */}
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

      {/* Campos dinámicos de subpruebas */}
      {testConfig.subPruebas?.map((subPrueba) => {
        const tieneOpciones = subPrueba.valoresReferencia?.opciones && subPrueba.valoresReferencia.opciones.length > 0;
        const opciones = tieneOpciones 
          ? subPrueba.valoresReferencia.opciones.map(op => op.valor)
          : null;

        return (
          <div key={subPrueba._id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {subPrueba.nombre}
              {subPrueba.unidad && <span className="text-gray-500"> ({subPrueba.unidad})</span>}
            </label>
            
            {tieneOpciones ? (
              <div className="flex gap-2">
                {opciones.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onChange(subPrueba._id, option)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData[subPrueba._id] === option
                        ? option === 'POSITIVA' || option === 'POSITIVO' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : subPrueba.tipo === 'numerico' ? (
              <input
                type="number"
                step="0.01"
                value={formData[subPrueba._id] || ''}
                onChange={(e) => onChange(subPrueba._id, e.target.value)}
                placeholder={subPrueba.valoresReferencia?.texto || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={formData[subPrueba._id] || ''}
                onChange={(e) => onChange(subPrueba._id, e.target.value)}
                placeholder={subPrueba.valoresReferencia?.texto || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {subPrueba.valoresReferencia?.texto && (
              <p className="text-xs text-gray-500 mt-1">Ref: {subPrueba.valoresReferencia.texto}</p>
            )}
          </div>
        );
      })}

      {/* Campos adicionales */}
      {testConfig.camposAdicionales?.map((campo) => (
        <div key={campo._id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {campo.nombre}
          </label>
          
          {campo.tipo === 'select' && campo.opciones ? (
            <select
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {campo.opciones.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          ) : campo.tipo === 'numero' ? (
            <input
              type="number"
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : campo.tipo === 'fecha' ? (
            <input
              type="date"
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input
              type="text"
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}

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
    hora: new Date().toTimeString().slice(0, 5)
  });
  const [errors, setErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [testConfig, setTestConfig] = useState(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);

  useEffect(() => {
    const loadTestConfig = async () => {
      if (!pruebaData) {
        setIsLoadingTest(false);
        return;
      }

      try {
        setIsLoadingTest(true);
        
        if (pruebaData.subPruebas && pruebaData.subPruebas.length > 0) {
          setTestConfig(pruebaData);
          
          const defaults = {};
          pruebaData.subPruebas.forEach(subPrueba => {
            const tieneOpciones = subPrueba.valoresReferencia?.opciones?.length > 0;
            if (tieneOpciones) {
              defaults[subPrueba._id] = subPrueba.valoresReferencia.opciones[0].valor;
            }
          });
          setFormData(prev => ({ ...prev, ...defaults }));
        } 
        else if (pruebaData._id) {
          const data = await pruebasAPI.getById(pruebaData._id);
          setTestConfig(data);

          const defaults = {};
          data.subPruebas?.forEach(subPrueba => {
            const tieneOpciones = subPrueba.valoresReferencia?.opciones?.length > 0;
            if (tieneOpciones) {
              defaults[subPrueba._id] = subPrueba.valoresReferencia.opciones[0].valor;
            }
          });
          setFormData(prev => ({ ...prev, ...defaults }));
        }
      } catch (error) {
        console.error('Error al cargar configuración de prueba:', error);
        alert('Error al cargar la configuración de la prueba');
      } finally {
        setIsLoadingTest(false);
      }
    };

    loadTestConfig();
  }, [pruebaData]);

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

  // ✅ FUNCIÓN: Solo guardar en BD sin imprimir
  const handleSaveOnly = async () => {
    setIsSaving(true);
    try {
      let resultados = [];
      
      testConfig.subPruebas?.forEach((subPrueba) => {
        const valor = formData[subPrueba._id];
        if (valor) {
          resultados.push({
            subPruebaId: subPrueba._id,
            clave: subPrueba.clave || subPrueba.nombre.toUpperCase(),
            nombre: subPrueba.nombre,
            valor: valor.toString(),
            unidad: subPrueba.unidad || '',
            referencia: subPrueba.valoresReferencia?.texto || ''
          });
        }
      });

      const fechaHoraRealizacion = new Date(`${formData.fecha}T${formData.hora}:00`);

      const reportData = {
        pacienteId: formData.pacienteId,
        pruebaId: testConfig._id,
        fechaRealizacion: fechaHoraRealizacion.toISOString(),
        resultados,
        observaciones: formData.observaciones || '',
        estado: 'completado',
        solicitadoPor: 'A QUIEN CORRESPONDA'
      };

      await reportesAPI.create(reportData);
      
      onBack();
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Usar método unificado para PC y móvil
  const handlePrintAndSave = async () => {
    setIsSaving(true);
    try {
      // 1. Guardar en base de datos
      let resultados = [];
      
      testConfig.subPruebas?.forEach((subPrueba) => {
        const valor = formData[subPrueba._id];
        if (valor) {
          resultados.push({
            subPruebaId: subPrueba._id,
            clave: subPrueba.clave || subPrueba.nombre.toUpperCase(),
            nombre: subPrueba.nombre,
            valor: valor.toString(),
            unidad: subPrueba.unidad || '',
            referencia: subPrueba.valoresReferencia?.texto || ''
          });
        }
      });

      const fechaHoraRealizacion = new Date(`${formData.fecha}T${formData.hora}:00`);

      const reportData = {
        pacienteId: formData.pacienteId,
        pruebaId: testConfig._id,
        fechaRealizacion: fechaHoraRealizacion.toISOString(),
        resultados,
        observaciones: formData.observaciones || '',
        estado: 'completado',
        solicitadoPor: 'A QUIEN CORRESPONDA'
      };

      await reportesAPI.create(reportData);
      
      // 2. Obtener el elemento del reporte
      const reportElement = document.querySelector('.report-to-print');
      if (!reportElement) {
        alert('Error: No se encontró el reporte');
        setIsSaving(false);
        return;
      }

      // 3. Obtener firma en base64 del atributo data
      const firmaBase64 = reportElement.getAttribute('data-firma-base64');

      // 4. Usar método unificado de impresión (funciona igual en PC y móvil)
      await generatePrintPDF(reportElement, firmaBase64);
      
      onBack();
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingTest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

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
          
          {/* Header */}
          <div className="flex-shrink-0 bg-gray-50 border-b p-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button 
                onClick={() => setCurrentStep('form')}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver</span>
              </button>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={handleSaveOnly}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Solo Guardar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrintAndSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Guardar e Imprimir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Vista previa */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
            <div className="bg-white max-w-[210mm] mx-auto shadow-lg">
              <div className="report-to-print">
                <ReportPreview
                  testConfig={testConfig}
                  formData={formData}
                  selectedPatient={selectedPatient}
                />
              </div>
            </div>
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
            <button 
              onClick={onBack} 
              className="mr-2 p-1 hover:bg-blue-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold">{testConfig?.nombre || 'Generar Reporte'}</h2>
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
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Vista Previa del Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;