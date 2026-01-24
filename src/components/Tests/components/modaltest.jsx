/* eslint-disable react/prop-types */
// components/TestModal.jsx
import { useState } from 'react';
import { X, Loader2, FlaskConical } from 'lucide-react';
import SubpruebasList from './SubpruebasList';
import AddSubpruebaForm from './AddSubpruebaForm';
import ValoresReferenciaModal from './ValoresReferenciaModal';
import { generateValoresReferencia, generateClave } from '../utils/testHelpers';

const TestModal = ({ mode, test, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    nombre: test?.nombre || '',
    descripcion: test?.descripcion || '',
    codigo: test?.codigo || '',
    categoria: test?.categoria || 'general',
    subPruebas: test?.subPruebas || [],
    camposAdicionales: test?.camposAdicionales || []
  });

  const [tempSubPrueba, setTempSubPrueba] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'positivo_negativo',
    unidad: 'ng/ml',
    cutoff: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('El nombre de la prueba es obligatorio');
      return;
    }

    const dataToSend = { ...formData };
    if (!dataToSend.codigo) {
      const categoria = dataToSend.categoria.substring(0, 3).toUpperCase();
      const nombre = generateClave(dataToSend.nombre).substring(0, 4);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      dataToSend.codigo = `${categoria}-${nombre}${random}`;
    }

    setSaving(true);
    try {
      await onSave(dataToSend);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubPrueba = () => {
    if (!tempSubPrueba.nombre.trim()) {
      alert('El nombre de la subprueba es obligatorio');
      return;
    }

    const newSubPrueba = {
      clave: generateClave(tempSubPrueba.nombre),
      nombre: tempSubPrueba.nombre,
      descripcion: tempSubPrueba.descripcion || '',
      tipo: tempSubPrueba.tipo,
      unidad: tempSubPrueba.unidad,
      valoresReferencia: generateValoresReferencia(
        tempSubPrueba.cutoff,
        tempSubPrueba.unidad,
        tempSubPrueba.tipo
      ),
      requerido: true,
      orden: formData.subPruebas.length
    };

    setFormData({
      ...formData,
      subPruebas: [...formData.subPruebas, newSubPrueba]
    });

    setTempSubPrueba({
      nombre: '',
      descripcion: '',
      tipo: 'positivo_negativo',
      unidad: 'ng/ml',
      cutoff: ''
    });
  };

  const handleEditValoresReferencia = (index) => {
    const subprueba = formData.subPruebas[index];
    let cutoffValue = '';
    
    if (subprueba.valoresReferencia?.texto) {
      const match = subprueba.valoresReferencia.texto.match(/[<≥]\s*(\d+)/);
      if (match) cutoffValue = match[1];
    }

    setEditingIndex(index);
    setTempSubPrueba({
      nombre: subprueba.nombre,
      descripcion: subprueba.descripcion || '',
      tipo: subprueba.tipo || 'positivo_negativo',
      unidad: subprueba.unidad || 'ng/ml',
      cutoff: cutoffValue
    });
    setShowRefModal(true);
  };

  const handleSaveValoresReferencia = () => {
    if (editingIndex === null) return;

    const updatedSubPruebas = [...formData.subPruebas];
    updatedSubPruebas[editingIndex] = {
      ...updatedSubPruebas[editingIndex],
      tipo: tempSubPrueba.tipo,
      unidad: tempSubPrueba.unidad,
      valoresReferencia: generateValoresReferencia(
        tempSubPrueba.cutoff,
        tempSubPrueba.unidad,
        tempSubPrueba.tipo
      )
    };

    setFormData({ ...formData, subPruebas: updatedSubPruebas });
    setShowRefModal(false);
    setEditingIndex(null);
  };

  const handleRemoveSubPrueba = (index) => {
    setFormData({
      ...formData,
      subPruebas: formData.subPruebas.filter((_, i) => i !== index)
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? 'Nueva Prueba' : 'Editar Prueba'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información General */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Información General</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="toxicologia">Toxicología</option>
                    <option value="hematologia">Hematología</option>
                    <option value="microbiologia">Microbiología</option>
                    <option value="inmunologia">Inmunología</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subpruebas */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FlaskConical className="w-4 h-4 mr-2" />
                Subpruebas
              </h4>

              <SubpruebasList
                subPruebas={formData.subPruebas}
                onEdit={handleEditValoresReferencia}
                onRemove={handleRemoveSubPrueba}
              />

              <AddSubpruebaForm
                tempSubPrueba={tempSubPrueba}
                setTempSubPrueba={setTempSubPrueba}
                onAdd={handleAddSubPrueba}
              />
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  mode === 'create' ? 'Crear Prueba' : 'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showRefModal && (
        <ValoresReferenciaModal
          tempSubPrueba={tempSubPrueba}
          setTempSubPrueba={setTempSubPrueba}
          onClose={() => {
            setShowRefModal(false);
            setEditingIndex(null);
          }}
          onSave={handleSaveValoresReferencia}
        />
      )}
    </>
  );
};

export default TestModal;