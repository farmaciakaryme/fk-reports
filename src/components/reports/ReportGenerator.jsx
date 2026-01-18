/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, AlertCircle, Loader2 } from 'lucide-react';
import PatientSearchModal from '../patients/PatientSearchsModal';
import ReportPreview from './ReportPreview';
import { reportesAPI, pruebasAPI } from '../../services/api';
import { printReport } from '../../utils/printUtils';

// Componente de Formulario Dinámico
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
        // ✅ ESTRUCTURA REAL: valoresReferencia.opciones
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

  // ✅ CARGAR CONFIGURACIÓN DE LA PRUEBA DESDE BD
  useEffect(() => {
    const loadTestConfig = async () => {
      if (!pruebaData) {
        setIsLoadingTest(false);
        return;
      }

      try {
        setIsLoadingTest(true);
        
        // Si pruebaData ya tiene subPruebas, usarlo directamente
        if (pruebaData.subPruebas && pruebaData.subPruebas.length > 0) {
          console.log('✅ Usando pruebaData directamente:', pruebaData);
          setTestConfig(pruebaData);
          
          // ✅ Inicializar TODAS las subpruebas que tienen opciones
          const defaults = {};
          pruebaData.subPruebas.forEach(subPrueba => {
            const tieneOpciones = subPrueba.valoresReferencia?.opciones?.length > 0;
            if (tieneOpciones) {
              // Usar la primera opción (que es NEGATIVA según tu estructura)
              defaults[subPrueba._id] = subPrueba.valoresReferencia.opciones[0].valor;
            }
          });
          setFormData(prev => ({ ...prev, ...defaults }));
        } 
        // Si no, intentar cargar desde la API
        else if (pruebaData._id) {
          console.log('🔄 Cargando desde API:', pruebaData._id);
          const data = await pruebasAPI.getById(pruebaData._id);
          console.log('✅ Datos cargados:', data);
          setTestConfig(data);

          // ✅ Inicializar TODAS las subpruebas que tienen opciones
          const defaults = {};
          data.subPruebas?.forEach(subPrueba => {
            const tieneOpciones = subPrueba.valoresReferencia?.opciones?.length > 0;
            if (tieneOpciones) {
              // Usar la primera opción (que es NEGATIVA según tu estructura)
              defaults[subPrueba._id] = subPrueba.valoresReferencia.opciones[0].valor;
            }
          });
          setFormData(prev => ({ ...prev, ...defaults }));
        }
      } catch (error) {
        console.error('❌ Error al cargar configuración de prueba:', error);
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
    
    // ✅ NO VALIDAR - Los campos pueden estar vacíos si el usuario no los llenó
    // La validación anterior exigía al menos un resultado, pero ahora permitimos reportes vacíos
    
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

  const generarHTMLReporte = () => {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

            const renderTableRows = () => {
      let rows = '';

      testConfig.subPruebas?.forEach((subPrueba) => {
        const valor = formData[subPrueba._id];
        const tieneOpciones = subPrueba.valoresReferencia?.opciones?.length > 0;
        const valorFinal = valor !== undefined && valor !== null && valor !== '' 
          ? valor 
          : (tieneOpciones ? subPrueba.valoresReferencia.opciones[0].valor : null);
        
        if (!valorFinal) return;

        const referencia = subPrueba.valoresReferencia?.texto || '';

        // Para campos tipo select (NEGATIVA/POSITIVA)
        if (tieneOpciones) {
          const bgColor = (valorFinal === 'POSITIVA' || valorFinal === 'POSITIVO') ? '#fee2e2' : '#d1fae5';
          const textColor = (valorFinal === 'POSITIVA' || valorFinal === 'POSITIVO') ? '#991b1b' : '#065f46';
          rows += `
            <tr>
              <td style="padding: 10px 12px; color: #374151; border-right: 1px solid #e5e7eb;">
                ${subPrueba.nombre}
              </td>
              <td style="padding: 10px 12px; text-align: center; border-right: 1px solid #e5e7eb;">
                <span style="font-weight: bold; padding: 3px 8px; border-radius: 9999px; font-size: 11px; background-color: ${bgColor}; color: ${textColor}; display: inline-block;">
                  ${valorFinal}
                </span>
              </td>
              <td style="padding: 10px 12px; color: #374151;">
                <div style="font-size: 11px; line-height: 1.4; color: #6b7280;">
                  ${referencia}
                </div>
              </td>
            </tr>
          `;
        } 
        // Para campos numéricos o de texto
        else {
          rows += `
            <tr>
              <td style="padding: 10px 12px; color: #374151; border-right: 1px solid #e5e7eb;">
                ${subPrueba.nombre}
              </td>
              <td style="padding: 10px 12px; text-align: center; border-right: 1px solid #e5e7eb;">
                <strong>${valorFinal}</strong>
              </td>
              <td style="padding: 10px 12px; color: #374151;">
                <div style="font-size: 11px; line-height: 1.4; color: #6b7280;">
                  ${referencia}
                </div>
              </td>
            </tr>
          `;
        }
      });

      return rows;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte ${testConfig?.nombre} - ${selectedPatient?.nombre}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 20px;
          }
          
          .page {
            max-width: 1024px;
            margin: 0 auto;
            background: white;
            border: 1px solid #d1d5db;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 24px;
          }
          
          /* HEADER */
          .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo {
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
            flex-shrink: 0;
          }
          
          .company-info h1 {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 3px;
          }
          
          .company-info p {
            font-size: 12px;
            color: #6b7280;
          }
          
          .header-right {
            text-align: right;
            font-size: 11px;
            color: #6b7280;
          }
          
          .header-right p {
            margin-bottom: 3px;
          }
          
          /* PATIENT INFO */
          .patient-section {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
          }
          
          .patient-section h2 {
            font-size: 11px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid #d1d5db;
          }
          
          .patient-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12px;
          }
          
          .patient-field span.label {
            font-weight: 500;
            color: #6b7280;
          }
          
          .patient-field p {
            color: #1f2937;
            font-weight: 500;
            margin-top: 3px;
          }
          
          /* TEST TITLE */
          .title-section {
            text-align: center;
            margin-bottom: 16px;
          }
          
          .title-box {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
          }
          
          /* TABLE */
          .results-table-container {
            margin-bottom: 16px;
          }
          
          .results-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            font-size: 12px;
          }
          
          .results-table thead {
            background-color: #f3f4f6;
          }
          
          .results-table th {
            padding: 10px 12px;
            font-weight: bold;
            color: #374151;
            border-right: 1px solid #e5e7eb;
            text-align: left;
          }
          
          .results-table th:last-child {
            border-right: none;
          }
          
          .results-table th.text-center {
            text-align: center;
          }
          
          .results-table tbody {
            background: white;
          }
          
          /* OBSERVATIONS */
          .observations {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
          }
          
          .observations p.title {
            font-size: 11px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 6px;
          }
          
          .observations p.content {
            font-size: 12px;
            color: #374151;
            line-height: 1.5;
          }
          
          /* METHOD */
          .method-section {
            background-color: #eff6ff;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }
          
          .method-item span.label {
            font-weight: bold;
            color: #374151;
          }
          
          .method-item span.value {
            color: #6b7280;
            margin-left: 6px;
          }
          
          /* END */
          .end-section {
            text-align: center;
            margin-bottom: 16px;
          }
          
          .end-box {
            display: inline-block;
            background: #1f2937;
            color: white;
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          
          /* SIGNATURE */
          .signature-section {
            margin-top: 50px;
            border-top: 2px solid #e5e7eb;
            padding-top: 12px;
            text-align: center;
          }
          
          .signature-section p {
            font-size: 11px;
            color: #1f2937;
            margin-bottom: 5px;
          }
          
          .signature-section p.title {
            font-weight: bold;
          }
          
          .signature-section p.credential {
            font-size: 10px;
            color: #6b7280;
          }
          
          .assistant-section {
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
          }
          
          .assistant-section p.name {
            font-weight: 500;
            color: #374151;
            font-size: 11px;
          }
          
          .assistant-section p.contact {
            color: #6b7280;
            font-size: 10px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .page {
              margin: 0;
              padding: 16px;
              box-shadow: none;
            }
            .signature-section {
              margin-top: 40px;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          
          <!-- HEADER -->
          <div class="header">
            <div class="header-left">
              <div class="logo">SALUD</div>
              <div class="company-info">
                <h1>"SALUD AL ALCANCE DE TODOS"</h1>
                <p>Laboratorio Médico Especializado</p>
              </div>
            </div>
            <div class="header-right">
              <p>Folio: #${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}</p>
              <p>Fecha: ${formatDate(formData.fecha)}</p>
            </div>
          </div>
          
          <!-- PATIENT INFO -->
          <div class="patient-section">
            <h2>INFORMACIÓN DEL PACIENTE</h2>
            <div class="patient-grid">
              <div class="patient-field">
                <span class="label">Paciente:</span>
                <p>${selectedPatient?.nombre || 'No especificado'}</p>
              </div>
              <div class="patient-field">
                <span class="label">Expediente:</span>
                <p>${selectedPatient?.numeroExpediente || 'N/A'}</p>
              </div>
              <div class="patient-field">
                <span class="label">Edad:</span>
                <p>${selectedPatient?.edad || 'No especificada'}</p>
              </div>
              <div class="patient-field">
                <span class="label">Fecha de realización:</span>
                <p>${formatDate(formData.fecha)} - ${formData.hora}</p>
              </div>
            </div>
          </div>
          
          <!-- TEST TITLE -->
          <div class="title-section">
            <div class="title-box">
              ${testConfig?.nombre?.toUpperCase() || 'REPORTE'}
            </div>
          </div>
          
          <!-- RESULTS TABLE -->
          <div class="results-table-container">
            <table class="results-table">
              <thead>
                <tr>
                  <th>PRUEBA</th>
                  <th class="text-center">RESULTADO</th>
                  <th>VALORES REF.</th>
                </tr>
              </thead>
              <tbody>
                ${renderTableRows()}
              </tbody>
            </table>
          </div>
          
          ${formData.observaciones ? `
          <div class="observations">
            <p class="title">OBSERVACIONES:</p>
            <p class="content">${formData.observaciones}</p>
          </div>
          ` : ''}
          
          <!-- METHOD -->
          <div class="method-section">
            <div class="method-item">
              <span class="label">TÉCNICA:</span>
              <span class="value">${testConfig?.tecnica || 'N/A'}</span>
            </div>
            <div class="method-item">
              <span class="label">MÉTODO:</span>
              <span class="value">${testConfig?.metodo || 'N/A'}</span>
            </div>
          </div>
          
          <!-- END -->
          <div class="end-section">
            <div class="end-box">FIN DEL INFORME</div>
          </div>
          
          <!-- SIGNATURE -->
          <div class="signature-section">
            <p class="title">ATENTAMENTE</p>
            <p class="title">Q.F.B ELIUTH GARCIA CRUZ</p>
            <p class="credential">CED.PROF. 4362774</p>
            <p class="credential">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
            <p class="credential">Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
            
            <div class="assistant-section">
              <p class="name">Asistente Médico</p>
              <p class="contact">Linn Castillo - 7731333631</p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintAndSave = async () => {
    setIsSaving(true);
    try {
      // ✅ USAR FUNCIÓN DE IMPRESIÓN COMPATIBLE CON MÓVIL
      const contenidoHTML = generarHTMLReporte();
      await printReport(contenidoHTML, `reporte_${testConfig?.codigo || 'laboratorio'}`);

      // Preparar resultados para guardar
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
            referencia: subPrueba.valorReferencia || ''
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
      
      alert('✅ Reporte guardado e impreso exitosamente');
      setTimeout(() => onBack(), 500);
      
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