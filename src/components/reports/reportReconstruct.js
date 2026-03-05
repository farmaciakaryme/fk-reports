import { pruebasAPI } from '../../services/api';

// Detecta si un resultado pertenece a un campo adicional en lugar de una subprueba normal.
// La deteccion se basa en la clave o la unidad del resultado guardado.
const esCampoAdicional = (resultado) => {
  return resultado.clave === 'gradosAlcohol' || resultado.unidad === 'mg/L';
};

// Reconstruye el objeto formData a partir de un reporte guardado en la base de datos.
// Separa subpruebas normales de campos adicionales usando el prefijo campo_.
export const reconstructFormData = (report) => {
  const formData = {
    fecha: new Date(report.fechaRealizacion).toISOString().split('T')[0],
    hora: new Date(report.fechaRealizacion).toTimeString().slice(0, 5),
    observaciones: report.observaciones || ''
  };

  report.resultados?.forEach((resultado) => {
    const subPruebaId = resultado.subPruebaId?.$oid || resultado.subPruebaId;

    if (esCampoAdicional(resultado)) {
      formData[`campo_${subPruebaId}`] = resultado.valor;
    } else {
      formData[subPruebaId] = resultado.valor;
    }
  });

  report.camposAdicionales?.forEach((campo) => {
    const campoId = campo._id?.$oid || campo._id;
    formData[`campo_${campoId}`] = campo.valor;
  });

  return formData;
};

// Reconstruye el objeto testConfig a partir de un reporte guardado.
// Intenta primero usar la prueba poblada, luego la API, y como ultimo recurso
// construye una config minima desde los resultados guardados.
export const reconstructTestConfig = async (report) => {
  if (report.prueba?.subPruebas && report.prueba.subPruebas.length > 0) {
    return report.prueba;
  }

  const pruebaId = report.prueba?.$oid || report.prueba?._id || report.prueba;

  if (pruebaId) {
    try {
      const response = await pruebasAPI.getById(pruebaId);
      const pruebaCompleta = response.data || response;

      if (pruebaCompleta.subPruebas && pruebaCompleta.subPruebas.length > 0) {
        return pruebaCompleta;
      }
    } catch (error) {
      console.error('Error cargando prueba desde API:', error);
    }
  }

  // Fallback: construir desde los resultados guardados
  const subPruebas = [];
  const camposAdicionales = [];

  report.resultados?.forEach((resultado) => {
    const subPruebaId = resultado.subPruebaId?.$oid || resultado.subPruebaId;

    if (esCampoAdicional(resultado)) {
      camposAdicionales.push({
        _id: subPruebaId,
        nombre: resultado.nombre,
        clave: resultado.clave,
        unidad: resultado.unidad || '',
        tipo: 'number',
        descripcion: resultado.referencia || ''
      });
    } else {
      subPruebas.push({
        _id: subPruebaId,
        nombre: resultado.nombre || resultado.clave || 'Sin nombre',
        clave: resultado.clave,
        unidad: resultado.unidad || '',
        tipo: 'texto',
        valoresReferencia: {
          texto: resultado.referencia || 'Sin referencia disponible',
          opciones: []
        }
      });
    }
  });

  return {
    _id: pruebaId || 'unknown',
    nombre: report.datosPrueba?.nombre || 'Reporte Medico',
    codigo: report.datosPrueba?.codigo || '',
    metodo: report.datosPrueba?.metodo || 'N/A',
    tecnica: report.datosPrueba?.tecnica || 'N/A',
    subPruebas,
    camposAdicionales
  };
};