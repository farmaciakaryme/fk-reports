/* eslint-disable react/prop-types */
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import ReportPreview from '../ReportPreview';

// Vista previa del reporte en modo edicion con botones de accion.
const EditorPreviewStep = ({
  testConfig,
  formData,
  selectedPatient,
  isSaving,
  onBack,
  onSaveChanges,
  onSaveAndPrint
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">

        {/* Header con botones */}
        <div className="flex-shrink-0 bg-gray-50 border-b p-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <button
              onClick={onBack}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Volver</span>
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={onSaveChanges}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Guardando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Solo Guardar</span>
                  </>
                )}
              </button>

              <button
                onClick={onSaveAndPrint}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Procesando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Guardar e Imprimir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Vista previa del reporte - el div report-to-print es capturado para imprimir */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="bg-white max-w-[210mm] mx-auto shadow-lg">
            <div className="report-to-print">
              <ReportPreview
                testConfig={testConfig}
                formData={formData}
                selectedPatient={selectedPatient}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditorPreviewStep;
