/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from 'react';
import { FileText, Eye, Edit2, Download, Trash2, X, Plus, BookOpen, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import UniversalNav from '../navigation/UniversalNav';
import ReportGenerator from './ReportGenerator';
import BitacoraModal from './BitacoraModal';
import { reportesAPI, pruebasAPI } from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

const ReportViewModal = ({ report, onClose, onDownload }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Si hay pdfUrl, mostrar el PDF
  if (report.pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full h-full sm:max-w-6xl sm:max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-blue-600 text-white flex-shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Vista Previa - Reporte</h2>
              <p className="text-xs sm:text-sm opacity-90">Folio: {report.folio}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onDownload(report)}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                title="Descargar PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* PDF Viewer - MEJORADO para ocupar todo el espacio disponible */}
          <div className="flex-1 overflow-hidden bg-gray-100 min-h-0">
            <iframe
              src={report.pdfUrl}
              className="w-full h-full border-0"
              title="Vista previa del reporte"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Si no hay PDF, mostrar datos básicos (modal original)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between bg-blue-600 text-white">
          <div>
            <h2 className="text-xl font-bold">Detalles del Reporte</h2>
            <p className="text-sm opacity-90">Folio: {report.folio}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos del Paciente</h3>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Nombre:</span> {report.datosPaciente?.nombre || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Edad:</span> {report.datosPaciente?.edad || 'N/A'} años</p>
                <p className="text-sm"><span className="font-medium">Sexo:</span> {report.datosPaciente?.sexo || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">CURP:</span> {report.datosPaciente?.curp || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de la Prueba</h3>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Prueba:</span> {report.datosPrueba?.nombre || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Fecha:</span> {formatDate(report.fechaRealizacion)}</p>
                <p className="text-sm"><span className="font-medium">Estado:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${report.autorizado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {report.autorizado ? 'Autorizado' : 'Pendiente'}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {report.resultados && report.resultados.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Resultados</h3>
              <div className="grid grid-cols-1 gap-4">
                {report.resultados.map((resultado, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">{resultado.nombre}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Resultado:</span> {resultado.valor}</p>
                    {resultado.unidad && (
                      <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Unidad:</span> {resultado.unidad}</p>
                    )}
                    {resultado.referencia && (
                      <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Referencia:</span> {resultado.referencia}</p>
                    )}
                  </div>
                ))}
              </div>
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

  useEffect(() => {
    fetchReportes();
  }, [currentPage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // ✅ Función auxiliar para reconstruir formData desde los resultados guardados
  const reconstructFormDataFromReport = (report) => {
    console.log('🔍 Reconstruyendo formData desde:', report);
    
    const formData = {
      fecha: new Date(report.fechaRealizacion).toISOString().split('T')[0],
      hora: new Date(report.fechaRealizacion).toTimeString().slice(0, 5),
      observaciones: report.observaciones || ''
    };

    // Reconstruir valores de resultados
    console.log('📊 Resultados a procesar:', report.resultados);
    report.resultados?.forEach((resultado) => {
      // Manejar tanto ObjectId de MongoDB como strings normales
      const subPruebaId = resultado.subPruebaId?.$oid || resultado.subPruebaId;
      console.log(`  - ${resultado.nombre}: ${resultado.valor} (ID: ${subPruebaId})`);
      formData[subPruebaId] = resultado.valor;
    });

    // Reconstruir campos adicionales
    report.camposAdicionales?.forEach((campo) => {
      const campoId = campo._id?.$oid || campo._id;
      formData[`campo_${campoId}`] = campo.valor;
    });

    console.log('✅ FormData reconstruido:', formData);
    return formData;
  };

  // ✅ Función auxiliar para reconstruir testConfig desde datosPrueba
  const reconstructTestConfigFromReport = async (report) => {
    console.log('🔍 Reconstruyendo testConfig desde:', report);
    console.log('📊 Resultados guardados:', report.resultados);
    
    // ESTRATEGIA 1: Si el reporte ya tiene la prueba poblada con subPruebas, usarla
    if (report.prueba?.subPruebas && report.prueba.subPruebas.length > 0) {
      console.log('✅ Usando prueba poblada con subPruebas');
      return report.prueba;
    }

    // ESTRATEGIA 2: SIEMPRE intentar cargar la prueba completa desde la API para obtener referencias
    const pruebaId = report.prueba?.$oid || report.prueba?._id || report.prueba;
    
    if (pruebaId) {
      try {
        console.log('🔄 Cargando prueba completa desde API, ID:', pruebaId);
        const response = await pruebasAPI.getById(pruebaId);
        console.log('✅ Respuesta de API:', response);
        
        // ✅ CORRECCIÓN: La API devuelve {success: true, data: {...}}
        const pruebaCompleta = response.data || response;
        console.log('✅ Prueba extraída:', pruebaCompleta);
        
        // IMPORTANTE: Verificar que tenga subPruebas
        if (pruebaCompleta.subPruebas && pruebaCompleta.subPruebas.length > 0) {
          console.log('✅ Usando prueba desde API con', pruebaCompleta.subPruebas.length, 'subPruebas');
          return pruebaCompleta;
        } else {
          console.warn('⚠️ Prueba cargada pero sin subPruebas');
        }
      } catch (error) {
        console.error('❌ Error cargando prueba desde API:', error);
      }
    }

    // ESTRATEGIA 3 (FALLBACK): Construir desde resultados guardados SIN referencias
    console.log('⚠️ Usando fallback - construyendo desde resultados guardados');
    console.log('📊 Resultados disponibles:', report.resultados);
    
    return {
      _id: pruebaId || 'unknown',
      nombre: report.datosPrueba?.nombre || 'Reporte Médico',
      codigo: report.datosPrueba?.codigo || '',
      metodo: report.datosPrueba?.metodo || 'N/A',
      tecnica: report.datosPrueba?.tecnica || 'N/A',
      subPruebas: report.resultados?.map(resultado => ({
        _id: resultado.subPruebaId?.$oid || resultado.subPruebaId,
        nombre: resultado.nombre || resultado.clave || 'Sin nombre',
        clave: resultado.clave,
        unidad: resultado.unidad || '',
        tipo: 'texto',
        valoresReferencia: {
          texto: resultado.referencia || 'Sin referencia disponible',
          opciones: []
        }
      })) || []
    };
  };

  // ✅ NUEVA FUNCIÓN: Generar PDF desde reporte guardado
  const generatePDFFromReport = async (report) => {
    try {
      console.log('🎯 Iniciando generación de PDF para reporte:', report.folio);
      
      // 1. Reconstruir testConfig y formData
      console.log('📋 Paso 1: Reconstruyendo testConfig...');
      const testConfig = await reconstructTestConfigFromReport(report);
      console.log('✅ TestConfig reconstruido:', testConfig);
      
      console.log('📋 Paso 2: Reconstruyendo formData...');
      const formData = reconstructFormDataFromReport(report);
      console.log('✅ FormData reconstruido:', formData);
      
      // 2. Preparar datos del paciente
      const selectedPatient = {
        nombre: report.datosPaciente?.nombre || 'N/A',
        numeroExpediente: report.datosPaciente?.numeroExpediente || report.datosPaciente?.expediente || 'N/A',
        edad: report.datosPaciente?.edad || 'N/A'
      };
      console.log('✅ Datos del paciente:', selectedPatient);

      // 3. Crear elemento temporal en el DOM
      console.log('📋 Paso 3: Creando elemento temporal...');
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '794px'; // Ancho A4 en px
      document.body.appendChild(tempDiv);

      // 4. Importar React y ReactDOM dinámicamente
      console.log('📋 Paso 4: Importando módulos...');
      const React = (await import('react')).default;
      const ReactDOM = (await import('react-dom/client')).default;
      const ReportPreview = (await import('./ReportPreview')).default;

      // 5. Renderizar ReportPreview
      console.log('📋 Paso 5: Renderizando ReportPreview...');
      const root = ReactDOM.createRoot(tempDiv);
      
      await new Promise((resolve) => {
        root.render(
          React.createElement(ReportPreview, {
            testConfig,
            formData,
            selectedPatient
          })
        );
        // Esperar renderizado
        setTimeout(resolve, 1000); // Aumentado a 1 segundo
      });

      console.log('✅ Contenido renderizado');
      console.log('📄 HTML generado:', tempDiv.innerHTML.substring(0, 500));

      // 6. Capturar con html2canvas
      console.log('📋 Paso 6: Capturando con html2canvas...');
      const canvas = await html2canvas(tempDiv.firstChild, {
        scale: 2,
        useCORS: true,
        logging: true, // Activar logs de html2canvas
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123
      });
      console.log('✅ Canvas capturado:', canvas.width, 'x', canvas.height);

      // 7. Generar PDF
      console.log('📋 Paso 7: Generando PDF...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      console.log('📐 Dimensiones PDF:', { pdfWidth, pdfHeight, imgWidth, imgHeight });

      if (imgHeight > pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pdfHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // 8. Limpiar
      console.log('📋 Paso 8: Limpiando elementos temporales...');
      root.unmount();
      document.body.removeChild(tempDiv);

      console.log('✅ PDF generado exitosamente');
      return pdf;
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  };

  // ✅ REEMPLAZAR handleDownload
  const handleDownload = async (report) => {
    try {
      setSuccessMessage('Generando PDF...');
      
      const pdf = await generatePDFFromReport(report);
      const fileName = `reporte_${report.folio}_${report.datosPaciente?.nombre || 'paciente'}.pdf`;
      pdf.save(fileName);
      
      setSuccessMessage('PDF descargado correctamente');
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('Error al generar el PDF: ' + err.message);
    }
  };

  // ✅ REEMPLAZAR handleView - Ahora abre modal con PDF
  const handleView = async (report) => {
    try {
      setSuccessMessage('Generando vista previa...');
      
      const pdf = await generatePDFFromReport(report);
      
      // Convertir a blob y crear URL
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      
      // Guardar URL en el reporte para el modal
      setSelectedReport({ ...report, pdfUrl: url });
      setShowViewModal(true);
      setSuccessMessage('');
    } catch (err) {
      console.error('Error al generar vista previa:', err);
      setError('Error al cargar la vista previa: ' + err.message);
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setSelectedPrueba(report.prueba || report.datosPrueba);
    setActiveModal('edit');
  };

  const handleDelete = async (report) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el reporte ${report.folio}?`)) {
      try {
        await reportesAPI.delete(report._id);
        setSuccessMessage(`Reporte ${report.folio} eliminado exitosamente`);
        await fetchReportes();
      } catch (err) {
        console.error('Error al eliminar reporte:', err);
        setError('Error al eliminar el reporte: ' + err.message);
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

      {showViewModal && selectedReport && (
        <ReportViewModal
          report={selectedReport}
          onClose={() => {
            // Limpiar URL del blob si existe
            if (selectedReport.pdfUrl) {
              URL.revokeObjectURL(selectedReport.pdfUrl);
            }
            setShowViewModal(false);
            setSelectedReport(null);
          }}
          onDownload={handleDownload}
        />
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