import { useState, useEffect } from 'react';
import { reportesAPI, pruebasAPI } from '../../../services/api';
import { resolverPrecioPrueba, buildPruebaMap } from './priceUtils';

// ── Helpers de formato ────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()}`;
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

// ── Construcción de registros ─────────────────────────────────────────────
const crearRegistro = (grupo, pruebaMap) => {
  const motivosConPrecio = grupo.map((r) => {
    const nombrePrueba = r.datosPrueba?.nombre || r.prueba?.nombre || 'N/A';
    const pruebaObj =
      pruebaMap[nombrePrueba] ||
      pruebaMap[r.datosPrueba?.codigo] ||
      pruebaMap[r.prueba?.codigo] ||
      null;
    const precio = resolverPrecioPrueba(pruebaObj, r.fechaRealizacion);
    return { nombre: nombrePrueba, precio, pruebaObj };
  });

  const precioBase = motivosConPrecio.reduce((s, m) => s + (m.precio ?? 0), 0);

  return {
    id: `${grupo[0].datosPaciente?.nombre || 'N/A'}-${grupo[0].fechaRealizacion}`,
    nombre: grupo[0].datosPaciente?.nombre || 'N/A',
    edad: grupo[0].datosPaciente?.edad || 'N/A',
    fecha: formatDate(grupo[0].fechaRealizacion),
    hora: formatTime(grupo[0].fechaRealizacion),
    fechaOriginal: new Date(grupo[0].fechaRealizacion),
    motivos: motivosConPrecio.map((m) => m.nombre),
    motivosConPrecio,
    precioBase,
  };
};

const agruparReportesInteligente = (reportes, pruebaMap) => {
  const agrupados = {};
  reportes.forEach((r) => {
    const nombre = r.datosPaciente?.nombre || r.paciente?.nombre || 'N/A';
    if (!agrupados[nombre]) agrupados[nombre] = [];
    agrupados[nombre].push(r);
  });

  const resultado = [];
  Object.values(agrupados).forEach((reportesPaciente) => {
    reportesPaciente.sort(
      (a, b) => new Date(a.fechaRealizacion) - new Date(b.fechaRealizacion)
    );
    let grupo = [reportesPaciente[0]];
    for (let i = 1; i < reportesPaciente.length; i++) {
      const diff =
        (new Date(reportesPaciente[i].fechaRealizacion) -
          new Date(grupo[grupo.length - 1].fechaRealizacion)) /
        60000;
      if (diff <= 30) {
        grupo.push(reportesPaciente[i]);
      } else {
        resultado.push(crearRegistro(grupo, pruebaMap));
        grupo = [reportesPaciente[i]];
      }
    }
    resultado.push(crearRegistro(grupo, pruebaMap));
  });

  return resultado.sort((a, b) => a.fechaOriginal - b.fechaOriginal);
};

// ── Precio efectivo de un registro ───────────────────────────────────────
export const calcularPrecioRegistro = (registro, precioCertMaestro) => {
  const base =
    registro.precioOverride !== null && registro.precioOverride !== undefined
      ? registro.precioOverride
      : registro.precioBase;

  const certPrecio = registro.tieneCertificado
    ? registro.precioCertificadoOverride !== null &&
      registro.precioCertificadoOverride !== undefined
      ? registro.precioCertificadoOverride
      : precioCertMaestro ?? 0
    : 0;

  return base + certPrecio;
};

