import React, { useState, useCallback } from 'react';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';

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
  );
};

const DrugTestRow = ({ test, value, onChange }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
    <div className="mb-1.5">
      <span className="font-medium text-gray-800 text-xs">{test.label}</span>
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      <button
        onClick={() => onChange(test.key, 'NEGATIVA')}
        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
          value === 'NEGATIVA'
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        NEGATIVA
      </button>
      <button
        onClick={() => onChange(test.key, 'POSITIVA')}
        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
          value === 'POSITIVA'
            ? 'bg-red-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        POSITIVA
      </button>
    </div>
  </div>
);

const AntidopingForm = ({ formData, handleInputChange, onBack, generateReport }) => {
  const [errors, setErrors] = useState([]);

  const handleChange = useCallback((field, value) => {
    handleInputChange(field, value);
    if (errors.length > 0) setErrors([]);
  }, [handleInputChange, errors.length]);

  const handleGenerateReport = useCallback(() => {
    const validationErrors = [];
    if (!formData.nombre?.trim()) validationErrors.push('Nombre del paciente');
    if (!formData.fecha) validationErrors.push('Fecha');
    if (!formData.edad?.trim()) validationErrors.push('Edad');
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    generateReport();
  }, [formData, generateReport]);

  const inputClass = (field) => `w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    errors.includes(field) ? 'border-red-300 bg-red-50' : 'border-gray-300'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        
        <div className="bg-blue-600 text-white p-3 rounded-t-xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-2 p-1 hover:bg-blue-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold">Antidoping</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ValidationAlert errors={errors} />
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Paciente *</label>
              <input
                type="text"
                value={formData.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={inputClass('Nombre del paciente')}
                placeholder="Nombre completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha || ''}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  className={inputClass('Fecha')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Edad *</label>
                <input
                  type="number"
                  value={formData.edad || ''}
                  onChange={(e) => handleChange('edad', e.target.value)}
                  className={inputClass('Edad')}
                  placeholder="Edad"
                />
              </div>
            </div>

            <div className="border-t pt-3 mt-2">
              <h3 className="text-xs font-semibold text-gray-800 mb-2">Pruebas de Drogas</h3>
              <div className="space-y-2">
                {DRUG_TESTS.map((test) => (
                  <DrugTestRow
                    key={test.key}
                    test={test}
                    value={formData[test.key] || 'NEGATIVA'}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-3 flex-shrink-0">
          <button
            onClick={handleGenerateReport}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Generar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

const AntidopingReport = ({ formData, onBack }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 bg-white shadow-sm z-10 p-2.5 print:hidden border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button onClick={onBack} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="p-3 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
          <div className="p-4 space-y-3">
            
            <div className="border-b-2 border-blue-600 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-white font-bold text-[8px]">SALUD</div>
                  </div>
                  <div>
                    <h1 className="text-xs font-bold text-gray-800 leading-tight">"SALUD AL ALCANCE DE TODOS"</h1>
                    <p className="text-[10px] text-gray-600">Laboratorio Médico Especializado</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-gray-500">
                  <p>Folio: #{Math.floor(Math.random() * 10000)}</p>
                  <p>Fecha: {formatDate(formData.fecha)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-2.5">
              <h2 className="text-[10px] font-bold text-gray-800 mb-1.5 border-b border-gray-300 pb-1">INFORMACIÓN DEL PACIENTE</h2>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="font-medium text-gray-600">Paciente:</span>
                  <p className="text-gray-800 font-medium">{formData.nombre || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Fecha:</span>
                  <p className="text-gray-800">{formatDate(formData.fecha) || 'No especificada'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Edad:</span>
                  <p className="text-gray-800">{formData.edad || 'No especificada'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Solicitado por:</span>
                  <p className="text-gray-800">A QUIEN CORRESPONDA</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white py-1 px-3 rounded-md inline-block">
                <h2 className="text-[10px] font-bold">PERFIL DE DROGAS DE ABUSO 6</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border border-gray-200 rounded-md overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-bold text-gray-700 border-r border-gray-200">PRUEBA</th>
                    <th className="px-2 py-1.5 text-center font-bold text-gray-700 border-r border-gray-200">RESULTADO</th>
                    <th className="px-2 py-1.5 text-left font-bold text-gray-700">VALORES REF.</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {DRUG_TESTS.map((test) => {
                    const result = formData[test.key] || 'NEGATIVA';
                    return (
                      <tr key={test.key} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 text-gray-700 border-r border-gray-200">{test.label}</td>
                        <td className="px-2 py-1.5 text-center border-r border-gray-200">
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] inline-block ${
                            result === 'POSITIVA' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {result}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-gray-700">
                          <div className="text-[9px] leading-tight">
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

            <div className="bg-blue-50 rounded-md p-2">
              <div className="flex items-center justify-between text-[10px] gap-2">
                <div>
                  <span className="font-bold text-gray-700">TÉCNICA:</span>
                  <span className="ml-1 text-gray-600">RIA</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">MÉTODO:</span>
                  <span className="ml-1 text-gray-600">Inmunocromatografía</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-800 text-white py-1 px-3 rounded-md inline-block">
                <p className="text-[10px] font-bold">FIN DEL INFORME</p>
              </div>
            </div>

            <div className="h-12"></div>

            <div className="border-t-2 border-gray-200 pt-2">
              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-bold text-gray-800">ATENTAMENTE</p>
                <p className="text-[10px] font-bold text-gray-800">Q.F.B ELIUTH GARCIA CRUZ</p>
                <p className="text-[9px] text-gray-600">CED.PROF. 4362774</p>
                <p className="text-[9px] text-gray-600">MEDICINA GENERAL: FLEBOLOGIA, AUDIOLOGIA</p>
                <p className="text-[9px] text-gray-600">Av República del Salvador S/N Colonia centro Atotonilco de Tula</p>
                
                <div className="mt-1 pt-1 border-t border-gray-200">
                  <p className="text-[9px] font-medium text-gray-700">Asistente Médico</p>
                  <p className="text-[9px] text-gray-600">Linn Castillo - 7731333631</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const AntidopingComponent = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('form');
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    edad: '',
    canabinoides: 'NEGATIVA',
    cocaina: 'NEGATIVA',
    anfetaminas: 'NEGATIVA',
    metanfetaminas: 'NEGATIVA',
    morfina: 'NEGATIVA',
    benzodiazepinas: 'NEGATIVA'
  });

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  if (currentView === 'report') {
    return <AntidopingReport formData={formData} onBack={() => setCurrentView('form')} />;
  }

  return (
    <AntidopingForm 
      formData={formData}
      handleInputChange={handleInputChange}
      onBack={onBack}
      generateReport={() => setCurrentView('report')}
    />
  );
};

export default AntidopingComponent;