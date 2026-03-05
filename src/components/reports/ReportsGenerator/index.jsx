/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import PatientSearchModal from '../../patients/PatientSearchsModal';
import DynamicForm from './DynamicForm';
import PreviewStep from './PreviewStep';
import useReportForm from './useReportForm';
import useTestConfig from './useTestConfig';

const ReportGenerator = ({ onBack, pruebaData }) => {
  const {
    currentStep,
    setCurrentStep,
    selectedPatient,
    formData,
    setFormData,
    errors,
    isSaving,
    handlePatientSelect,
    handleInputChange,
    handleGeneratePreview,
    handleSaveOnly,
    handlePrintAndSave
  } = useReportForm(onBack);

  const { testConfig, isLoadingTest } = useTestConfig(pruebaData, setFormData);

  // Ocultar la vista previa del modal cuando se esta en el paso de preview
  useEffect(() => {
    if (currentStep === 'preview') {
      const modalPreview = document.querySelector('.print-hide-modal .report-preview');
      if (modalPreview) modalPreview.style.display = 'none';
    }
    return () => {
      const modalPreview = document.querySelector('.print-hide-modal .report-preview');
      if (modalPreview) modalPreview.style.display = '';
    };
  }, [currentStep]);

  if (isLoadingTest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuracion...</p>
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
      <PreviewStep
        testConfig={testConfig}
        formData={formData}
        selectedPatient={selectedPatient}
        isSaving={isSaving}
        onBack={() => setCurrentStep('form')}
        onSaveOnly={() => handleSaveOnly(testConfig)}
        onPrintAndSave={() => handlePrintAndSave(testConfig, selectedPatient)}
      />
    );
  }

  // Paso del formulario
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
            <h2 className="text-base font-semibold">
              {testConfig?.nombre || 'Generar Reporte'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {errors.length > 0 && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-sm">
              <div className="flex items-start mb-1.5">
                <AlertCircle className="w-4 h-4 text-red-500 mr-1.5 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 font-medium">
                  Completa los siguientes campos:
                </span>
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