/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, AlertCircle, Loader2 } from 'lucide-react';
import ReportPreview from './ReportPreview';
import { reportesAPI, pruebasAPI } from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Componente de Formulario Dinámico (mismo que ReportGenerator)
const DynamicForm = ({ testConfig, formData, onChange, selectedPatient, errors }) => {
  if (!testConfig) return null;

  return (
    <div className="space-y-4">
      {/* Info del paciente */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-xs font-semibold text-blue-900 mb-2">Paciente</h3>
        <p className="text-sm font-medium text-gray-900">{selectedPatient?.nombre}</p>
        <div className="flex gap-3 text-xs text-gray-600 mt-1">
          <span>Exp: {selectedPatient?.numeroExpediente || selectedPatient?.expediente || 'N/A'}</span>
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

// ✅ Componente Principal de Edición
const ReportEditor = ({ onBack, reportToEdit }) => {
  const [currentStep, setCurrentStep] = useState('form'); // Solo 'form' o 'preview'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [testConfig, setTestConfig] = useState(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);

  // ✅ Función auxiliar para reconstruir formData desde el reporte
  const reconstructFormDataFromReport = (report) => {
    console.log('🔍 Reconstruyendo formData desde reporte:', report);
    
    const formData = {
      fecha: new Date(report.fechaRealizacion).toISOString().split('T')[0],
      hora: new Date(report.fechaRealizacion).toTimeString().slice(0, 5),
      observaciones: report.observaciones || ''
    };

    // Reconstruir valores de resultados
    report.resultados?.forEach((resultado) => {
      const subPruebaId = resultado.subPruebaId?.$oid || resultado.subPruebaId;
      formData[subPruebaId] = resultado.valor;
    });

    // Reconstruir campos adicionales
    report.camposAdicionales?.forEach((campo) => {
      const campoId = campo._id?.$oid || campo._id;
      formData[`campo_${campoId}`] = campo.valor;
    });

    console.log('✅ FormData reconstruido:', formData);
    return formData;
  };

  // ✅ Función auxiliar para reconstruir testConfig
  const reconstructTestConfigFromReport = async (report) => {
    console.log('🔍 Reconstruyendo testConfig desde reporte');
    
    // ESTRATEGIA 1: Si el reporte ya tiene la prueba poblada
    if (report.prueba?.subPruebas && report.prueba.subPruebas.length > 0) {
      console.log('✅ Usando prueba poblada');
      return report.prueba;
    }

    // ESTRATEGIA 2: Cargar desde API
    const pruebaId = report.prueba?.$oid || report.prueba?._id || report.prueba;
    
    if (pruebaId) {
      try {
        console.log('🔄 Cargando prueba desde API, ID:', pruebaId);
        const response = await pruebasAPI.getById(pruebaId);
        const pruebaCompleta = response.data || response;
        
        if (pruebaCompleta.subPruebas && pruebaCompleta.subPruebas.length > 0) {
          console.log('✅ Prueba cargada con', pruebaCompleta.subPruebas.length, 'subPruebas');
          return pruebaCompleta;
        }
      } catch (error) {
        console.error('❌ Error cargando prueba:', error);
      }
    }

    // ESTRATEGIA 3 (FALLBACK): Construir desde resultados
    console.log('⚠️ Usando fallback');
    return {
      _id: pruebaId || 'unknown',
      nombre: report.datosPrueba?.nombre || 'Reporte Médico',
      codigo: report.datosPrueba?.codigo || '',
      metodo: report.datosPrueba?.metodo || 'N/A',
      tecnica: report.datosPrueba?.tecnica || 'N/A',
      subPruebas: report.resultados?.map(resultado => ({
        _id: resultado.subPruebaId?.$oid || resultado.subPruebaId,
        nombre: resultado.nombre || resultado.clave || 'Sin nombre',
        clave: resultado.clave,
        unidad: resultado.unidad || '',
        tipo: 'texto',
        valoresReferencia: {
          texto: resultado.referencia || 'Sin referencia disponible',
          opciones: []
        }
      })) || []
    };
  };

  // ✅ Cargar datos del reporte al montar
  useEffect(() => {
    const loadReportData = async () => {
      if (!reportToEdit) {
        setIsLoadingTest(false);
        return;
      }

      try {
        setIsLoadingTest(true);
        
        // Reconstruir datos del paciente
        setSelectedPatient({
          _id: reportToEdit.paciente?._id || reportToEdit.paciente,
          nombre: reportToEdit.datosPaciente?.nombre || 'N/A',
          numeroExpediente: reportToEdit.datosPaciente?.numeroExpediente || 
                           reportToEdit.datosPaciente?.expediente || 'N/A',
          edad: reportToEdit.datosPaciente?.edad || 'N/A'
        });

        // Reconstruir configuración de la prueba
        const config = await reconstructTestConfigFromReport(reportToEdit);
        setTestConfig(config);

        // Reconstruir formData
        const reconstructedFormData = reconstructFormDataFromReport(reportToEdit);
        setFormData(reconstructedFormData);

      } catch (error) {
        console.error('Error al cargar datos del reporte:', error);
        alert('Error al cargar los datos del reporte');
      } finally {
        setIsLoadingTest(false);
      }
    };

    loadReportData();
  }, [reportToEdit]);

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

  // ✅ Función para guardar cambios (UPDATE)
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Preparar resultados actualizados
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

      // Preparar campos adicionales
      let camposAdicionales = [];
      testConfig.camposAdicionales?.forEach((campo) => {
        const valor = formData[`campo_${campo._id}`];
        if (valor) {
          camposAdicionales.push({
            _id: campo._id,
            nombre: campo.nombre,
            valor: valor
          });
        }
      });

      const updateData = {
        resultados,
        camposAdicionales,
        observaciones: formData.observaciones || ''
      };

      console.log('💾 Actualizando reporte:', reportToEdit._id, updateData);

      // Llamar al API para actualizar
      await reportesAPI.update(reportToEdit._id, updateData);
      
      alert('✅ Reporte actualizado exitosamente');
      onBack(); // Volver y refrescar lista
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('❌ Error al actualizar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Función para guardar y generar PDF
  const handleSaveAndPrint = async () => {
    setIsSaving(true);
    try {
      // 1. Guardar cambios primero
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

      const updateData = {
        resultados,
        observaciones: formData.observaciones || ''
      };

      await reportesAPI.update(reportToEdit._id, updateData);
      
      // 2. Generar PDF
      const reportElement = document.querySelector('.report-to-print');
      if (!reportElement) {
        alert('Error: No se encontró el reporte');
        setIsSaving(false);
        return;
      }

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        // Móvil: Generar PDF
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
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

        const fileName = `reporte_${reportToEdit.folio}_editado.pdf`;
        pdf.save(fileName);

        alert('✅ Reporte actualizado y PDF descargado');
        onBack();
        
      } else {
        // PC: Usar iframe
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
            onBack();
          }, 500);
        }, 250);
      }
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al actualizar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingTest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del reporte...</p>
        </div>
      </div>
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
                className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver</span>
              </button>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
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
                  onClick={handleSaveAndPrint}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
            <div>
              <h2 className="text-base font-semibold">Editar Reporte</h2>
              <p className="text-xs opacity-90">Folio: {reportToEdit?.folio}</p>
            </div>
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

export default ReportEditor;