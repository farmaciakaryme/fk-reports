/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from 'react';
import { FileText, Eye, Edit2, Download, Trash2, X, Plus, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import UniversalNav from '../navigation/UniversalNav';
import ReportGenerator from './ReportGenerator';
import BitacoraModal from './BitacoraModal';
import { reportesAPI, pruebasAPI } from '../../services/api';

const TestSelectionModal = ({ onClose, onSelectTest, pruebas, isLoading }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">Selecciona el tipo de prueba</h2>
            <p className="text-sm text-gray-600 font-inter">Elige una prueba para generar un nuevo reporte clínico.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : pruebas.length > 0 ? (
            pruebas.map((prueba) => {
              const isAvailable = 
                prueba.codigo === 'ANTIDOPING' || 
                prueba.codigo === 'ALCOHOLIMETRO' ||
                prueba.codigo === 'HEM-BIOM689';
              
              return (
                <button
                  key={prueba._id}
                  onClick={() => isAvailable && onSelectTest(prueba)}
                  disabled={!isAvailable}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isAvailable
                      ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <h3 className="text-base font-semibold text-blue-600 mb-1 font-poppins">{prueba.nombre}</h3>
                  <p className="text-xs text-gray-600 mb-2 font-inter">{prueba.descripcion || prueba.codigo}</p>
                  {isAvailable ? (
                    <p className="text-xs text-green-600 font-medium font-inter">
                      ✓ {prueba.subPruebas?.length || 0} subprueba{prueba.subPruebas?.length > 1 ? 's' : ''} disponible{prueba.subPruebas?.length > 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium font-inter">
                      Próximamente disponible
                    </p>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500 font-inter">No hay pruebas disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportRow = ({ report, onView, onEdit, onDownload, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900 font-inter">{report.folio}</td>
      <td className="px-4 py-3 text-sm text-gray-900 font-inter">
        {report.datosPaciente?.nombre || report.paciente?.nombre || 'N/A'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 font-inter">
        {report.datosPrueba?.nombre || report.prueba?.nombre || 'N/A'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 font-inter">
        {formatDate(report.fechaRealizacion)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(report)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Ver reporte"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onEdit(report)}
            className="p-1.5 hover:bg-blue-100 rounded transition-colors"
            title="Editar reporte"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDownload(report)}
            className="p-1.5 hover:bg-green-100 rounded transition-colors"
            title="Descargar reporte"
          >
            <Download className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={() => onDelete(report)}
            className="p-1.5 hover:bg-red-100 rounded transition-colors"
            title="Eliminar reporte"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ReportesManagement = ({ currentUser, onLogout, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTestSelection, setShowTestSelection] = useState(false);
  const [showBitacora, setShowBitacora] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPrueba, setSelectedPrueba] = useState(null);
  
  const [reports, setReports] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPruebas, setIsLoadingPruebas] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    fetchReportes();
  }, [currentPage]);

  const fetchReportes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportesAPI.getAll({ 
        page: currentPage, 
        limit: 10
      });
      
      setReports(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalReports(response.pagination?.total || 0);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError(err.message);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTestSelection = async () => {
    setShowTestSelection(true);
    setIsLoadingPruebas(true);
    try {
      const response = await pruebasAPI.getAll();
      setPruebas(response.data || response.pruebas || []);
    } catch (err) {
      console.error('Error al cargar pruebas:', err);
      setPruebas([]);
    } finally {
      setIsLoadingPruebas(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const pacienteNombre = (report.datosPaciente?.nombre || report.paciente?.nombre || '').toLowerCase();
    const folio = (report.folio || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return pacienteNombre.includes(search) || folio.includes(search);
  });

  const handleSelectTest = useCallback((prueba) => {
    setShowTestSelection(false);
    setSelectedPrueba(prueba);
    setActiveModal('report');
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPrueba(null);
    fetchReportes();
  };

  const handleView = (report) => {
    console.log('Ver reporte:', report);
  };

  const handleEdit = (report) => {
    console.log('Editar reporte:', report);
  };

  const handleDownload = async (report) => {
    console.log('Descargar reporte:', report);
    alert('Función de descarga en desarrollo');
  };

  const handleDelete = async (report) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      try {
        await reportesAPI.delete(report._id);
        fetchReportes();
        alert('Reporte eliminado exitosamente');
      } catch (err) {
        console.error('Error al eliminar reporte:', err);
        alert('Error al eliminar el reporte: ' + err.message);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-bold text-gray-900 font-poppins">Gestión de Reportes Clínicos</h1>
              </div>
              <p className="text-sm text-gray-600 font-inter">Crear y administrar reportes de pruebas médicas</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBitacora(true)}
                className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium font-poppins"
              >
                <BookOpen className="w-4 h-4" />
                Ver Bitácora
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

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre de paciente o folio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-inter"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-inter">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600 font-inter">
              Mostrando {filteredReports.length} de {totalReports} reportes
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">Folio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">Prueba</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-inter">Acciones</th>
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
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
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
                      <p className="text-gray-500 text-sm font-inter">No hay reportes registrados</p>
                      <p className="text-gray-400 text-xs mt-1 font-inter">Crea tu primer reporte clínico</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
                Página {currentPage} de {totalPages}
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

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-inter">
            <strong>Conexión segura:</strong> Tus datos están protegidos con cifrado y Row Level Security (RLS). 
            Solo tú puedes ver tu información.
          </p>
        </div>
      </div>

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

      {activeModal === 'report' && (
        <ReportGenerator
          onBack={closeModal}
          pruebaData={selectedPrueba}
        />
      )}
    </div>
  );
};

export default ReportesManagement;