/* eslint-disable react/prop-types */
// components/PreciosForm.jsx
import { DollarSign, Plus, Trash2 } from 'lucide-react';

const PreciosForm = ({ precios, setPrecios }) => {
  const handleTipoChange = (tipo) => {
    setPrecios({ ...precios, tipo });
  };

  const handlePrecioFijoChange = (value) => {
    setPrecios({ ...precios, precioFijo: value === '' ? null : Number(value) });
  };

  const handleAddPeriodo = () => {
    setPrecios({
      ...precios,
      periodos: [
        ...precios.periodos,
        { nombre: '', horaInicio: '', horaFin: '', precio: '' }
      ]
    });
  };

  const handleUpdatePeriodo = (index, field, value) => {
    const updated = [...precios.periodos];
    updated[index] = { ...updated[index], [field]: value };
    setPrecios({ ...precios, periodos: updated });
  };

  const handleRemovePeriodo = (index) => {
    setPrecios({
      ...precios,
      periodos: precios.periodos.filter((_, i) => i !== index)
    });
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <DollarSign className="w-4 h-4 mr-2" />
        Precio
      </h4>

      <div className="space-y-4">
        <div className="flex items-center space-x-6">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="radio"
              name="tipoPrecios"
              value="fijo"
              checked={precios.tipo === 'fijo'}
              onChange={() => handleTipoChange('fijo')}
              className="mr-2"
            />
            Precio fijo
          </label>
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="radio"
              name="tipoPrecios"
              value="por_periodo"
              checked={precios.tipo === 'por_periodo'}
              onChange={() => handleTipoChange('por_periodo')}
              className="mr-2"
            />
            Por horario / periodo
          </label>
        </div>

        {precios.tipo === 'fijo' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={precios.precioFijo ?? ''}
              onChange={(e) => handlePrecioFijoChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: 350"
            />
          </div>
        )}

        {precios.tipo === 'por_periodo' && (
          <div className="space-y-3">
            {precios.periodos.length === 0 && (
              <p className="text-xs text-gray-500">
                Agrega al menos un periodo con su rango de horario y precio.
              </p>
            )}

            {precios.periodos.map((periodo, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg"
              >
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={periodo.nombre}
                    onChange={(e) => handleUpdatePeriodo(index, 'nombre', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Ej: Horario diurno"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Desde
                  </label>
                  <input
                    type="time"
                    value={periodo.horaInicio}
                    onChange={(e) => handleUpdatePeriodo(index, 'horaInicio', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Hasta
                  </label>
                  <input
                    type="time"
                    value={periodo.horaFin}
                    onChange={(e) => handleUpdatePeriodo(index, 'horaFin', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={periodo.precio}
                    onChange={(e) => handleUpdatePeriodo(index, 'precio', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemovePeriodo(index)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Eliminar periodo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPeriodo}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Periodo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreciosForm;
