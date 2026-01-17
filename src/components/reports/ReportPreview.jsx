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
      if (!valor || valor.trim?.() === '' || field.type === 'computed') return null;

      // Para Antidoping y pruebas con select
      if (field.type === 'select') {
        return (
          <tr key={field.key} className="border-t border-gray-200">
            <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700 border-r border-gray-300">
              {field.label}
            </td>
            <td className="px-4 py-3 print:px-3 print:py-2 text-center border-r border-gray-300">
              <span className={`font-bold px-2 py-1 rounded text-xs inline-block ${
                valor === 'POSITIVA' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {valor}
              </span>
            </td>
            <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700">
              <div className="text-xs print:text-[10px] leading-tight">
                {testConfig.referencia || field.referencia}
              </div>
            </td>
          </tr>
        );
      }

      // Para Biometría Hemática y pruebas con valores numéricos
      if (testConfig.codigo === 'HEM-BIOM689') {
        return (
          <tr key={field.key} className="border-t border-gray-200">
            <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700 border-r border-gray-300">
              {field.label}
            </td>
            <td className="px-4 py-3 print:px-3 print:py-2 text-center border-r border-gray-300">
              <span className="font-bold text-gray-800">{valor}</span>
            </td>
            <td className="px-4 py-3 print:px-3 print:py-2 text-center border-r border-gray-300 text-gray-600">
              {field.unidad}
            </td>
            <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700">
              <div className="text-xs print:text-[10px] leading-tight">
                {field.referencia}
              </div>
            </td>
          </tr>
        );
      }

      // Para Alcoholímetro
      if (testConfig.codigo === 'ALCOHOLIMETRO') {
        const resultado = parseFloat(formData.gradosAlcohol || 0) > 0.1 ? 'POSITIVA' : 'NEGATIVA';
        return (
          <tr key={field.key} className="border-t border-gray-200">
            <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700 border-r border-gray-300">
              {field.label}
            </td>
            <td className="px-4 py-3 print:px-3 print:py-2 text-center border-r border-gray-300">
              <div className="space-y-1">
                <span className={`font-bold px-2 py-1 rounded text-xs inline-block ${
                  resultado === 'POSITIVA' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {resultado}
                </span>
                <div className="text-xs print:text-[10px] text-gray-600">{valor} mg/L</div>
              </div>
            </td>
            <td className="px-4 py-3 print:px-3 print:py-2 text-gray-700">
              <div className="text-xs print:text-[10px] leading-tight">
                {testConfig.referencia}
              </div>
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
          <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700 border-r border-gray-300">PRUEBA</th>
          <th className="px-4 py-3 print:px-3 print:py-2 text-center font-bold text-gray-700 border-r border-gray-300">RESULTADO</th>
          <th className="px-4 py-3 print:px-3 print:py-2 text-center font-bold text-gray-700 border-r border-gray-300">UNIDAD</th>
          <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700">VALORES REF.</th>
        </>
      );
    }

    return (
      <>
        <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700 border-r border-gray-300">
          {testConfig.codigo === 'ALCOHOLIMETRO' ? 'PRUEBA DE ALCOHOL' : 'PRUEBA'}
        </th>
        <th className="px-4 py-3 print:px-3 print:py-2 text-center font-bold text-gray-700 border-r border-gray-300">RESULTADO</th>
        <th className="px-4 py-3 print:px-3 print:py-2 text-left font-bold text-gray-700">VALORES DE REFERENCIA</th>
      </>
    );
  };

  return (
    <div className="p-8 print:p-0">
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
                  <h1 className="text-lg print:text-base font-bold text-gray-800 leading-tight">
                    "SALUD AL ALCANCE DE TODOS"
                  </h1>
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
            <h2 className="text-sm print:text-xs font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
              INFORMACIÓN DEL PACIENTE
            </h2>
            <div className="grid grid-cols-2 gap-3 print:gap-2 text-sm print:text-xs">
              <div>
                <span className="font-medium text-gray-600">Paciente:</span>
                <p className="text-gray-800 font-medium">{selectedPatient?.nombre || 'No especificado'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Fecha:</span>
                <p className="text-gray-800">{formatDate(formData.fecha)}</p>
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
              <h2 className="text-sm print:text-xs font-bold">{testConfig.nombre.toUpperCase()}</h2>
            </div>
          </div>

          {/* Tabla de Resultados */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm print:text-xs border-2 border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  {getTableHeaders()}
                </tr>
              </thead>
              <tbody className="bg-white">
                {renderTableRows()}
              </tbody>
            </table>
          </div>

          {/* Observaciones */}
          {formData.observaciones && (
            <div className="bg-yellow-50 print:bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <p className="text-sm print:text-xs font-bold text-gray-700 mb-1">OBSERVACIONES:</p>
              <p className="text-xs print:text-[10px] text-gray-600">{formData.observaciones}</p>
            </div>
          )}

          {/* Método */}
          <div className="bg-blue-50 print:bg-blue-100 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm print:text-xs gap-4">
              <div>
                <span className="font-bold text-gray-700">TÉCNICA:</span>
                <span className="ml-2 text-gray-600">{testConfig.tecnica}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">MÉTODO:</span>
                <span className="ml-2 text-gray-600">{testConfig.metodo}</span>
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
              <p className="text-xs print:text-[10px] text-gray-600">
                Av República del Salvador S/N Colonia centro Atotonilco de Tula
              </p>
              
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-xs print:text-[10px] font-medium text-gray-700">Asistente Médico</p>
                <p className="text-xs print:text-[10px] text-gray-600">Linn Castillo - 7731333631</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
