import React, { useState, useCallback } from 'react';
import { ArrowLeft, Printer, AlertCircle } from 'lucide-react';
import PatientSearchModal from './PatientSearchModal';
import { reportesAPI } from '../services/api';

const DRUG_TESTS = [
  { key: 'canabinoides', label: 'CANABINOIDES' },
  { key: 'cocaina', label: 'COCAINA' },
  { key: 'anfetaminas', label: 'ANFETAMINAS' },
  { key: 'metanfetaminas', label: 'METANFETAMINAS' },
  { key: 'morfina', label: 'MORFINA OPIACEOS' },
  { key: 'benzodiazepinas', label: 'BENZODIAZEPINAS' }
];

const ValidationAlert = ({ errors }) => {
  if (errors.length === 0) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start mb-2">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <span className="text-red-700 font-medium text-sm font-inter">Completa los siguientes campos:</span>
      </div>
      <ul className="text-sm text-red-600 list-disc list-inside ml-7 font-inter">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

const DrugTestRow = ({ test, value, onChange }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
    <div className="mb-2">
      <span className="font-medium text-gray-800 text-sm font-inter">{test.label}</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange(test.key, 'NEGATIVA')}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors font-inter ${
          value === 'NEGATIVA'
            ? 'bg-green-500 text-white shadow-sm'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        NEGATIVA
      </button>
      <button
        type="button"
        onClick={() => onChange(test.key, 'POSITIVA')}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors font-inter ${
          value === 'POSITIVA'
            ? 'bg-red-500 text-white shadow-sm'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        POSITIVA
      </button>
    </div>
  </div>
);

const AntidopingComponent = ({ onBack, pruebaData }) => {
  const [showPatientSearch, setShowPatientSearch] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    pacienteId: '',
    nombre: '',
    numeroExpediente: '',
    edad: '',
    fecha: new Date().toISOString().split('T')[0],
    canabinoides: 'NEGATIVA',
    cocaina: 'NEGATIVA',
    anfetaminas: 'NEGATIVA',
    metanfetaminas: 'NEGATIVA',
    morfina: 'NEGATIVA',
    benzodiazepinas: 'NEGATIVA'
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
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  }, [errors.length]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const generarHTMLReporte = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte Antidoping - ${selectedPatient?.nombre}</title>
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
            font-size: 12px;
            color: #64748b;
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
            text-align: left;
            font-weight: bold;
            color: #1e293b;
          }

          .results-table td {
            border: 1px solid #e2e8f0;
            padding: 10px;
            color: #475569;
          }

          .results-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
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
          }

          .result-positiva {
            background-color: #fee2e2;
            color: #b91c1c;
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
                </div>
              </div>
              <div class="folio-info">
                <p><strong>Folio:</strong> #${Math.floor(Math.random() * 10000)}</p>
                <p><strong>Fecha:</strong> ${formatDate(formData.fecha)}</p>
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
                <label>Fecha:</label>
                <p>${formatDate(formData.fecha) || 'No especificada'}</p>
              </div>
              <div class="patient-field">
                <label>Edad:</label>
                <p>${selectedPatient?.edad || 'No especificada'}</p>
              </div>
              <div class="patient-field">
                <label>Expediente:</label>
                <p>${selectedPatient?.numeroExpediente || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div class="title-section">
            <div class="title-box">
              <h2>PERFIL DE DROGAS DE ABUSO 6</h2>
            </div>
          </div>

          <table class="results-table">
            <thead>
              <tr>
                <th style="width: 35%;">PRUEBA</th>
                <th style="width: 25%; text-align: center;">RESULTADO</th>
                <th style="width: 40%;">VALORES REF.</th>
              </tr>
            </thead>
            <tbody>
              ${DRUG_TESTS.map((test) => {
                const result = formData[test.key] || 'NEGATIVA';
                return `
                  <tr>
                    <td>${test.label}</td>
                    <td style="text-align: center;">
                      <span class="result-badge result-${result.toLowerCase()}">${result}</span>
                    </td>
                    <td>
                      <div style="font-size: 10px; line-height: 1.4;">
                        NEG: &lt;150 ng/ml<br>
                        POS: ≥150 ng/ml
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="method-section">
            <div class="method-item">
              <strong>TÉCNICA:</strong>
              <span>RIA</span>
            </div>
            <div class="method-item">
              <strong>MÉTODO:</strong>
              <span>Inmunocromatografía</span>
            </div>
          </div>

          <div class="end-section">
            <div class="end-box">
              <p>FIN DEL INFORME</p>
            </div>
          </div>

          <div class="signature-section">
            <p style="font-weight: bold; margin-bottom: 10px;">ATENTAMENTE</p>
            <p class="signature-name">Q.F.B ELIUTH GARCIA CRUZ</p>
            <p class="signature-credential">CED.PROF. 4362774</p>
            <p class="signature-credential">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
            <p class="signature-credential">Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
            
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
    const validationErrors = [];
    if (!formData.fecha) validationErrors.push('Fecha');
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    
    try {
      // Primero imprimir
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
        resultados = DRUG_TESTS.map((test, index) => {
          const subPrueba = pruebaData.subPruebas[index] || pruebaData.subPruebas[0];
          return {
            subPruebaId: subPrueba?._id || null,
            clave: test.key.toUpperCase(),
            nombre: test.label,
            valor: formData[test.key] || 'NEGATIVA',
            unidad: '',
            referencia: 'NEG: <150 ng/ml, POS: ≥150 ng/ml'
          };
        });
      } else {
        resultados = DRUG_TESTS.map((test) => ({
          clave: test.key.toUpperCase(),
          nombre: test.label,
          valor: formData[test.key] || 'NEGATIVA',
          unidad: '',
          referencia: 'NEG: <150 ng/ml, POS: ≥150 ng/ml'
        }));
      }

      const reportData = {
        pacienteId: formData.pacienteId,
        pruebaId: pruebaData?._id,
        fechaRealizacion: formData.fecha,
        resultados: resultados,
        observaciones: 'Perfil de drogas de abuso 6',
        estado: 'completado',
        solicitadoPor: 'A QUIEN CORRESPONDA'
      };

      await reportesAPI.create(reportData);
      alert('Reporte guardado exitosamente');
      
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

  if (showPatientSearch) {
    return (
      <PatientSearchModal
        onClose={onBack}
        onSelectPatient={handlePatientSelect}
      />
    );
  }

  const inputClass = (field) => `w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter ${
    errors.includes(field) ? 'border-red-300 bg-red-50' : 'border-gray-300'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 font-poppins">
                Reporte Antidoping
              </h2>
              <p className="text-sm text-gray-600 font-inter">
                Completa la información y revisa la vista previa
              </p>
            </div>
          </div>
          <button
            onClick={handlePrintAndSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Guardar e Imprimir</span>
              </>
            )}
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Formulario - Lado Izquierdo */}
          <div className="w-1/3 border-r overflow-y-auto p-4 bg-gray-50">
            <ValidationAlert errors={errors} />
            
            {/* Información del Paciente */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 font-poppins">Paciente Seleccionado</h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 font-inter">{selectedPatient?.nombre}</p>
                <div className="flex gap-4 text-sm text-gray-600 font-inter">
                  <span>Exp: {selectedPatient?.numeroExpediente || 'N/A'}</span>
                  {selectedPatient?.edad && <span>Edad: {selectedPatient.edad} años</span>}
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Fecha de Realización *
              </label>
              <input
                type="date"
                value={formData.fecha || ''}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className={inputClass('Fecha')}
              />
            </div>

            {/* Pruebas de Drogas */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 font-poppins">Pruebas de Drogas</h3>
              <div className="space-y-3">
                {DRUG_TESTS.map((test) => (
                  <DrugTestRow
                    key={test.key}
                    test={test}
                    value={formData[test.key] || 'NEGATIVA'}
                    onChange={handleInputChange}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Vista Previa - Lado Derecho */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
              
              {/* Header */}
              <div className="mb-6 pb-4 border-b-4 border-blue-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs text-center leading-tight">SALUD</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-800 font-poppins leading-tight">"SALUD AL ALCANCE DE TODOS"</h1>
                      <p className="text-sm text-gray-600 font-inter">Laboratorio Médico Especializado</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 font-inter">
                    <p className="mb-1"><strong>Folio:</strong> #{Math.floor(Math.random() * 10000)}</p>
                    <p><strong>Fecha:</strong> {formatDate(formData.fecha)}</p>
                  </div>
                </div>
              </div>

              {/* Información del Paciente */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h2 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300 font-poppins">
                  INFORMACIÓN DEL PACIENTE
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm font-inter">
                  <div>
                    <span className="font-medium text-gray-600">Paciente:</span>
                    <p className="text-gray-800 font-medium mt-0.5">{selectedPatient?.nombre || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fecha:</span>
                    <p className="text-gray-800 mt-0.5">{formatDate(formData.fecha) || 'No especificada'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Edad:</span>
                    <p className="text-gray-800 mt-0.5">{selectedPatient?.edad || 'No especificada'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Expediente:</span>
                    <p className="text-gray-800 mt-0.5">{selectedPatient?.numeroExpediente || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Título */}
              <div className="text-center my-6">
                <div className="bg-blue-600 text-white py-3 px-6 rounded-lg inline-block">
                  <h2 className="text-sm font-bold font-poppins">PERFIL DE DROGAS DE ABUSO 6</h2>
                </div>
              </div>

              {/* Tabla de Resultados */}
              <div className="mb-6">
                <table className="w-full text-sm border-collapse font-inter">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-bold text-gray-700 border border-gray-300">PRUEBA</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 border border-gray-300">RESULTADO</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 border border-gray-300">VALORES REF.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {DRUG_TESTS.map((test, index) => {
                      const result = formData[test.key] || 'NEGATIVA';
                      return (
                        <tr key={test.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-gray-700 border border-gray-200">{test.label}</td>
                          <td className="px-4 py-3 text-center border border-gray-200">
                            <span className={`font-bold px-3 py-1 rounded text-xs inline-block ${
                              result === 'POSITIVA' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {result}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 border border-gray-200">
                            <div className="text-xs leading-tight">
                              <p>NEG: &lt;150 ng/ml</p>
                              <p>POS: ≥150 ng/ml</p>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Método */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-around text-sm font-inter">
                  <div>
                    <span className="font-bold text-gray-700">TÉCNICA:</span>
                    <span className="ml-2 text-gray-600">RIA</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">MÉTODO:</span>
                    <span className="ml-2 text-gray-600">Inmunocromatografía</span>
                  </div>
                </div>
              </div>

              {/* Fin del informe */}
              <div className="text-center my-6">
                <div className="bg-gray-800 text-white py-2 px-6 rounded-lg inline-block">
                  <p className="text-sm font-bold font-poppins">FIN DEL INFORME</p>
                </div>
              </div>

              {/* Espacio para firma */}
              <div className="h-16"></div>

              {/* Firma */}
              <div className="border-t-2 border-gray-300 pt-6">
                <div className="text-center space-y-2 font-inter">
                  <p className="text-sm font-bold text-gray-800">ATENTAMENTE</p>
                  <p className="text-sm font-bold text-gray-800">Q.F.B ELIUTH GARCIA CRUZ</p>
                  <p className="text-xs text-gray-600">CED.PROF. 4362774</p>
                  <p className="text-xs text-gray-600">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
                  <p className="text-xs text-gray-600">Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-700">Asistente Médico</p>
                    <p className="text-xs text-gray-600">Linn Castillo - 7731333631</p>
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

export default AntidopingComponent;