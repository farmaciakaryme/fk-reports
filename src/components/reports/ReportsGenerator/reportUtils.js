// Obtiene la fecha local en formato YYYY-MM-DD sin conversion UTC
export const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Obtiene la hora local en formato HH:MM sin conversion UTC
export const getLocalTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Capitaliza cada palabra: primera letra mayuscula, resto minusculas
// Funciona para nombres compuestos y apellidos
export const capitalizeName = (value) => {
  if (!value) return value;
  return value
    .split(' ')
    .map(word =>
      word.length === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
};

// Construye el array de resultados a partir de formData + testConfig
export const buildResultados = (testConfig, formData) => {
  const resultados = [];

  testConfig.subPruebas?.forEach((subPrueba) => {
    const valor = formData[subPrueba._id];
    if (valor !== null && valor !== undefined) {
      resultados.push({
        subPruebaId: subPrueba._id,
        clave: subPrueba.clave || subPrueba.nombre.toUpperCase(),
        nombre: subPrueba.nombre,
        valor: valor.toString(),
        unidad: subPrueba.unidad || '',
        referencia: subPrueba.valoresReferencia?.texto || ''
      });
    }
  });

  testConfig.camposAdicionales?.forEach((campo) => {
    const valor = formData[`campo_${campo._id}`];
    if (valor !== null && valor !== undefined && valor !== '') {
      resultados.push({
        subPruebaId: campo._id,
        clave: campo.clave || campo.nombre.toUpperCase().replace(/\s+/g, ''),
        nombre: campo.nombre,
        valor: valor.toString(),
        unidad: campo.unidad || '',
        referencia: campo.descripcion || ''
      });
    }
  });

  return resultados;
};

// Construye el payload completo para reportesAPI.create
export const buildReportPayload = (testConfig, formData) => {
  const resultados = buildResultados(testConfig, formData);
  const fechaHoraRealizacion = new Date(`${formData.fecha}T${formData.hora}:00`);

  return {
    pacienteId: formData.pacienteId,
    pruebaId: testConfig._id,
    fechaRealizacion: fechaHoraRealizacion.toISOString(),
    resultados,
    observaciones: formData.observaciones || '',
    estado: 'completado',
    solicitadoPor: 'A QUIEN CORRESPONDA'
  };
};