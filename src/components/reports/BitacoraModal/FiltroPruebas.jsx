/* eslint-disable react/prop-types */
import { CheckSquare, Square } from 'lucide-react';
import { resolverPrecioPrueba } from './priceUtils';

const FiltroPruebas = ({
  pruebas,
  pruebasSeleccionadas,
  onToggle,
  onSeleccionarTodas,
  onDeseleccionarTodas,
}) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Seleccionar Pruebas</h3>
        <div className="flex gap-2">
          <button
            onClick={onSeleccionarTodas}
            className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Todas
          </button>
          <button
            onClick={onDeseleccionarTodas}
            className="text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Ninguna
          </button>
        </div>
      </div>

      {/* Lista vertical: el nombre completo siempre es legible, con scroll propio si hay muchas pruebas */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {pruebas.map((prueba) => {
          const isSelected = pruebasSeleccionadas.includes(prueba._id);
          // Precio con la hora actual (para mostrar el precio vigente)
          const precioActual = resolverPrecioPrueba(prueba, new Date().toISOString());
          const esPorPeriodo = prueba.precios?.tipo === 'por_periodo';

          return (
            <button
              key={prueba._id}
              onClick={() => onToggle(prueba._id)}
              className={`w-full flex items-start gap-2 p-2.5 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-snug break-words">
                  {prueba.nombre}
                </p>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  {prueba.codigo && (
                    <p className="text-xs text-gray-500 truncate">{prueba.codigo}</p>
                  )}
                  {precioActual != null && (
                    <p className="text-xs text-green-600 font-medium whitespace-nowrap">
                      ${precioActual}
                      {esPorPeriodo && <span className="text-gray-400 font-normal ml-1">(vigente)</span>}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {pruebasSeleccionadas.length} de {pruebas.length} pruebas seleccionadas
      </div>
    </div>
  );
};

export default FiltroPruebas;