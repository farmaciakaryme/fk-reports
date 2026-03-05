import { useState, useCallback, useEffect } from 'react';
import { reportesAPI, pruebasAPI } from '../../../services/api';
import { reconstructFormData, reconstructTestConfig } from '../reportReconstruct';
import { printReportElement } from '../printUtils';

// Hook principal de ReportesManagement.
// Expone estado y handlers para la tabla de reportes, busqueda, paginacion y acciones CRUD.
const useReportesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTestSelection, setShowTestSelection] = useState(false);
  const [showBitacora, setShowBitacora] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPrueba, setSelectedPrueba] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [reports, setReports] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPruebas, setIsLoadingPruebas] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // Autolimpia el mensaje de exito despues de 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Dispara la busqueda con debounce al cambiar pagina o termino de busqueda
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchReportes();
    }, 500);
    return () => clearTimeout(delay);
  }, [currentPage, searchTerm]);

  const fetchReportes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await reportesAPI.getAll(params);
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

  const handleSelectTest = useCallback((prueba) => {
    setShowTestSelection(false);
    setSelectedPrueba(prueba);
    setActiveModal('report');
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPrueba(null);
    setSelectedReport(null);
    fetchReportes();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Reconstruye y renderiza el reporte en un div temporal fuera de pantalla,
  // luego lo imprime usando printReportElement.
  const handleDownload = async (report) => {
    try {
      setSuccessMessage('Preparando reporte para impresion...');

      const testConfig = await reconstructTestConfig(report);
      const formData = reconstructFormData(report);
      const selectedPatient = {
        nombre: report.datosPaciente?.nombre || 'N/A',
        numeroExpediente:
          report.datosPaciente?.numeroExpediente ||
          report.datosPaciente?.expediente ||
          'N/A',
        edad: report.datosPaciente?.edad || 'N/A'
      };

      // Crear nodo temporal fuera de pantalla para renderizar ReportPreview
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;';
      document.body.appendChild(tempDiv);

      const React = (await import('react')).default;
      const ReactDOM = (await import('react-dom/client')).default;
      const ReportPreview = (await import('../ReportPreview')).default;

      const root = ReactDOM.createRoot(tempDiv);
      await new Promise((resolve) => {
        root.render(
          React.createElement(ReportPreview, { testConfig, formData, selectedPatient })
        );
        setTimeout(resolve, 1000);
      });

      const reportElement = tempDiv.firstChild;
      if (!reportElement) {
        alert('Error: No se encontro el reporte');
        root.unmount();
        document.body.removeChild(tempDiv);
        return;
      }

      printReportElement(reportElement, report.folio);

      root.unmount();
      document.body.removeChild(tempDiv);
      setSuccessMessage('');
    } catch (err) {
      console.error('Error al preparar reporte:', err);
      setError('Error al preparar el reporte: ' + err.message);
    }
  };

  // Ver un reporte equivale a imprimirlo/descargarlo
  const handleView = (report) => {
    handleDownload(report);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setActiveModal('edit');
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Deseas eliminar el reporte ${report.folio}?`)) return;
    try {
      await reportesAPI.delete(report._id);
      setSuccessMessage(`Reporte ${report.folio} eliminado exitosamente`);
      await fetchReportes();
    } catch (err) {
      console.error('Error al eliminar reporte:', err);
      setError('Error al eliminar el reporte: ' + err.message);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return {
    // Estado UI
    searchTerm,
    showTestSelection,
    showBitacora,
    activeModal,
    selectedPrueba,
    selectedReport,
    showViewModal,
    // Estado datos
    reports,
    pruebas,
    isLoading,
    isLoadingPruebas,
    error,
    successMessage,
    currentPage,
    totalPages,
    totalReports,
    // Setters necesarios para modales
    setShowTestSelection,
    setShowBitacora,
    setShowViewModal,
    setSelectedReport,
    // Handlers
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
    setSearchTerm
  };
};

export default useReportesManagement;
