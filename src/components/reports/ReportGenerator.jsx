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

  const generarHTMLReporte = () => {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const renderTableRows = () => {
      return testConfig.fields.map((field) => {
        const valor = formData[field.key];
        if (!valor || valor.trim?.() === '') return '';

        // Para pruebas con select (Antidoping, Alcoholímetro)
        if (field.type === 'select') {
          const resultClass = valor === 'POSITIVA' ? 'result-positiva' : 'result-negativa';
          return `
            <tr>
              <td>${field.label}</td>
              <td style="text-align: center;">
                <span class="result-badge ${resultClass}">${valor}</span>
              </td>
              <td>
                <div style="font-size: 10px; line-height: 1.4;">
                  ${testConfig.referencia || field.referencia || ''}
                </div>
              </td>
            </tr>
          `;
        }

        // Para Biometría Hemática
        if (testConfig.codigo === 'HEM-BIOM689') {
          return `
            <tr>
              <td>${field.label}</td>
              <td style="text-align: center;"><strong>${valor}</strong></td>
              <td style="text-align: center;">${field.unidad || ''}</td>
              <td>
                <div style="font-size: 10px; line-height: 1.4;">
                  ${field.referencia || ''}
                </div>
              </td>
            </tr>
          `;
        }

        // Para Alcoholímetro con resultado
        if (testConfig.codigo === 'ALCOHOLIMETRO' && field.key === 'resultado') {
          const gradosAlcohol = formData.gradosAlcohol || '0.0';
          const resultClass = valor === 'POSITIVA' ? 'result-positiva' : 'result-negativa';
          return `
            <tr>
              <td>ALCOHOL EN ALIENTO</td>
              <td style="text-align: center;">
                <div>
                  <span class="result-badge ${resultClass}">${valor}</span>
                  <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${gradosAlcohol} mg/L</div>
                </div>
              </td>
              <td>
                <div style="font-size: 10px; line-height: 1.4;">
                  ${testConfig.referencia || ''}
                </div>
              </td>
            </tr>
          `;
        }

        return '';
      }).filter(Boolean).join('');
    };

    const getTableHeaders = () => {
      if (testConfig.codigo === 'HEM-BIOM689') {
        return `
          <th style="text-align: left;">PRUEBA</th>
          <th style="text-align: center;">RESULTADO</th>
          <th style="text-align: center;">UNIDAD</th>
          <th style="text-align: left;">VALORES REF.</th>
        `;
      }

      return `
        <th style="text-align: left;">${testConfig.codigo === 'ALCOHOLIMETRO' ? 'PRUEBA DE ALCOHOL' : 'PRUEBA'}</th>
        <th style="text-align: center;">RESULTADO</th>
        <th style="text-align: left;">VALORES DE REFERENCIA</th>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte ${testConfig.nombre} - ${selectedPatient?.nombre}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 20px;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 20mm;
          }

          .header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: start;
          }

          .logo-section {
            display: flex;
            align-items: start;
            gap: 15px;
          }

          .logo-circle {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .logo-text {
            color: white;
            font-weight: bold;
            font-size: 10px;
            text-align: center;
          }

          .company-info h1 {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 4px;
          }

          .company-info p {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
          }

          .folio-info {
            text-align: right;
            font-size: 11px;
            color: #64748b;
          }

          .folio-info p {
            margin-bottom: 4px;
          }

          .patient-info {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }

          .patient-info h2 {
            font-size: 12px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #cbd5e1;
          }

          .patient-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 11px;
          }

          .patient-field label {
            display: block;
            font-weight: 600;
            color: #64748b;
            margin-bottom: 2px;
          }

          .patient-field p {
            color: #1e293b;
            font-weight: 500;
          }

          .title-section {
            text-align: center;
            margin: 25px 0;
          }

          .title-box {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            display: inline-block;
          }

          .title-box h2 {
            font-size: 14px;
            font-weight: bold;
          }

          .results-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 20px;
          }

          .results-table th {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 10px;
            font-weight: bold;
            color: #1e293b;
          }

          .results-table td {
            border: 1px solid #e2e8f0;
            padding: 10px;
            color: #475569;
          }

          .result-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
          }

          .result-negativa {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
          }

          .result-positiva {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
          }

          .observations-section {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 11px;
          }

          .observations-section strong {
            display: block;
            color: #92400e;
            margin-bottom: 6px;
          }

          .observations-section p {
            color: #78350f;
            line-height: 1.5;
          }

          .method-section {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-around;
            font-size: 11px;
          }

          .method-item {
            text-align: center;
          }

          .method-item strong {
            color: #1e293b;
            font-weight: bold;
          }

          .method-item span {
            color: #64748b;
            margin-left: 8px;
          }

          .end-section {
            text-align: center;
            margin: 25px 0;
          }

          .end-box {
            background: #1e293b;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            display: inline-block;
          }

          .end-box p {
            font-size: 12px;
            font-weight: bold;
          }

          .signature-section {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
          }

          .signature-section p {
            margin-bottom: 6px;
            font-size: 11px;
          }

          .signature-name {
            font-weight: bold;
            color: #1e293b;
            font-size: 12px;
          }

          .signature-credential {
            color: #64748b;
            font-size: 10px;
          }

          .assistant-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
          }

          .assistant-section p {
            font-size: 10px;
            color: #64748b;
          }

          .assistant-name {
            font-weight: 600;
            color: #1e293b;
          }

          @media print {
            body {
              padding: 0;
            }

            .page {
              margin: 0;
              padding: 15mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="header-content">
              <div class="logo-section">
                <div class="logo-circle">
                  <div class="logo-text">SALUD</div>
                </div>
                <div class="company-info">
                  <h1>"SALUD AL ALCANCE DE TODOS"</h1>
                  <p>Laboratorio Médico Especializado</p>
                  <p>Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
                </div>
              </div>
              <div class="folio-info">
                <p><strong>Folio:</strong> #${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}</p>
                <p><strong>Fecha:</strong> ${formatDate(formData.fecha)}</p>
                <p><strong>Hora:</strong> ${formData.hora || ''}</p>
              </div>
            </div>
          </div>

          <div class="patient-info">
            <h2>INFORMACIÓN DEL PACIENTE</h2>
            <div class="patient-grid">
              <div class="patient-field">
                <label>Paciente:</label>
                <p>${selectedPatient?.nombre || 'No especificado'}</p>
              </div>
              <div class="patient-field">
                <label>Expediente:</label>
                <p>${selectedPatient?.numeroExpediente || 'N/A'}</p>
              </div>
              <div class="patient-field">
                <label>Edad:</label>
                <p>${selectedPatient?.edad || 'No especificada'}</p>
              </div>
              <div class="patient-field">
                <label>Fecha de realización:</label>
                <p>${formatDate(formData.fecha)} - ${formData.hora || ''}</p>
              </div>
            </div>
          </div>

          <div class="title-section">
            <div class="title-box">
              <h2>${testConfig.nombre.toUpperCase()}</h2>
            </div>
          </div>

          <table class="results-table">
            <thead>
              <tr>
                ${getTableHeaders()}
              </tr>
            </thead>
            <tbody>
              ${renderTableRows()}
            </tbody>
          </table>

          ${formData.observaciones ? `
          <div class="observations-section">
            <strong>OBSERVACIONES:</strong>
            <p>${formData.observaciones}</p>
          </div>
          ` : ''}

          <div class="method-section">
            <div class="method-item">
              <strong>TÉCNICA:</strong>
              <span>${testConfig.tecnica}</span>
            </div>
            <div class="method-item">
              <strong>MÉTODO:</strong>
              <span>${testConfig.metodo}</span>
            </div>
          </div>

          <div class="end-section">
            <div class="end-box">
              <p>*** FIN DEL INFORME ***</p>
            </div>
          </div>

          <div class="signature-section">
            <p style="font-weight: bold; margin-bottom: 10px;">ATENTAMENTE</p>
            <p class="signature-name">Q.F.B ELIUTH GARCIA CRUZ</p>
            <p class="signature-credential">CED.PROF. 4362774</p>
            <p class="signature-credential">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
            
            <div class="assistant-section">
              <p class="assistant-name">Asistente Médico</p>
              <p>Linn Castillo - 7731333631</p>
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
      // Primero imprimir el documento
      const contenidoHTML = generarHTMLReporte();
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(contenidoHTML);
      iframeDoc.close();
      
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 100);
          } catch (error) {
            console.error('Error al imprimir:', error);
            document.body.removeChild(iframe);
          }
        }, 250);
      };

      // Luego guardar en BD
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