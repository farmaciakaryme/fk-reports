/* eslint-disable react/prop-types */
// components/SubpruebasList.jsx
import { Settings, X } from 'lucide-react';

const SubpruebasList = ({ subPruebas, onEdit, onRemove }) => {
  if (subPruebas.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {subPruebas.map((subprueba, index) => (
        <div 
          key={index} 
          className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                {subprueba.clave}
              </span>
              <p className="text-sm font-medium text-gray-900">
                {subprueba.nombre}
              </p>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                {subprueba.tipo}
              </span>
            </div>
            {subprueba.valoresReferencia?.texto && (
              <p className="text-xs text-gray-600 whitespace-pre-line font-mono">
                {subprueba.valoresReferencia.texto}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              type="button"
              onClick={() => onEdit(index)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Editar valores de referencia"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Eliminar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubpruebasList;