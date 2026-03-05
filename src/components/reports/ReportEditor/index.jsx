/* eslint-disable react/prop-types */
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import EditorDynamicForm from './EditorDynamicForm';
import EditorPreviewStep from './EditorPreviewStep';
import useReportEditor from './useReportEditor';

// Componente raiz del editor de reportes.
// Orquesta los pasos: form -> preview, usando useReportEditor para toda la logica.
const ReportEditor = ({ onBack, reportToEdit }) => {
  const {
    currentStep,
    setCurrentStep,
    selectedPatient,
    formData,
    errors,
    isSaving,
    testConfig,
    isLoadingTest,
    handleInputChange,
    handlePatientChange,
    handleGeneratePreview,
    handleSaveChanges,
    handleSaveAndPrint
  } = useReportEditor(reportToEdit, onBack);

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
      <EditorPreviewStep
        testConfig={testConfig}
        formData={formData}
        selectedPatient={selectedPatient}
        isSaving={isSaving}
        onBack={() => setCurrentStep('form')}
        onSaveChanges={handleSaveChanges}
        onSaveAndPrint={handleSaveAndPrint}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
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

        {/* Cuerpo del formulario */}
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

          <EditorDynamicForm
            testConfig={testConfig}
            formData={formData}
            onChange={handleInputChange}
            selectedPatient={selectedPatient}
            onPatientChange={handlePatientChange}
            errors={errors}
          />
        </div>

        {/* Footer */}
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
