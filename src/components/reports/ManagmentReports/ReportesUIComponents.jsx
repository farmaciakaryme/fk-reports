/* eslint-disable react/prop-types */
import { Eye, Edit2, Download, Trash2, X, Loader2 } from 'lucide-react';

// Modal para seleccionar el tipo de prueba antes de crear un reporte
export const TestSelectionModal = ({ onClose, onSelectTest, pruebas, isLoading }) => {
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
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">
              Selecciona el tipo de prueba
            </h2>
            <p className="text-sm text-gray-600 font-inter">
              Elige una prueba para generar un nuevo reporte clinico.
            </p>
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
              const isAvailable = prueba.subPruebas && prueba.subPruebas.length > 0;
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
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-blue-600 font-poppins">
                      {prueba.nombre}
                    </h3>
                    {prueba.codigo && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-mono">
                        {prueba.codigo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 font-inter line-clamp-2">
                    {prueba.descripcion || 'Sin descripcion'}
                  </p>
                  {isAvailable ? (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-green-600 font-medium font-inter flex-1">
                        {prueba.subPruebas?.length || 0} subprueba
                        {prueba.subPruebas?.length > 1 ? 's' : ''} disponible
                        {prueba.subPruebas?.length > 1 ? 's' : ''}
                      </p>
                      {prueba.categoria && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {prueba.categoria}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-orange-600 font-medium font-inter">
                      No tiene subpruebas configuradas
                    </p>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500 font-inter">No hay pruebas disponibles</p>
              <p className="text-xs text-gray-400 mt-1 font-inter">
                Crea pruebas en la seccion de Gestion de Pruebas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal para ver el detalle de un reporte.
// Si el reporte tiene pdfUrl muestra un iframe, de lo contrario muestra los datos en texto.
export const ReportViewModal = ({ report, onClose, onDownload }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (report.pdfUrl) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full h-full sm:max-w-6xl sm:max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Datos del Paciente
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Nombre:</span>{' '}
                  {report.datosPaciente?.nombre || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Edad:</span>{' '}
                  {report.datosPaciente?.edad || 'N/A'} años
                </p>
                <p className="text-sm">
                  <span className="font-medium">Sexo:</span>{' '}
                  {report.datosPaciente?.sexo || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">CURP:</span>{' '}
                  {report.datosPaciente?.curp || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informacion de la Prueba
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Prueba:</span>{' '}
                  {report.datosPrueba?.nombre || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Fecha:</span>{' '}
                  {formatDate(report.fechaRealizacion)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Estado:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      report.autorizado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {report.autorizado ? 'Autorizado' : 'Pendiente'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {report.resultados && report.resultados.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Resultados
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {report.resultados.map((resultado, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">{resultado.nombre}</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Resultado:</span> {resultado.valor}
                    </p>
                    {resultado.unidad && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Unidad:</span> {resultado.unidad}
                      </p>
                    )}
                    {resultado.referencia && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Referencia:</span> {resultado.referencia}
                      </p>
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

// Fila de la tabla principal de reportes con botones de accion
export const ReportRow = ({ report, onView, onEdit, onDownload, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
            title="Imprimir/Descargar"
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
