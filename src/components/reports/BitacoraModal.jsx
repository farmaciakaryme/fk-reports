/* eslint-disable no-unused-vars */
// BitacoraModal.jsx - CON FILTROS DE PRUEBAS
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { X, Download, Loader2, Calendar, FileText, Filter, CheckSquare, Square } from 'lucide-react';
import { reportesAPI, pruebasAPI } from '../../services/api';

const BitacoraModal = ({ onClose }) => {
  const [reportes, setReportes] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pruebasSeleccionadas, setPruebasSeleccionadas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Cargar reportes
      const reportesResponse = await reportesAPI.getAll({ limit: 1000 });
      setReportes(reportesResponse.data || []);

      // Cargar pruebas disponibles
      const pruebasResponse = await pruebasAPI.getAll({ activo: 'true' });
      const pruebasData = pruebasResponse.data || [];
      setPruebas(pruebasData);
      
      // Seleccionar todas las pruebas por defecto
      setPruebasSeleccionadas(pruebasData.map(p => p._id));
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrueba = (pruebaId) => {
    setPruebasSeleccionadas(prev => {
      if (prev.includes(pruebaId)) {
        return prev.filter(id => id !== pruebaId);
      } else {
        return [...prev, pruebaId];
      }
    });
  };

  const seleccionarTodas = () => {
    setPruebasSeleccionadas(pruebas.map(p => p._id));
  };

  const deseleccionarTodas = () => {
    setPruebasSeleccionadas([]);
  };

  const filtrarReportes = () => {
    let reportesFiltrados = reportes;

    // Filtro por fechas
    if (fechaInicio || fechaFin) {
      reportesFiltrados = reportesFiltrados.filter(report => {
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
    }

    // Filtro por pruebas seleccionadas
    if (pruebasSeleccionadas.length > 0) {
      reportesFiltrados = reportesFiltrados.filter(report => {
        const pruebaId = report.prueba?._id || report.prueba;
        return pruebasSeleccionadas.includes(pruebaId);
      });
    }

    return reportesFiltrados;
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

  const FILAS_POR_PAGINA = 20;
  
  const generarPaginas = () => {
    const paginas = [];
    const totalRegistros = datosAgrupados.length;
    const totalPaginas = Math.ceil(totalRegistros / FILAS_POR_PAGINA);
    
    for (let paginaNum = 0; paginaNum < Math.max(1, totalPaginas); paginaNum++) {
      const inicio = paginaNum * FILAS_POR_PAGINA;
      const fin = inicio + FILAS_POR_PAGINA;
      
      const filasPagina = [...Array(FILAS_POR_PAGINA)].map((_, index) => {
        const indiceGlobal = inicio + index;
        if (indiceGlobal < datosAgrupados.length) {
          return datosAgrupados[indiceGlobal];
        }
        return { fecha: '', hora: '', nombre: '', edad: '', motivos: [] };
      });
      
      paginas.push(filasPagina);
    }
    
    return paginas;
  };
  
  const paginas = generarPaginas();

  const abrirPanelImpresion = () => {
    const printContent = document.getElementById('bitacora-print-area');
    if (!printContent) {
      alert('Error: No se encontró el contenido de la bitácora');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Bitácora de Atención</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page {
              size: letter portrait;
              margin: 0.5in;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            
            .bitacora-page {
              height: 10in;
              display: flex;
              flex-direction: column;
              page-break-after: always;
              break-after: page;
            }
            
            .bitacora-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }
            
            .tabla-contenedor {
              flex: 0 0 auto;
            }
            
            .firmas-section {
              flex: 0 0 auto;
              margin-top: 3rem;
              padding-top: 1.5rem;
            }
            
            tbody tr {
              height: 22px !important;
              max-height: 22px !important;
            }
            
            tbody td {
              padding: 2px 6px !important;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 10px !important;
              line-height: 1.3 !important;
            }
            
            thead th {
              font-size: 11px !important;
              padding: 4px 6px !important;
            }
            
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
          
          {/* Header */}
          <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <h2 className="text-sm sm:text-lg font-semibold">Bitácora de Atención de Certificación Médica</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Filtros */}
          <div className="p-3 sm:p-4 border-b bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Filtra y descarga reportes clínicos por rango de fechas y tipo de prueba
            </p>
            
            {/* Filtros de fecha */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3 mb-3">
              <div className="flex-1">
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
              <div className="flex-1">
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
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                Filtrar Pruebas
              </button>
              <button
                onClick={abrirPanelImpresion}
                disabled={datosAgrupados.length === 0}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                Descargar PDF
              </button>
            </div>

            {/* Panel de filtro de pruebas */}
            {mostrarFiltros && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 mt-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Seleccionar Pruebas</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={seleccionarTodas}
                      className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Todas
                    </button>
                    <button
                      onClick={deseleccionarTodas}
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Ninguna
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {pruebas.map((prueba) => {
                    const isSelected = pruebasSeleccionadas.includes(prueba._id);
                    return (
                      <button
                        key={prueba._id}
                        onClick={() => togglePrueba(prueba._id)}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {prueba.nombre}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {prueba.codigo}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  {pruebasSeleccionadas.length} de {pruebas.length} pruebas seleccionadas
                </div>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-auto">
            <div className="text-center mb-4 p-4">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
                BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Mostrando {pacientesUnicos} pacientes únicos ({datosAgrupados.length} registros) - {paginas.length} página{paginas.length !== 1 ? 's' : ''}
              </p>
              {pruebasSeleccionadas.length < pruebas.length && (
                <p className="text-xs text-blue-600 mt-1">
                  Filtrado por {pruebasSeleccionadas.length} prueba{pruebasSeleccionadas.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 text-xs sm:text-sm">Error: {error}</div>
            ) : datosAgrupados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FileText className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-sm">No hay reportes con los filtros seleccionados</p>
              </div>
            ) : (
              <div id="bitacora-print-area">
                {paginas.map((filasPagina, indexPagina) => (
                  <div key={indexPagina} className="bitacora-page">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-16 h-16 border-2 border-gray-300 rounded-lg"></div>
                        <div className="text-right text-sm text-gray-500 italic">
                          SALUD AL ALCANCE DE TODOS®
                        </div>
                      </div>

                      <h1 className="text-center text-sm font-bold text-blue-700 mb-3">
                        BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
                      </h1>

                      <div className="tabla-contenedor">
                        <table className="w-full border-collapse border border-gray-800">
                          <thead>
                            <tr>
                              <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '10%' }}>
                                FECHA
                              </th>
                              <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '8%' }}>
                                HORA
                              </th>
                              <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '35%' }}>
                                NOMBRE
                              </th>
                              <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '8%' }}>
                                EDAD
                              </th>
                              <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '39%' }}>
                                MOTIVO
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filasPagina.map((item, index) => (
                              <tr key={index} style={{ height: '22px' }}>
                                <td className="border border-gray-800 text-center" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {item.fecha}
                                </td>
                                <td className="border border-gray-800 text-center" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {item.hora}
                                </td>
                                <td className="border border-gray-800" style={{ fontSize: '10px', padding: '2px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.nombre}
                                </td>
                                <td className="border border-gray-800 text-center" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {item.edad}
                                </td>
                                <td className="border border-gray-800" style={{ fontSize: '10px', padding: '2px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.motivos.join(', ')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="firmas-section">
                        <div className="flex justify-around items-end">
                          <div className="text-center">
                            <div className="border-t-2 border-gray-800 w-56 mb-2"></div>
                            <p className="text-xs font-bold">Dr. Seguridad Pública</p>
                            <p className="text-[10px] text-gray-600 mt-1">Firma y Sello</p>
                          </div>
                          <div className="text-center">
                            <div className="border-t-2 border-gray-800 w-56 mb-2"></div>
                            <p className="text-xs font-bold">Responsable Médico</p>
                            <p className="text-[10px] text-gray-600 mt-1">Firma y Sello</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6 text-[10px] text-gray-500">
                        Página {indexPagina + 1} de {paginas.length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t bg-gray-50 text-center">
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