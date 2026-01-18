/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */

const ReportPreview = ({ testConfig, formData, selectedPatient }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

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

      // Para Biometría Hemática y pruebas con valores numéricos
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

      // Para Alcoholímetro - mostrar grados de alcohol y resultado
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
      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          @page {
            size: letter;
            margin: 1cm;
          }
          
          .print-container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            line-height: 1.4;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
        
        @media screen {
          .print-container {
            max-width: 800px;
            margin: 0 auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}</style>
      
      <div className="print-container space-y-6">
        
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