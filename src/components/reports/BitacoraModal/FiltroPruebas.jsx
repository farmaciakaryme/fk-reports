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
    <div className="bg-white border border-gray-300 rounded-lg p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Seleccionar Pruebas</h3>
        <div className="flex gap-2">
          <button
            onClick={onSeleccionarTodas}
            className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Todas
          </button>
          <button
            onClick={onDeseleccionarTodas}
            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Ninguna
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {pruebas.map((prueba) => {
          const isSelected = pruebasSeleccionadas.includes(prueba._id);
          // Precio con la hora actual (para mostrar el precio vigente)
          const precioActual = resolverPrecioPrueba(prueba, new Date().toISOString());
          const esPorPeriodo = prueba.precios?.tipo === 'por_periodo';

          return (
            <button
              key={prueba._id}
              onClick={() => onToggle(prueba._id)}
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
                <p className="text-sm font-medium text-gray-900 truncate">{prueba.nombre}</p>
                <p className="text-xs text-gray-500 truncate">{prueba.codigo}</p>
                {precioActual != null && (
                  <p className="text-xs text-green-600 font-medium">
                    ${precioActual}
                    {esPorPeriodo && <span className="text-gray-400 font-normal ml-1">(vigente)</span>}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-600">
        {pruebasSeleccionadas.length} de {pruebas.length} pruebas seleccionadas
      </div>
    </div>
  );
};

export default FiltroPruebas;
