import { useState, useEffect } from 'react';
import { reportesAPI, pruebasAPI } from '../../../services/api';

// Formatea una fecha ISO a DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()}`;
};

// Formatea una fecha ISO a HH:MM
const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

// Agrupa reportes del mismo paciente que ocurrieron dentro de un margen de 30 minutos
// y los convierte en un registro unico de bitacora con multiples motivos.
const crearRegistro = (grupo) => ({
  nombre: grupo[0].datosPaciente?.nombre || 'N/A',
  edad: grupo[0].datosPaciente?.edad || 'N/A',
  fecha: formatDate(grupo[0].fechaRealizacion),
  hora: formatTime(grupo[0].fechaRealizacion),
  motivos: grupo.map((r) => r.datosPrueba?.nombre || r.prueba?.nombre || 'N/A'),
  fechaOriginal: new Date(grupo[0].fechaRealizacion)
});

const agruparReportesInteligente = (reportes) => {
  const agrupados = {};

  reportes.forEach((reporte) => {
    const nombre = reporte.datosPaciente?.nombre || reporte.paciente?.nombre || 'N/A';
    if (!agrupados[nombre]) agrupados[nombre] = [];
    agrupados[nombre].push(reporte);
  });

  const resultado = [];

  Object.values(agrupados).forEach((reportesPaciente) => {
    reportesPaciente.sort(
      (a, b) => new Date(a.fechaRealizacion) - new Date(b.fechaRealizacion)
    );

    let grupoActual = [reportesPaciente[0]];

    for (let i = 1; i < reportesPaciente.length; i++) {
      const anterior = grupoActual[grupoActual.length - 1];
      const actual = reportesPaciente[i];
      const diffMin =
        (new Date(actual.fechaRealizacion) - new Date(anterior.fechaRealizacion)) /
        (1000 * 60);

      if (diffMin <= 30) {
        grupoActual.push(actual);
      } else {
        resultado.push(crearRegistro(grupoActual));
        grupoActual = [actual];
      }
    }
    resultado.push(crearRegistro(grupoActual));
  });

  return resultado.sort((a, b) => a.fechaOriginal - b.fechaOriginal);
};

// Hook principal de la bitacora.
// Expone datos, filtros, paginacion virtual y la funcion de impresion.
const useBitacora = () => {
  const FILAS_POR_PAGINA = 20;

  const [reportes, setReportes] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pruebasSeleccionadas, setPruebasSeleccionadas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [reportesRes, pruebasRes] = await Promise.all([
          reportesAPI.getAll({ limit: 1000 }),
          pruebasAPI.getAll({ activo: 'true' })
        ]);
        const pruebasData = pruebasRes.data || [];
        setReportes(reportesRes.data || []);
        setPruebas(pruebasData);
        setPruebasSeleccionadas(pruebasData.map((p) => p._id));
      } catch (err) {
        console.error('Error al cargar datos de bitacora:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const togglePrueba = (pruebaId) => {
    setPruebasSeleccionadas((prev) =>
      prev.includes(pruebaId) ? prev.filter((id) => id !== pruebaId) : [...prev, pruebaId]
    );
  };

  const seleccionarTodas = () => setPruebasSeleccionadas(pruebas.map((p) => p._id));
  const deseleccionarTodas = () => setPruebasSeleccionadas([]);

  const filtrarReportes = () => {
    let filtrados = reportes;

    if (fechaInicio || fechaFin) {
      filtrados = filtrados.filter((report) => {
        const fecha = new Date(report.fechaRealizacion);
        const inicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
        const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;
        if (inicio && fin) return fecha >= inicio && fecha <= fin;
        if (inicio) return fecha >= inicio;
        if (fin) return fecha <= fin;
        return true;
      });
    }

    if (pruebasSeleccionadas.length > 0) {
      filtrados = filtrados.filter((report) => {
        const pruebaId = report.prueba?._id || report.prueba;
        return pruebasSeleccionadas.includes(pruebaId);
      });
    }

    return filtrados;
  };

  // Distribuye los registros en paginas de FILAS_POR_PAGINA con filas vacias al final
  const generarPaginas = (datos) => {
    const total = datos.length;
    const numPaginas = Math.ceil(total / FILAS_POR_PAGINA);
    const paginas = [];

    for (let p = 0; p < Math.max(1, numPaginas); p++) {
      const inicio = p * FILAS_POR_PAGINA;
      const filas = Array.from({ length: FILAS_POR_PAGINA }, (_, i) => {
        const idx = inicio + i;
        return idx < total
          ? datos[idx]
          : { fecha: '', hora: '', nombre: '', edad: '', motivos: [] };
      });
      paginas.push(filas);
    }

    return paginas;
  };

  // Imprime la bitacora usando un iframe
  const abrirPanelImpresion = () => {
    const printContent = document.getElementById('bitacora-print-area');
    if (!printContent) {
      alert('Error: No se encontro el contenido de la bitacora');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Bitacora de Atencion</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
      @page { size: letter portrait; margin: 0.5in; }
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .bitacora-page { height: 10in; display: flex; flex-direction: column; page-break-after: always; break-after: page; }
      .bitacora-page:last-child { page-break-after: auto; break-after: auto; }
      tbody tr { height: 22px !important; max-height: 22px !important; }
      tbody td { padding: 2px 6px !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px !important; line-height: 1.3 !important; }
      thead th { font-size: 11px !important; padding: 4px 6px !important; }
      * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
    </style>
  </head>
  <body>${printContent.innerHTML}</body>
</html>`);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  };

  const reportesFiltrados = filtrarReportes();
  const datosAgrupados = agruparReportesInteligente(reportesFiltrados);
  const paginas = generarPaginas(datosAgrupados);
  const pacientesUnicos = new Set(datosAgrupados.map((d) => d.nombre)).size;

  return {
    pruebas,
    isLoading,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    pruebasSeleccionadas,
    mostrarFiltros,
    setMostrarFiltros,
    togglePrueba,
    seleccionarTodas,
    deseleccionarTodas,
    datosAgrupados,
    paginas,
    pacientesUnicos,
    abrirPanelImpresion
  };
};

export default useBitacora;