// ── Resumen por hoja ──────────────────────────────────────────────────────
export const calcularResumenPagina = (filasPagina, precioCertMaestro) => {
  const conteos = {};

  filasPagina.forEach((fila) => {
    if (!fila.nombre) return;

    fila.motivosConPrecio?.forEach(({ nombre, precio }) => {
      if (!nombre) return;
      if (!conteos[nombre]) conteos[nombre] = { cantidad: 0, precio };
      conteos[nombre].cantidad++;
    });

    if (fila.tieneCertificado) {
      // Precio real del certificado para este registro (ya resuelto por periodo/hora)
      const certPrecio =
        fila.precioCertificadoOverride !== null &&
        fila.precioCertificadoOverride !== undefined
          ? fila.precioCertificadoOverride
          : precioCertMaestro !== null && precioCertMaestro !== undefined
          ? precioCertMaestro
          : fila.precioCertificadoEfectivo ?? 0;

      // Agrupar por precio real: Certificado ($200) y Certificado ($400) son filas distintas
      const key = `Certificado_${certPrecio}`;
      if (!conteos[key]) {
        conteos[key] = { cantidad: 0, precio: certPrecio, label: `Certificado ($${certPrecio})` };
      }
      conteos[key].cantidad++;
    }
  });

  return Object.entries(conteos).map(([key, entry]) => ({
    motivo: entry.label ?? key,
    cantidad: entry.cantidad,
    precio: entry.precio,
    subtotal: entry.precio !== null && entry.precio !== undefined
      ? entry.cantidad * entry.precio
      : null,
  }));
};

