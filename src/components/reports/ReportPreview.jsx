/* eslint-disable react/no-unknown-property */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import firmaImg from '../../images/firma.png';

const ReportPreview = ({ testConfig, formData, selectedPatient }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderTableRows = () => {
    if (!testConfig?.subPruebas) return null;

    return testConfig.subPruebas.map((subPrueba) => {
      const valor = formData[subPrueba._id];
      
      // ✅ Para campos con opciones, usar valor por defecto si no hay valor explícito
      const tieneOpciones = subPrueba.valoresReferencia?.opciones?.length > 0;
      const valorFinal = valor !== undefined && valor !== null && valor !== '' 
        ? valor 
        : (tieneOpciones ? subPrueba.valoresReferencia.opciones[0].valor : null);
      
      // Solo omitir si realmente no hay valor
      if (!valorFinal) return null;

      const referencia = subPrueba.valoresReferencia?.texto || '';

      // Para resultados tipo select (POSITIVA/NEGATIVA)
      if (tieneOpciones) {
        return (
          <tr key={subPrueba._id}>
            <td className="px-2 py-1 text-gray-700 border-r border-gray-200">
              {subPrueba.nombre}
            </td>
            <td className="px-2 py-1 text-center border-r border-gray-200">
              <span className={`font-bold px-1 py-0.5 rounded-full text-xs ${
                (valorFinal === 'POSITIVA' || valorFinal === 'POSITIVO') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {valorFinal}
              </span>
            </td>
            <td className="px-2 py-1 text-gray-700">
              <div className="text-xs" style={{ fontSize: '10px', lineHeight: '1.4' }}>
                {referencia}
              </div>
            </td>
          </tr>
        );
      }

      // Para resultados numéricos o de texto
      return (
        <tr key={subPrueba._id}>
          <td className="px-2 py-1 text-gray-700 border-r border-gray-200">
            {subPrueba.nombre}
          </td>
          <td className="px-2 py-1 text-center border-r border-gray-200">
            <span className="font-bold text-gray-900">{valorFinal}</span>
          </td>
          <td className="px-2 py-1 text-gray-700">
            <div className="text-xs" style={{ fontSize: '10px', lineHeight: '1.4' }}>
              {referencia}
            </div>
          </td>
        </tr>
      );
    }).filter(Boolean);
  };

  return (
    <div className="bg-white p-4 print:p-2">
      <div className="max-w-4xl mx-auto bg-white border border-gray-300 shadow-lg p-4 print:p-2 print:shadow-none" style={{ fontFamily: 'Arial, sans-serif' }}>
        
        {/* Header con logo y título */}
        <div className="border-b-2 border-blue-600 pb-2 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-2">
                <div className="text-white font-bold text-xs">SALUD</div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-800">
                  "SALUD AL ALCANCE DE TODOS"
                </h1>
                <p className="text-xs text-gray-600">Laboratorio Médico Especializado</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Folio: #{Math.floor(Math.random() * 10000).toString().padStart(5, '0')}</p>
              <p>Fecha: {formatDate(formData.fecha)}</p>
            </div>
          </div>
        </div>

        {/* Información del Paciente */}
        <div className="bg-gray-50 rounded-lg p-2 mb-2">
          <h2 className="text-xs font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">
            INFORMACIÓN DEL PACIENTE
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-600">Paciente:</span>
              <p className="text-gray-800 font-medium">{selectedPatient?.nombre || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Expediente:</span>
              <p className="text-gray-800">{selectedPatient?.numeroExpediente || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Edad:</span>
              <p className="text-gray-800">{selectedPatient?.edad || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Fecha de realización:</span>
              <p className="text-gray-800">{formatDate(formData.fecha)} - {formData.hora}</p>
            </div>
          </div>
        </div>

        {/* Título del estudio */}
        <div className="text-center mb-2">
          <div className="bg-blue-600 text-white py-1 px-3 rounded-lg inline-block">
            <h2 className="text-xs font-bold">{testConfig?.nombre?.toUpperCase() || 'REPORTE'}</h2>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="mb-2">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 text-left font-bold text-gray-700 border-r border-gray-200">PRUEBA</th>
                  <th className="px-2 py-1 text-center font-bold text-gray-700 border-r border-gray-200">RESULTADO</th>
                  <th className="px-2 py-1 text-left font-bold text-gray-700">VALORES REF.</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {renderTableRows()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observaciones */}
        {formData.observaciones && (
          <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-2 mb-2">
            <p className="text-xs font-bold text-gray-800 mb-1">OBSERVACIONES:</p>
            <p className="text-xs text-gray-700 leading-relaxed">{formData.observaciones}</p>
          </div>
        )}

        {/* Método y Técnica */}
        <div className="bg-blue-50 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-gray-700">TÉCNICA:</span>
              <span className="ml-1 text-gray-600">{testConfig?.tecnica || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700">MÉTODO:</span>
              <span className="ml-1 text-gray-600">{testConfig?.metodo || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Fin del informe */}
        <div className="text-center mb-2">
          <div className="bg-gray-800 text-white py-1 px-3 rounded-lg inline-block">
            <p className="text-xs font-bold">FIN DEL INFORME</p>
          </div>
        </div>

        {/* ✅ Firma digitalizada */}
        <div className="my-6 print:my-4">
          <div className="text-center">
            <img 
              src={firmaImg} 
              alt="Firma Digital" 
              className="mx-auto h-24 print:h-20 object-contain mb-2"
              style={{ maxWidth: '300px' }}
            />
            <div className=""></div>
          </div>
        </div>

        {/* Información del profesional */}
        <div className="border-t-2 border-gray-200 pt-2">
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-gray-800">ATENTAMENTE</p>
            <p className="text-xs font-bold text-gray-800">Q.F.B ELIUTH GARCIA CRUZ</p>
            <p className="text-xs text-gray-600">CED.PROF. 4362774</p>
            <p className="text-xs text-gray-600">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
            <p className="text-xs text-gray-600">Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
            
            <div className="mt-1 pt-1 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700">Asistente Médico</p>
              <p className="text-xs text-gray-600">Linn Castillo - 7731333631</p>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @media print {
          @page { size: A4; margin: 0.5in; }
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:p-2 { padding: 0.5rem !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:my-4 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
          .print\\:h-14 { height: 3.5rem !important; }
        }
        * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
      `}</style>
    </div>
  );
};

export default ReportPreview;