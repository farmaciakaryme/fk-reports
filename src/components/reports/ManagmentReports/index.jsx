/* eslint-disable react/prop-types */
import UniversalNav from '../../navigation/UniversalNav';
import ReportGenerator from '../ReportsGenerator/index';
import ReportEditor from '../ReportEditor/index';
import BitacoraModal from '../BitacoraModal/index';
import useReportesManagement from './useReportesManagement';
import { TestSelectionModal, ReportViewModal, ReportRow } from './ReportesUIComponents';
import { FileText, BookOpen, Plus, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ManagmentReports = ({ currentUser, onLogout, onNavigate }) => {
  const {
    searchTerm,
    showTestSelection,
    showBitacora,
    activeModal,
    selectedPrueba,
    selectedReport,
    showViewModal,
    reports,
    pruebas,
    isLoading,
    isLoadingPruebas,
    error,
    successMessage,
    currentPage,
    totalPages,
    totalReports,
    setShowTestSelection,
    setShowBitacora,
    setShowViewModal,
    setSelectedReport,
    handleOpenTestSelection,
    handleSelectTest,
    closeModal,
    handleSearchChange,
    handleDownload,
    handleView,
    handleEdit,
    handleDelete,
    handlePreviousPage,
    handleNextPage,
    setSearchTerm,
  } = useReportesManagement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNav
        currentUser={currentUser}
        onLogout={onLogout}
        currentView="reports"
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-bold text-gray-900 font-poppins">
                  Gestion de Reportes Clinicos
                </h1>
              </div>
              <p className="text-sm text-gray-600 font-inter">
                Crear y administrar reportes de pruebas medicas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBitacora(true)}
                className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium font-poppins"
              >
                <BookOpen className="w-4 h-4" />
                Ver Bitacora
              </button>
              <button
                onClick={handleOpenTestSelection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium font-poppins"
              >
                <Plus className="w-4 h-4" />
                Nuevo Reporte
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre de paciente o folio..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-inter"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Limpiar busqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-xs text-blue-600 mt-1 font-inter">
                Buscando &quot;{searchTerm}&quot; en todos los registros...
              </p>
            )}
          </div>

          {/* Alertas */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-inter">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-inter">{error}</p>
            </div>
          )}

          {/* Contador */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-inter">
              Mostrando {reports.length} de {totalReports} reportes
              {searchTerm && ' (filtrados por busqueda)'}
            </p>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Folio', 'Paciente', 'Prueba', 'Fecha', 'Acciones'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-inter">Cargando reportes...</p>
                    </td>
                  </tr>
                ) : reports.length > 0 ? (
                  reports.map((report) => (
                    <ReportRow
                      key={report._id}
                      report={report}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-inter">
                        {searchTerm
                          ? `No se encontraron reportes con "${searchTerm}"`
                          : 'No hay reportes registrados'}
                      </p>
                      <p className="text-gray-400 text-xs mt-1 font-inter">
                        {searchTerm
                          ? 'Intenta con otro termino de busqueda'
                          : 'Crea tu primer reporte clinico'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginacion */}
          {totalReports > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 font-inter">
                Pagina {currentPage} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Nota de seguridad */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-inter">
            <strong>Conexion segura:</strong> Tus datos estan protegidos con cifrado y Row Level
            Security (RLS). Solo tu puedes ver tu informacion.
          </p>
        </div>
      </div>

      {/* Modales */}
      {showTestSelection && (
        <TestSelectionModal
          onClose={() => setShowTestSelection(false)}
          onSelectTest={handleSelectTest}
          pruebas={pruebas}
          isLoading={isLoadingPruebas}
        />
      )}

      {showBitacora && (
        <BitacoraModal onClose={() => setShowBitacora(false)} />
      )}

      {showViewModal && selectedReport && (
        <ReportViewModal
          report={selectedReport}
          onClose={() => {
            if (selectedReport.pdfUrl) URL.revokeObjectURL(selectedReport.pdfUrl);
            setShowViewModal(false);
            setSelectedReport(null);
          }}
          onDownload={handleDownload}
        />
      )}

      {activeModal === 'report' && (
        <ReportGenerator onBack={closeModal} pruebaData={selectedPrueba} />
      )}

      {activeModal === 'edit' && selectedReport && (
        <ReportEditor onBack={closeModal} reportToEdit={selectedReport} />
      )}
    </div>
  );
};

export default ManagmentReports;