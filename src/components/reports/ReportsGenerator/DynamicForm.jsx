/* eslint-disable react/prop-types */

// Formulario dinamico que renderiza campos segun la configuracion de la prueba
const DynamicForm = ({ testConfig, formData, onChange, selectedPatient, errors }) => {
  if (!testConfig) return null;

  return (
    <div className="space-y-4">
      {/* Info del paciente */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-xs font-semibold text-blue-900 mb-2">Paciente Seleccionado</h3>
        <p className="text-sm font-medium text-gray-900">{selectedPatient?.nombre}</p>
        <div className="flex gap-3 text-xs text-gray-600 mt-1">
          <span>Exp: {selectedPatient?.numeroExpediente || 'N/A'}</span>
          {selectedPatient?.edad && <span>Edad: {selectedPatient.edad} años</span>}
        </div>
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            value={formData.fecha || ''}
            onChange={(e) => onChange('fecha', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.includes('Fecha') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
          <input
            type="time"
            value={formData.hora || ''}
            onChange={(e) => onChange('hora', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.includes('Hora') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Campos dinamicos de subpruebas */}
      {testConfig.subPruebas?.map((subPrueba) => {
        const tieneOpciones =
          subPrueba.valoresReferencia?.opciones &&
          subPrueba.valoresReferencia.opciones.length > 0;
        const opciones = tieneOpciones
          ? subPrueba.valoresReferencia.opciones.map(op => op.valor)
          : null;

        return (
          <div key={subPrueba._id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {subPrueba.nombre}
              {subPrueba.unidad && (
                <span className="text-gray-500"> ({subPrueba.unidad})</span>
              )}
            </label>

            {tieneOpciones ? (
              <div className="flex gap-2">
                {opciones.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onChange(subPrueba._id, option)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData[subPrueba._id] === option
                        ? option === 'POSITIVA' || option === 'POSITIVO'
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : subPrueba.tipo === 'numerico' ? (
              <input
                type="number"
                step="0.01"
                value={formData[subPrueba._id] || ''}
                onChange={(e) => onChange(subPrueba._id, e.target.value)}
                placeholder={subPrueba.valoresReferencia?.texto || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={formData[subPrueba._id] || ''}
                onChange={(e) => onChange(subPrueba._id, e.target.value)}
                placeholder={subPrueba.valoresReferencia?.texto || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}

            {subPrueba.valoresReferencia?.texto && (
              <p className="text-xs text-gray-500 mt-1">
                Ref: {subPrueba.valoresReferencia.texto}
              </p>
            )}
          </div>
        );
      })}

      {/* Campos adicionales */}
      {testConfig.camposAdicionales?.map((campo) => (
        <div key={campo._id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {campo.nombre}
          </label>

          {campo.tipo === 'select' && campo.opciones ? (
            <select
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {campo.opciones.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          ) : campo.tipo === 'numero' || campo.tipo === 'number' ? (
            <input
              type="number"
              step="0.01"
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              placeholder={campo.placeholder || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : campo.tipo === 'fecha' ? (
            <input
              type="date"
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input
              type="text"
              value={formData[`campo_${campo._id}`] || ''}
              onChange={(e) => onChange(`campo_${campo._id}`, e.target.value)}
              placeholder={campo.placeholder || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}

          {campo.descripcion && (
            <p className="text-xs text-gray-500 mt-1">{campo.descripcion}</p>
          )}
        </div>
      ))}

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          value={formData.observaciones || ''}
          onChange={(e) => onChange('observaciones', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Observaciones adicionales..."
        />
      </div>
    </div>
  );
};

export default DynamicForm;