/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, AlertCircle, Loader2 } from 'lucide-react';
import PatientSearchModal from '../patients/PatientSearchsModal';
import ReportPreview from './ReportPreview';
import { reportesAPI, pruebasAPI } from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ✅ FUNCIÓN UNIFICADA: Generar y descargar PDF usando html2canvas + jsPDF
const generateAndDownloadPDF = async (reportElement, selectedPatient, formData) => {
  try {
    console.log('📄 Generando PDF...');
    
    // Capturar el elemento como imagen
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: reportElement.offsetWidth,
      height: reportElement.offsetHeight,
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight
    });

    // Crear PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Si la imagen es más alta que la página, ajustar
    if (imgHeight > pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pdfHeight);
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    // Generar nombre de archivo
    const fileName = `reporte_${selectedPatient?.nombre?.replace(/\s+/g, '_') || 'paciente'}_${formData.fecha}.pdf`;
    
    // Descargar
    pdf.save(fileName);
    
    console.log('✅ PDF descargado:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    throw error;
  }
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
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
        setNotification({ type: 'error', message: 'Error al cargar la configuración de la prueba' });
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

  // ✅ NUEVA FUNCIÓN: Guardar Y descargar PDF (sin imprimir)
  const handleSaveOnly = async () => {
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
      
      // 2. Generar y descargar PDF
      const reportElement = document.querySelector('.report-to-print');
      if (!reportElement) {
        alert('Error: No se encontró el reporte');
        setIsSaving(false);
        return;
      }

      await generateAndDownloadPDF(reportElement, selectedPatient, formData);
      
      setNotification({ type: 'success', message: 'Reporte guardado y PDF descargado' });
      setTimeout(() => onBack(), 1500);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      setNotification({ type: 'error', message: 'Error al guardar el reporte: ' + error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ FUNCIÓN: Guardar e Imprimir (PC = iframe print | Móvil = descargar PDF con html2canvas)
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
        setNotification({ type: 'error', message: 'Error: No se encontró el reporte' });
        setIsSaving(false);
        return;
      }

      // 3. Detectar si es móvil
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        // ✅ MÓVIL: Descargar PDF con html2canvas (MÉTODO ORIGINAL QUE FUNCIONABA)
        console.log('📱 Generando PDF para móvil...');
        
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (imgHeight > pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pdfHeight);
        } else {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }

        const fileName = `reporte_${selectedPatient?.nombre || 'paciente'}_${formData.fecha}.pdf`;
        pdf.save(fileName);

        setNotification({ type: 'success', message: 'Reporte guardado y PDF descargado' });
      } else {
        // ✅ PC: Abrir diálogo de impresión (método que ya funciona)
        console.log('🖥️ Imprimiendo en PC con iframe...');
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Reporte Médico</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @page { size: A4; margin: 0.5in; }
                body { margin: 0; padding: 0; }
                * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
              </style>
            </head>
            <body>
              ${reportElement.innerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 500);
        }, 250);
        
        setNotification({ type: 'success', message: 'Reporte guardado' });
      }
      
      setTimeout(() => onBack(), 1500);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      setNotification({ type: 'error', message: 'Error al guardar el reporte: ' + error.message });
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
          
          {/* Notification */}
          {notification && (
            <div className={`absolute top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          )}
          
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
                      <span className="text-sm">Guardar</span>
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
        
        {/* Notification */}
        {notification && (
          <div className={`absolute top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}
        
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