// ── Hook principal ────────────────────────────────────────────────────────
const useBitacora = () => {
  const FILAS_POR_PAGINA = 20;

  const [reportes, setReportes] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [pruebaMap, setPruebaMap] = useState({});
  const [pruebaCertificado, setPruebaCertificado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pruebasSeleccionadas, setPruebasSeleccionadas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Opciones de columnas
  const [mostrarColumnaPrecio, setMostrarColumnaPrecio] = useState(false);
  const [mostrarTablaResumen, setMostrarTablaResumen] = useState(false);

  // Precio maestro de certificado (null = automático desde BD por hora)
  const [precioCertificadoMaestro, setPrecioCertificadoMaestro] = useState(null);

  // Estado por registro
  const [registrosOcultos, setRegistrosOcultos] = useState(new Set());
  const [registrosConCertificado, setRegistrosConCertificado] = useState(new Set());
  const [preciosOverride, setPreciosOverride] = useState({}); // { id: number|null }
  const [preciosCertOverride, setPreciosCertOverride] = useState({}); // { id: number|null }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [reportesRes, pruebasRes] = await Promise.all([
          reportesAPI.getAll({ limit: 1000 }),
          pruebasAPI.getAll({ activo: 'true' }),
        ]);
        const pruebasData = pruebasRes.data || [];
        const map = buildPruebaMap(pruebasData);

        const certPrueba = pruebasData.find(
          (p) =>
            p.nombre?.toLowerCase().includes('certificado') ||
            p.codigo?.toLowerCase().includes('cert')
        );
        if (certPrueba) setPruebaCertificado(certPrueba);

        setReportes(reportesRes.data || []);
        setPruebas(pruebasData);
        setPruebaMap(map);
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

  // ── Acciones de filtro ──────────────────────────────────────────────────
  const togglePrueba = (id) =>
    setPruebasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const seleccionarTodas = () => setPruebasSeleccionadas(pruebas.map((p) => p._id));
  const deseleccionarTodas = () => setPruebasSeleccionadas([]);

  // ── Acciones de registros ───────────────────────────────────────────────
  const toggleRegistroVisible = (id) =>
    setRegistrosOcultos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const mostrarTodosLosRegistros = () => setRegistrosOcultos(new Set());

  const toggleCertificado = (id) =>
    setRegistrosConCertificado((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const agregarCertificadoATodos = (datosVisibles) =>
    setRegistrosConCertificado((prev) => {
      const next = new Set(prev);
      datosVisibles.forEach((d) => next.add(d.id));
      return next;
    });

  const quitarCertificadoATodos = () => setRegistrosConCertificado(new Set());

  const actualizarPrecioOverride = (id, valor) =>
    setPreciosOverride((prev) => ({
      ...prev,
      [id]: valor === '' || valor === null ? null : Number(valor),
    }));

  const actualizarPrecioCertOverride = (id, valor) =>
    setPreciosCertOverride((prev) => ({
      ...prev,
      [id]: valor === '' || valor === null ? null : Number(valor),
    }));

  // ── Filtrado ────────────────────────────────────────────────────────────
  const filtrarReportes = () => {
    let filtrados = reportes;
    if (fechaInicio || fechaFin) {
      filtrados = filtrados.filter((r) => {
        const fecha = new Date(r.fechaRealizacion);
        const inicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
        const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;
        if (inicio && fin) return fecha >= inicio && fecha <= fin;
        if (inicio) return fecha >= inicio;
        if (fin) return fecha <= fin;
        return true;
      });
    }
    if (pruebasSeleccionadas.length > 0) {
      filtrados = filtrados.filter((r) => {
        const pid = r.prueba?._id || r.prueba;
        return pruebasSeleccionadas.includes(pid);
      });
    }
    return filtrados;
  };

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
          : {
              fecha: '',
              hora: '',
              nombre: '',
              edad: '',
              motivos: [],
              motivosConPrecio: [],
              tieneCertificado: false,
              precioBase: 0,
              precioOverride: null,
              precioCertificadoOverride: null,
              precioCertificadoEfectivo: 0,
            };
      });
      paginas.push(filas);
    }
    return paginas;
  };

  // ── Impresión ───────────────────────────────────────────────────────────
  const abrirPanelImpresion = () => {
    const printContent = document.getElementById('bitacora-print-area');
    if (!printContent) {
      alert('Error: No se encontró el contenido de la bitácora');
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
    <title>Bitácora de Atención</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
      @page { size: letter portrait; margin: 0.45in 0.4in; }
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .bitacora-page {
        display: block;
        page-break-inside: avoid;
        page-break-after: always;
        break-after: page;
        break-inside: avoid;
      }
      .bitacora-page:last-child { page-break-after: avoid !important; break-after: avoid !important; }
      .overflow-x-auto { overflow: visible !important; }
      table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
      tbody tr { height: 21px !important; max-height: 21px !important; }
      tbody td { padding: 1px 5px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; font-size: 9.5px !important; line-height: 1.2 !important; }
      thead th { font-size: 10px !important; padding: 3px 5px !important; }
      .no-print { display: none !important; }
      * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; box-sizing: border-box; }
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

  // ── Derivados ───────────────────────────────────────────────────────────
  const reportesFiltrados = filtrarReportes();
  let datosAgrupados = agruparReportesInteligente(reportesFiltrados, pruebaMap);

  datosAgrupados = datosAgrupados.map((d) => {
    const horaISO = d.fechaOriginal?.toISOString();
    const precioCertEfectivo =
      preciosCertOverride[d.id] !== undefined && preciosCertOverride[d.id] !== null
        ? preciosCertOverride[d.id]
        : precioCertificadoMaestro !== null
        ? precioCertificadoMaestro
        : resolverPrecioPrueba(pruebaCertificado, horaISO) ?? 0;

    return {
      ...d,
      tieneCertificado: registrosConCertificado.has(d.id),
      precioOverride: preciosOverride[d.id] ?? null,
      precioCertificadoOverride: preciosCertOverride[d.id] ?? null,
      precioCertificadoEfectivo: precioCertEfectivo,
    };
  });

  const datosVisibles = datosAgrupados.filter((d) => !registrosOcultos.has(d.id));
  const paginas = generarPaginas(datosVisibles);
  const pacientesUnicos = new Set(datosVisibles.map((d) => d.nombre)).size;

  return {
    pruebas,
    pruebaCertificado,
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
    datosVisibles,
    paginas,
    pacientesUnicos,
    abrirPanelImpresion,
    mostrarColumnaPrecio,
    setMostrarColumnaPrecio,
    mostrarTablaResumen,
    setMostrarTablaResumen,
    precioCertificadoMaestro,
    setPrecioCertificadoMaestro,
    registrosOcultos,
    toggleRegistroVisible,
    mostrarTodosLosRegistros,
    registrosConCertificado,
    toggleCertificado,
    agregarCertificadoATodos,
    quitarCertificadoATodos,
    actualizarPrecioOverride,
    actualizarPrecioCertOverride,
  };
};

export default useBitacora;
