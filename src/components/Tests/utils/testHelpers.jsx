// utils/testHelpers.js

/**
 * Genera valores de referencia automáticamente basados en el cutoff
 */
export const generateValoresReferencia = (cutoff, unidad = 'ng/ml', tipo = 'positivo_negativo') => {
  if (!cutoff || isNaN(cutoff)) {
    return {
      texto: '',
      opciones: []
    };
  }

  if (tipo === 'positivo_negativo') {
    return {
      texto: `NEG: <${cutoff} ${unidad}\nPOS: ≥${cutoff} ${unidad}`,
      opciones: [
        { valor: 'NEGATIVA', label: 'NEGATIVA', esNormal: true },
        { valor: 'POSITIVA', label: 'POSITIVA', esNormal: false }
      ]
    };
  }

  if (tipo === 'number') {
    return {
      texto: `Valor de referencia: ${cutoff} ${unidad}`,
      min: 0,
      max: parseFloat(cutoff) * 2,
      opciones: []
    };
  }

  return {
    texto: `Valor de corte: ${cutoff} ${unidad}`,
    opciones: []
  };
};

/**
 * Genera una clave única a partir de un nombre
 */
export const generateClave = (nombre) => {
  return nombre
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Extrae el valor cutoff de un texto de valores de referencia
 */
export const extractCutoffFromText = (texto) => {
  if (!texto) return '';
  const match = texto.match(/[<≥]\s*(\d+)/);
  return match ? match[1] : '';
};