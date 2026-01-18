/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { X, Download, Loader2, Calendar, FileText } from 'lucide-react';
import { reportesAPI } from '../../services/api';

const BitacoraModal = ({ onClose }) => {
  const [reportes, setReportes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchAllReportes();
    
    // BLINDAJE: Eliminar duplicados del DOM
    const duplicates = document.querySelectorAll('#bitacora-print-area');
    if (duplicates.length > 1) {
      console.warn('⚠️ Bitácora duplicada detectada. Limpiando...');
      duplicates.forEach((el, i) => {
        if (i !== 0) {
          el.remove();
        }
      });
    }
  }, []);

  const fetchAllReportes = async () => {
    setIsLoading(true);
    setError(null);
    try {
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
      const inicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
      const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;

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

  const agruparReportesInteligente = (reportes) => {
    const agrupados = {};
    
    reportes.forEach(reporte => {
      const nombrePaciente = reporte.datosPaciente?.nombre || reporte.paciente?.nombre || 'N/A';
      
      if (!agrupados[nombrePaciente]) {
        agrupados[nombrePaciente] = [];
      }
      
      agrupados[nombrePaciente].push(reporte);
    });

    const resultado = [];
    
    Object.values(agrupados).forEach(reportesPaciente => {
      reportesPaciente.sort((a, b) => 
        new Date(a.fechaRealizacion) - new Date(b.fechaRealizacion)
      );

      let grupoActual = [reportesPaciente[0]];
      
      for (let i = 1; i < reportesPaciente.length; i++) {
        const reporteAnterior = grupoActual[grupoActual.length - 1];
        const reporteActual = reportesPaciente[i];
        
        const fechaAnterior = new Date(reporteAnterior.fechaRealizacion);
        const fechaActual = new Date(reporteActual.fechaRealizacion);
        
        const diffMinutos = (fechaActual - fechaAnterior) / (1000 * 60);
        
        if (diffMinutos <= 30) {
          grupoActual.push(reporteActual);
        } else {
          resultado.push(crearRegistro(grupoActual));
          grupoActual = [reporteActual];
        }
      }
      
      resultado.push(crearRegistro(grupoActual));
    });
    
    return resultado.sort((a, b) => a.fechaOriginal - b.fechaOriginal);
  };

  const crearRegistro = (grupo) => {
    return {
      nombre: grupo[0].datosPaciente?.nombre || 'N/A',
      edad: grupo[0].datosPaciente?.edad || 'N/A',
      fecha: formatDate(grupo[0].fechaRealizacion),
      hora: formatTime(grupo[0].fechaRealizacion),
      motivos: grupo.map(r => r.datosPrueba?.nombre || r.prueba?.nombre || 'N/A'),
      fechaOriginal: new Date(grupo[0].fechaRealizacion)
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const reportesFiltrados = filtrarReportes();
  const datosAgrupados = agruparReportesInteligente(reportesFiltrados);
  const pacientesUnicos = new Set(datosAgrupados.map(d => d.nombre)).size;

  // SOLUCIÓN: Generar UNA SOLA PÁGINA siempre
  const FILAS_POR_PAGINA = 20;
  const filasPagina = [...Array(FILAS_POR_PAGINA)].map((_, index) => {
    if (index < datosAgrupados.length) {
      return datosAgrupados[index];
    }
    return { fecha: '', hora: '', nombre: '', edad: '', motivos: [] };
  });

 const abrirPanelImpresion = () => {
  const printContents = document.getElementById('bitacora-print-area').outerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
};


  return (
    <>
        <style>{`
@media print {
  body * {
    visibility: hidden !important;
  }

  #bitacora-print-area, 
  #bitacora-print-area * {
    visibility: visible !important;
  }

  #bitacora-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .no-print {
    display: none !important;
  }

  @page {
    size: letter portrait;
    margin: 0.5in;
  }
}
`}</style>


      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
          
          <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-xl no-print">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <h2 className="text-sm sm:text-lg font-semibold">Bitácora de Atención de Certificación Médica</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-3 sm:p-4 border-b bg-gray-50 no-print">
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Filtra y descarga reportes clínicos por rango de fechas
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Fecha inicial
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Fecha final
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>
              <button
                onClick={abrirPanelImpresion}
                disabled={datosAgrupados.length === 0}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                Descargar PDF
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-visible">
            <div className="text-center mb-4 sm:mb-6 no-print">
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
                      BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Mostrando {pacientesUnicos} pacientes únicos ({datosAgrupados.length} registros)
                    </p>
                  </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-full no-print">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 text-xs sm:text-sm no-print">Error: {error}</div>
            ) : (
              <div id="bitacora-print-area" className="h-full overflow-visible">
                <div className="p-3 sm:p-6">
                  

                  {/* UNA SOLA PÁGINA - SIN MAP */}
                  <div>
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-300 rounded-lg"></div>
                      <div className="text-right text-xs sm:text-sm text-gray-500 italic">
                        SALUD AL ALCANCE DE TODOS®
                      </div>
                    </div>

                    <h1 className="text-center text-xs sm:text-sm font-bold text-blue-700 mb-3 sm:mb-4">
                      BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
                    </h1>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-800">
                        <thead>
                          <tr>
                            <th className="border border-gray-800 px-1 py-1.5 text-[11px] sm:text-xs font-bold text-center bg-white">FECHA</th>
                            <th className="border border-gray-800 px-1 py-1.5 text-[11px] sm:text-xs font-bold text-center bg-white">HORA</th>
                            <th className="border border-gray-800 px-1 py-1.5 text-[11px] sm:text-xs font-bold text-center bg-white">NOMBRE</th>
                            <th className="border border-gray-800 px-1 py-1.5 text-[11px] sm:text-xs font-bold text-center bg-white">EDAD</th>
                            <th className="border border-gray-800 px-1 py-1.5 text-[11px] sm:text-xs font-bold text-center bg-white">MOTIVO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filasPagina.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-800 px-1 py-1.5 text-[10px] sm:text-[11px] text-center" style={{ height: '24px' }}>
                                {item.fecha}
                              </td>
                              <td className="border border-gray-800 px-1 py-1.5 text-[10px] sm:text-[11px] text-center" style={{ height: '24px' }}>
                                {item.hora}
                              </td>
                              <td className="border border-gray-800 px-1 py-1.5 text-[10px] sm:text-[11px]" style={{ height: '24px' }}>
                                {item.nombre}
                              </td>
                              <td className="border border-gray-800 px-1 py-1.5 text-[10px] sm:text-[11px] text-center" style={{ height: '24px' }}>
                                {item.edad}
                              </td>
                              <td className="border border-gray-800 px-1 py-1.5 text-[10px] sm:text-[11px]" style={{ height: '24px' }}>
                                {item.motivos.join(', ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-end mt-8 sm:mt-12">
                      <div className="text-center">
                        <div className="border-t-2 border-gray-800 w-32 sm:w-48 mb-1"></div>
                        <p className="text-[11px] sm:text-xs font-bold">Dr. Seguridad Pública</p>
                      </div>
                      <div className="text-center">
                        <div className="border-t-2 border-gray-800 w-32 sm:w-48 mb-1"></div>
                        <p className="text-[11px] sm:text-xs font-bold">Responsable Médico</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t bg-gray-50 text-center no-print">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BitacoraModal;