import React, { useState, useEffect } from 'react';
import { X, Download, Loader2, Calendar, FileText } from 'lucide-react';
import { reportesAPI } from '../services/api';

const BitacoraModal = ({ onClose }) => {
  const [reportes, setReportes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchAllReportes();
  }, []);

  const fetchAllReportes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Obtener todos los reportes sin paginación
      const response = await reportesAPI.getAll({ limit: 1000 });
      setReportes(response.data || []);
    } catch (err) {
      console.error('Error al cargar bitácora:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarReportes = () => {
    if (!fechaInicio && !fechaFin) return reportes;

    return reportes.filter(report => {
      const fechaReporte = new Date(report.fechaRealizacion);
      const inicio = fechaInicio ? new Date(fechaInicio) : null;
      const fin = fechaFin ? new Date(fechaFin) : null;

      if (inicio && fin) {
        return fechaReporte >= inicio && fechaReporte <= fin;
      } else if (inicio) {
        return fechaReporte >= inicio;
      } else if (fin) {
        return fechaReporte <= fin;
      }
      return true;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const generarVistaPrevia = (reportesFiltrados) => {
    const reportesPorPagina = 20;
    const totalPaginas = Math.ceil(reportesFiltrados.length / reportesPorPagina);
    
    const paginas = [];
    
    for (let pagina = 0; pagina < totalPaginas; pagina++) {
      const inicio = pagina * reportesPorPagina;
      const fin = Math.min(inicio + reportesPorPagina, reportesFiltrados.length);
      const reportesPagina = reportesFiltrados.slice(inicio, fin);
      
      paginas.push(
        <div 
          key={pagina} 
          className="bg-white shadow-lg mb-6 p-8"
          style={{ 
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto'
          }}
        >
          {/* Header */}
          <div className="mb-6 pb-4 border-b-4 border-blue-600">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-2xl">FK</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 font-poppins">SALUD AL ALCANCE DE TODOS®</h1>
                <p className="text-sm text-gray-600 font-inter">Sistema de Gestión de Reportes Clínicos</p>
              </div>
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 font-poppins mb-2">
              BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
            </h2>
            {fechaInicio || fechaFin ? (
              <p className="text-sm text-gray-600 font-inter">
                Periodo: {fechaInicio ? formatDate(fechaInicio) : 'Inicio'} - {fechaFin ? formatDate(fechaFin) : 'Actual'}
              </p>
            ) : null}
          </div>

          {/* Tabla */}
          <div className="mb-8">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-gray-700 font-inter w-12">Nro</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-gray-700 font-inter w-24">FECHA</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-gray-700 font-inter w-20">HORA</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-gray-700 font-inter">NOMBRE</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-gray-700 font-inter w-16">EDAD</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-gray-700 font-inter w-32">MOTIVO</th>
                </tr>
              </thead>
              <tbody>
                {reportesPagina.map((reporte, index) => (
                  <tr key={reporte._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-inter">{inicio + index + 1}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-inter">{formatDate(reporte.fechaRealizacion)}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-inter">{formatTime(reporte.createdAt || reporte.fechaRealizacion)}</td>
                    <td className="border border-gray-200 px-2 py-1.5 font-inter">{reporte.datosPaciente?.nombre || reporte.paciente?.nombre || 'N/A'}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-inter">{reporte.datosPaciente?.edad || 'N/A'}</td>
                    <td className="border border-gray-200 px-2 py-1.5 font-inter text-xs">{reporte.datosPrueba?.nombre || reporte.prueba?.nombre || 'N/A'}</td>
                  </tr>
                ))}
                {/* Filas vacías para completar 20 */}
                {Array(20 - reportesPagina.length).fill(0).map((_, index) => (
                  <tr key={`empty-${index}`} className={((reportesPagina.length + index) % 2 === 0) ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-2 py-1.5" style={{ height: '28px' }}>&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1.5">&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1.5">&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1.5">&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1.5">&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1.5">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t-2 border-gray-300">
            <div className="flex justify-between text-sm font-bold text-gray-800 font-inter">
              <div className="text-center flex-1">
                <div className="h-8"></div>
                <div className="border-t-2 border-gray-400 pt-2">Dir. Seguridad Pública</div>
              </div>
              <div className="text-center flex-1">
                <div className="h-8"></div>
                <div className="border-t-2 border-gray-400 pt-2">Médico Responsable</div>
              </div>
            </div>
          </div>

          {/* Número de página */}
          <div className="text-center text-xs text-gray-500 mt-4 font-inter">
            Página {pagina + 1} de {totalPaginas}
          </div>
        </div>
      );
    }
    
    return paginas;
  };

  const descargarPDF = () => {
    const reportesFiltrados = filtrarReportes();
    const contenidoHTML = generarHTMLBitacora(reportesFiltrados);
    
    // Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    // Escribir el contenido en el iframe
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(contenidoHTML);
    iframeDoc.close();
    
    // Esperar a que cargue el contenido y luego imprimir
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          // Remover el iframe después de imprimir
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 100);
        } catch (error) {
          console.error('Error al imprimir:', error);
          document.body.removeChild(iframe);
        }
      }, 250);
    };
  };

  const generarPDF = descargarPDF; // Alias para compatibilidad

  const generarHTMLBitacora = (reportesFiltrados) => {
    const reportesPorPagina = 20;
    const totalPaginas = Math.ceil(reportesFiltrados.length / reportesPorPagina);
    
    let paginasHTML = '';
    
    for (let pagina = 0; pagina < totalPaginas; pagina++) {
      const inicio = pagina * reportesPorPagina;
      const fin = Math.min(inicio + reportesPorPagina, reportesFiltrados.length);
      const reportesPagina = reportesFiltrados.slice(inicio, fin);
      
      paginasHTML += `
        <div class="page ${pagina < totalPaginas - 1 ? 'page-break' : ''}">
          ${generarHeaderHTML()}
          ${generarTituloHTML()}
          ${generarTablaHTML(reportesPagina, inicio + 1)}
          ${generarFooterHTML()}
        </div>
      `;
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bitácora de Atención - FK-REPORTS</title>
        <style>
          ${obtenerEstilosCSS()}
        </style>
      </head>
      <body>
        ${paginasHTML}
      </body>
      </html>
    `;
  };

  const generarHeaderHTML = () => `
    <div class="header">
      <div class="logo-section">
        <div class="logo-circle">
          <span class="logo-text">FK</span>
        </div>
        <div class="company-info">
          <h1>SALUD AL ALCANCE DE TODOS®</h1>
          <p class="subtitle">Sistema de Gestión de Reportes Clínicos</p>
        </div>
      </div>
    </div>
  `;

  const generarTituloHTML = () => `
    <div class="title-section">
      <h2>BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA</h2>
      ${fechaInicio || fechaFin ? `
        <p class="date-range">
          Periodo: ${fechaInicio ? formatDate(fechaInicio) : 'Inicio'} - ${fechaFin ? formatDate(fechaFin) : 'Actual'}
        </p>
      ` : ''}
    </div>
  `;

  const generarTablaHTML = (reportes, numeroInicial) => `
    <table class="bitacora-table">
      <thead>
        <tr>
          <th class="col-nro">Nro</th>
          <th class="col-fecha">FECHA</th>
          <th class="col-hora">HORA</th>
          <th class="col-nombre">NOMBRE</th>
          <th class="col-edad">EDAD</th>
          <th class="col-motivo">MOTIVO</th>
        </tr>
      </thead>
      <tbody>
        ${reportes.map((reporte, index) => `
          <tr>
            <td class="text-center">${numeroInicial + index}</td>
            <td class="text-center">${formatDate(reporte.fechaRealizacion)}</td>
            <td class="text-center">${formatTime(reporte.createdAt || reporte.fechaRealizacion)}</td>
            <td>${reporte.datosPaciente?.nombre || reporte.paciente?.nombre || 'N/A'}</td>
            <td class="text-center">${reporte.datosPaciente?.edad || 'N/A'}</td>
            <td>${reporte.datosPrueba?.nombre || reporte.prueba?.nombre || 'N/A'}</td>
          </tr>
        `).join('')}
        ${generarFilasVacias(20 - reportes.length)}
      </tbody>
    </table>
  `;

  const generarFilasVacias = (cantidad) => {
    if (cantidad <= 0) return '';
    return Array(cantidad).fill(0).map(() => `
      <tr class="empty-row">
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `).join('');
  };

  const generarFooterHTML = () => `
    <div class="footer">
      <div class="signature-line">
        <div>Dir. Seguridad Pública</div>
        <div>Médico Responsable</div>
      </div>
    </div>
  `;

  const obtenerEstilosCSS = () => `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 20mm;
      position: relative;
    }

    .page-break {
      page-break-after: always;
    }

    .header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #2563eb;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo-circle {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-text {
      color: white;
      font-weight: bold;
      font-size: 24px;
    }

    .company-info h1 {
      font-size: 18px;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .subtitle {
      font-size: 12px;
      color: #64748b;
    }

    .title-section {
      text-align: center;
      margin-bottom: 20px;
    }

    .title-section h2 {
      font-size: 16px;
      color: #1e293b;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .date-range {
      font-size: 11px;
      color: #64748b;
      margin-top: 5px;
    }

    .bitacora-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 30px;
    }

    .bitacora-table th {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 6px;
      text-align: left;
      font-weight: bold;
      color: #1e293b;
    }

    .bitacora-table td {
      border: 1px solid #e2e8f0;
      padding: 6px;
      color: #475569;
    }

    .bitacora-table tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .empty-row {
      height: 30px;
    }

    .col-nro { width: 8%; }
    .col-fecha { width: 14%; }
    .col-hora { width: 10%; }
    .col-nombre { width: 35%; }
    .col-edad { width: 10%; }
    .col-motivo { width: 23%; }

    .text-center {
      text-align: center;
    }

    .footer {
      position: absolute;
      bottom: 20mm;
      left: 20mm;
      right: 20mm;
    }

    .signature-line {
      display: flex;
      justify-content: space-between;
      padding-top: 40px;
      border-top: 2px solid #e2e8f0;
      font-size: 10px;
      font-weight: bold;
      color: #1e293b;
    }

    @media print {
      body {
        padding: 0;
      }

      .page {
        margin: 0;
        padding: 15mm;
      }

      .page-break {
        page-break-after: always;
      }
    }
  `;

  const reportesFiltrados = filtrarReportes();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-poppins flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Bitácora de Atención de Certificación Médica
            </h2>
            <p className="text-sm text-gray-600 font-inter">
              Filtra y descarga reportes clínicos por rango de fechas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Fecha inicial
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-inter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Fecha final
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-inter"
              />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600 font-inter">
            Mostrando {reportesFiltrados.length} reportes
          </div>
        </div>

        {/* Contenido - Vista Previa del Documento */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-inter">Cargando reportes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                <p className="font-inter">{error}</p>
              </div>
            </div>
          ) : reportesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-inter">No hay reportes en el rango seleccionado</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {generarVistaPrevia(reportesFiltrados)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium font-inter"
          >
            Cerrar
          </button>
          <button
            onClick={generarPDF}
            disabled={reportesFiltrados.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BitacoraModal;