/**
 * Resuelve el precio de una prueba dado un timestamp (hora del registro).
 * Soporta:
 *   - precios.tipo === 'fijo'         → precios.precioFijo
 *   - precios.tipo === 'por_periodo'  → busca el periodo que contiene la hora
 *   - sin estructura precios          → null
 */
export const resolverPrecioPrueba = (prueba, fechaRealizacion) => {
  if (!prueba?.precios) return null;

  const { tipo, precioFijo, periodos } = prueba.precios;

  if (tipo === 'fijo' || !tipo) {
    return precioFijo ?? null;
  }

  if (tipo === 'por_periodo' && periodos?.length > 0) {
    const fecha = fechaRealizacion ? new Date(fechaRealizacion) : new Date();
    const horaActual = fecha.getHours() * 60 + fecha.getMinutes(); // minutos desde medianoche

    for (const periodo of periodos) {
      const [hIni, mIni] = periodo.horaInicio.split(':').map(Number);
      const [hFin, mFin] = periodo.horaFin.split(':').map(Number);
      const inicio = hIni * 60 + mIni;
      const fin = hFin * 60 + mFin;

      // Periodo normal (ej. 08:00 → 20:00)
      if (inicio <= fin) {
        if (horaActual >= inicio && horaActual <= fin) return periodo.precio;
      } else {
        // Periodo que cruza medianoche (ej. 20:01 → 07:59)
        if (horaActual >= inicio || horaActual <= fin) return periodo.precio;
      }
    }

    // Fallback: primer periodo
    return periodos[0]?.precio ?? null;
  }

  return null;
};

/**
 * Devuelve todos los periodos de precio de una prueba,
 * útil para el editor de precio por registro.
 */
export const getPeriodosPrueba = (prueba) => {
  if (!prueba?.precios) return [];
  if (prueba.precios.tipo === 'por_periodo') return prueba.precios.periodos ?? [];
  return [];
};

/**
 * Construye un mapa { nombrePrueba: prueba } para lookup rápido
 */
export const buildPruebaMap = (pruebas) => {
  const map = {};
  pruebas.forEach((p) => {
    if (p.nombre) map[p.nombre] = p;
    if (p.codigo) map[p.codigo] = p;
  });
  return map;
};
