/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */

const ReportPreview = ({ testConfig, formData, selectedPatient }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const generarHTMLReporte = () => {
    const renderTableRows = () => {
      return testConfig.fields.map((field) => {
        const valor = formData[field.key];
        if (!valor || valor.trim?.() === '') return '';

        // Para Antidoping y pruebas con select
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
                  ${testConfig.referencia || field.referencia}
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
              <td style="text-align: center;">${field.unidad}</td>
              <td>
                <div style="font-size: 10px; line-height: 1.4;">
                  ${field.referencia}
                </div>
              </td>
            </tr>
          `;
        }

        // Para Alcoholímetro
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
                  ${testConfig.referencia}
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
                <p><strong>Hora:</strong> ${formData.hora}</p>
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
                <p>${formatDate(formData.fecha)} - ${formData.hora}</p>
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

  // Renderizar vista previa en pantalla
  const renderTableRows = () => {
    return testConfig.fields.map((field) => {
      const valor = formData[field.key];
      if (!valor || valor.trim?.() === '') return null;

      // Para Antidoping y pruebas con select
      if (field.type === 'select') {
        return (
          <tr key={field.key} className="border-t border-gray-300">
            <td className="px-4 py-3 text-gray-800 border-r border-gray-300 font-medium">
              {field.label}
            </td>
            <td className="px-4 py-3 text-center border-r border-gray-300">
              <span className={`font-bold px-3 py-1.5 rounded text-sm ${
                valor === 'POSITIVA' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
              }`}>
                {valor}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-700 text-sm">
              {testConfig.referencia || field.referencia}
            </td>
          </tr>
        );
      }

      // Para Biometría Hemática
      if (testConfig.codigo === 'HEM-BIOM689') {
        return (
          <tr key={field.key} className="border-t border-gray-300">
            <td className="px-4 py-3 text-gray-800 border-r border-gray-300 font-medium">
              {field.label}
            </td>
            <td className="px-4 py-3 text-center border-r border-gray-300">
              <span className="font-bold text-gray-900">{valor}</span>
            </td>
            <td className="px-4 py-3 text-center border-r border-gray-300 text-gray-700">
              {field.unidad}
            </td>
            <td className="px-4 py-3 text-gray-700 text-sm">
              {field.referencia}
            </td>
          </tr>
        );
      }

      // Para Alcoholímetro
      if (testConfig.codigo === 'ALCOHOLIMETRO' && field.key === 'resultado') {
        const gradosAlcohol = formData.gradosAlcohol || '0.0';
        return (
          <tr key={field.key} className="border-t border-gray-300">
            <td className="px-4 py-3 text-gray-800 border-r border-gray-300 font-medium">
              ALCOHOL EN ALIENTO
            </td>
            <td className="px-4 py-3 text-center border-r border-gray-300">
              <div className="flex flex-col items-center gap-2">
                <span className={`font-bold px-3 py-1.5 rounded text-sm ${
                  valor === 'POSITIVA' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
                }`}>
                  {valor}
                </span>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{gradosAlcohol}</span> mg/L
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-gray-700 text-sm">
              {testConfig.referencia}
            </td>
          </tr>
        );
      }

      return null;
    }).filter(Boolean);
  };

  const getTableHeaders = () => {
    if (testConfig.codigo === 'HEM-BIOM689') {
      return (
        <>
          <th className="px-4 py-3 text-left font-bold text-gray-800 border-r border-gray-300 bg-gray-100">PRUEBA</th>
          <th className="px-4 py-3 text-center font-bold text-gray-800 border-r border-gray-300 bg-gray-100">RESULTADO</th>
          <th className="px-4 py-3 text-center font-bold text-gray-800 border-r border-gray-300 bg-gray-100">UNIDAD</th>
          <th className="px-4 py-3 text-left font-bold text-gray-800 bg-gray-100">VALORES REF.</th>
        </>
      );
    }

    return (
      <>
        <th className="px-4 py-3 text-left font-bold text-gray-800 border-r border-gray-300 bg-gray-100">
          {testConfig.codigo === 'ALCOHOLIMETRO' ? 'PRUEBA DE ALCOHOL' : 'PRUEBA'}
        </th>
        <th className="px-4 py-3 text-center font-bold text-gray-800 border-r border-gray-300 bg-gray-100">RESULTADO</th>
        <th className="px-4 py-3 text-left font-bold text-gray-800 bg-gray-100">VALORES DE REFERENCIA</th>
      </>
    );
  };

  return (
    <div className="bg-white p-8">
      <div className="max-w-4xl mx-auto bg-white space-y-6">
        
        {/* Header con logo y título */}
        <div className="border-b-2 border-blue-600 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  "SALUD AL ALCANCE DE TODOS"
                </h1>
                <p className="text-sm text-gray-600">Laboratorio Médico Especializado</p>
                <p className="text-xs text-gray-500 mt-1">Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p><strong>Folio:</strong> #{Math.floor(Math.random() * 10000).toString().padStart(5, '0')}</p>
              <p><strong>Fecha:</strong> {formatDate(formData.fecha)}</p>
              <p><strong>Hora:</strong> {formData.hora}</p>
            </div>
          </div>
        </div>

        {/* Información del Paciente */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            INFORMACIÓN DEL PACIENTE
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Paciente:</span>
              <p className="text-sm text-gray-900 font-medium">{selectedPatient?.nombre || 'No especificado'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Expediente:</span>
              <p className="text-sm text-gray-900">{selectedPatient?.numeroExpediente || 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Edad:</span>
              <p className="text-sm text-gray-900">{selectedPatient?.edad || 'No especificada'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Fecha de realización:</span>
              <p className="text-sm text-gray-900">{formatDate(formData.fecha)} - {formData.hora}</p>
            </div>
          </div>
        </div>

        {/* Título del estudio */}
        <div className="text-center py-3">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
            <h2 className="text-sm font-bold">{testConfig.nombre.toUpperCase()}</h2>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="border-2 border-gray-400 rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-400">
                {getTableHeaders()}
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>

        {/* Observaciones */}
        {formData.observaciones && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <p className="text-sm font-bold text-gray-800 mb-2">OBSERVACIONES:</p>
            <p className="text-sm text-gray-700 leading-relaxed">{formData.observaciones}</p>
          </div>
        )}

        {/* Método y Técnica */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-bold text-gray-800">TÉCNICA:</span>
              <span className="ml-2 text-sm text-gray-700">{testConfig.tecnica}</span>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">MÉTODO:</span>
              <span className="ml-2 text-sm text-gray-700">{testConfig.metodo}</span>
            </div>
          </div>
        </div>

        {/* Fin del informe */}
        <div className="text-center py-3">
          <div className="inline-block bg-gray-900 text-white px-8 py-2 rounded-lg">
            <p className="text-sm font-bold">*** FIN DEL INFORME ***</p>
          </div>
        </div>

        {/* Espacio para firma */}
        <div className="h-20"></div>

        {/* Información del profesional */}
        <div className="border-t-2 border-gray-400 pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-gray-900">ATENTAMENTE</p>
            <div className="h-12 border-b-2 border-gray-400 w-64 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-900">Q.F.B ELIUTH GARCIA CRUZ</p>
            <p className="text-xs text-gray-700">CED.PROF. 4362774</p>
            <p className="text-xs text-gray-600">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
            
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs font-semibold text-gray-800">Asistente Médico</p>
              <p className="text-xs text-gray-600">Linn Castillo - 7731333631</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportPreview;