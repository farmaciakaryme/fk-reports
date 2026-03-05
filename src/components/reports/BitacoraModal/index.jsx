/* eslint-disable react/prop-types */
import { X, Download, Loader2, Calendar, FileText, Filter } from 'lucide-react';
import useBitacora from './useBitacora';
import FiltroPruebas from './FiltroPruebas';

const BitacoraModal = ({ onClose }) => {
  const {
    pruebas,
    isLoading,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    pruebasSeleccionadas,
    mostrarFiltros,
    setMostrarFiltros,
    togglePrueba,
    seleccionarTodas,
    deseleccionarTodas,
    datosAgrupados,
    paginas,
    pacientesUnicos,
    abrirPanelImpresion,
  } = useBitacora();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <h2 className="text-sm sm:text-lg font-semibold">
              Bitacora de Atencion de Certificacion Medica
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-3 sm:p-4 border-b bg-gray-50">
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            Filtra y descarga reportes clinicos por rango de fechas y tipo de prueba
          </p>

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

          {mostrarFiltros && (
            <FiltroPruebas
              pruebas={pruebas}
              pruebasSeleccionadas={pruebasSeleccionadas}
              onToggle={togglePrueba}
              onSeleccionarTodas={seleccionarTodas}
              onDeseleccionarTodas={deseleccionarTodas}
            />
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto">
          <div className="text-center mb-4 p-4">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
              BITACORA DE ATENCION DE CERTIFICACION MEDICA
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Mostrando {pacientesUnicos} pacientes unicos ({datosAgrupados.length} registros) -{' '}
              {paginas.length} pagina{paginas.length !== 1 ? 's' : ''}
            </p>
            {pruebasSeleccionadas.length < pruebas.length && (
              <p className="text-xs text-blue-600 mt-1">
                Filtrado por {pruebasSeleccionadas.length} prueba
                {pruebasSeleccionadas.length !== 1 ? 's' : ''}
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
                        SALUD AL ALCANCE DE TODOS
                      </div>
                    </div>

                    <h1 className="text-center text-sm font-bold text-blue-700 mb-3">
                      BITACORA DE ATENCION DE CERTIFICACION MEDICA
                    </h1>

                    <div className="tabla-contenedor">
                      <table className="w-full border-collapse border border-gray-800">
                        <thead>
                          <tr>
                            <th
                              className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white"
                              style={{ width: '10%' }}
                            >
                              FECHA
                            </th>
                            <th
                              className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white"
                              style={{ width: '8%' }}
                            >
                              HORA
                            </th>
                            <th
                              className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white"
                              style={{ width: '35%' }}
                            >
                              NOMBRE
                            </th>
                            <th
                              className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white"
                              style={{ width: '8%' }}
                            >
                              EDAD
                            </th>
                            <th
                              className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white"
                              style={{ width: '39%' }}
                            >
                              MOTIVO
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filasPagina.map((item, index) => (
                            <tr key={index} style={{ height: '22px' }}>
                              <td
                                className="border border-gray-800 text-center"
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                              >
                                {item.fecha}
                              </td>
                              <td
                                className="border border-gray-800 text-center"
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                              >
                                {item.hora}
                              </td>
                              <td
                                className="border border-gray-800"
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.nombre}
                              </td>
                              <td
                                className="border border-gray-800 text-center"
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                              >
                                {item.edad}
                              </td>
                              <td
                                className="border border-gray-800"
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.motivos.join(', ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div
                      className="firmas-section"
                      style={{ marginTop: '3rem', paddingTop: '1.5rem' }}
                    >
                      <div className="flex justify-around items-end">
                        <div className="text-center">
                          <div className="border-t-2 border-gray-800 w-56 mb-2"></div>
                          <p className="text-xs font-bold">Dr. Seguridad Publica</p>
                          <p className="text-[10px] text-gray-600 mt-1">Firma y Sello</p>
                        </div>
                        <div className="text-center">
                          <div className="border-t-2 border-gray-800 w-56 mb-2"></div>
                          <p className="text-xs font-bold">Responsable Medico</p>
                          <p className="text-[10px] text-gray-600 mt-1">Firma y Sello</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-6 text-[10px] text-gray-500">
                      Pagina {indexPagina + 1} de {paginas.length}
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
  );
};

export default BitacoraModal;