/* eslint-disable react/prop-types */
// components/ValoresReferenciaModal.jsx
import { Settings } from 'lucide-react';
import { generateValoresReferencia } from '../utils/testHelpers';

const ValoresReferenciaModal = ({ tempSubPrueba, setTempSubPrueba, onClose, onSave }) => {
  const previewValues = tempSubPrueba.cutoff 
    ? generateValoresReferencia(tempSubPrueba.cutoff, tempSubPrueba.unidad, tempSubPrueba.tipo)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurar Valores de Referencia
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Resultado
            </label>
            <select
              value={tempSubPrueba.tipo}
              onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="positivo_negativo">Positivo/Negativo</option>
              <option value="number">Numérico</option>
              <option value="text">Texto libre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor de Corte (Cutoff)
            </label>
            <input
              type="number"
              value={tempSubPrueba.cutoff}
              onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, cutoff: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad de Medida
            </label>
            <select
              value={tempSubPrueba.unidad}
              onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, unidad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ng/ml">ng/ml</option>
              <option value="mg/dl">mg/dl</option>
              <option value="g/dl">g/dl</option>
              <option value="μg/ml">μg/ml</option>
              <option value="%">%</option>
              <option value="mmol/L">mmol/L</option>
              <option value="UI/L">UI/L</option>
            </select>
          </div>

          {previewValues && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-2">Vista previa:</p>
              <p className="text-xs text-blue-800 whitespace-pre-line font-mono">
                {previewValues.texto}
              </p>
              {tempSubPrueba.tipo === 'positivo_negativo' && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    • NEGATIVA: &lt; {tempSubPrueba.cutoff} {tempSubPrueba.unidad} (Normal)
                  </p>
                  <p className="text-xs text-blue-700">
                    • POSITIVA: ≥ {tempSubPrueba.cutoff} {tempSubPrueba.unidad} (Anormal)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValoresReferenciaModal;