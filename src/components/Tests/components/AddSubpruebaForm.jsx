/* eslint-disable react/prop-types */
// components/AddSubpruebaForm.jsx
import { Plus } from 'lucide-react';
import { generateValoresReferencia } from '../utils/testHelpers';

const AddSubpruebaForm = ({ tempSubPrueba, setTempSubPrueba, onAdd }) => {
  const previewValues = tempSubPrueba.cutoff 
    ? generateValoresReferencia(tempSubPrueba.cutoff, tempSubPrueba.unidad, tempSubPrueba.tipo)
    : null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={tempSubPrueba.nombre}
          onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, nombre: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Nombre de la subprueba *"
        />
        <input
          type="text"
          value={tempSubPrueba.descripcion}
          onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, descripcion: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Descripción (opcional)"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <select
          value={tempSubPrueba.tipo}
          onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, tipo: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="positivo_negativo">Positivo/Negativo</option>
          <option value="number">Numérico</option>
          <option value="text">Texto</option>
        </select>
        
        <input
          type="number"
          value={tempSubPrueba.cutoff}
          onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, cutoff: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Valor cutoff"
        />
        
        <select
          value={tempSubPrueba.unidad}
          onChange={(e) => setTempSubPrueba({ ...tempSubPrueba, unidad: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="ng/ml">ng/ml</option>
          <option value="mg/dl">mg/dl</option>
          <option value="g/dl">g/dl</option>
          <option value="%">%</option>
          <option value="μg/ml">μg/ml</option>
          <option value="mmol/L">mmol/L</option>
          <option value="UI/L">UI/L</option>
        </select>
      </div>

      {previewValues && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <p className="text-xs text-blue-800 font-semibold mb-1">Vista previa:</p>
          <p className="text-xs text-blue-700 whitespace-pre-line font-mono">
            {previewValues.texto}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar Subprueba
      </button>
    </div>
  );
};

export default AddSubpruebaForm;