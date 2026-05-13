/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  X, Download, Loader2, Calendar, FileText, Filter,
  Eye, EyeOff, Award, DollarSign, BarChart2,
  ChevronDown, ChevronUp, RotateCcw, PlusCircle, MinusCircle,
  Edit3, Check, Info,
} from 'lucide-react';
import useBitacora, { calcularPrecioRegistro, calcularResumenPagina } from './useBitacora';
import FiltroPruebas from './FiltroPruebas';
import { resolverPrecioPrueba, getPeriodosPrueba } from './priceUtils';

// ── Tabla resumen por hoja ────────────────────────────────────────────────
const TablaResumenHoja = ({ filasPagina, precioCertificadoMaestro, mostrarColumnaPrecio }) => {
  const resumen = calcularResumenPagina(filasPagina, precioCertificadoMaestro);
  if (resumen.length === 0) return null;
  const totalGeneral = resumen.reduce((s, r) => s + (r.subtotal ?? 0), 0);

  return (
    <div className="mt-4 border border-gray-700 rounded overflow-hidden">
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-700 px-2 py-1 text-left font-bold">Concepto</th>
            <th className="border border-gray-700 px-2 py-1 text-center font-bold">Cant.</th>
            {mostrarColumnaPrecio && (
              <>
                <th className="border border-gray-700 px-2 py-1 text-center font-bold">P/U ($)</th>
                <th className="border border-gray-700 px-2 py-1 text-center font-bold">Subtotal ($)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {resumen.map(({ motivo, cantidad, precio, subtotal }) => (
            <tr key={motivo}>
              <td className="border border-gray-700 px-2 py-1">{abreviarMotivo(motivo)}</td>
              <td className="border border-gray-700 px-2 py-1 text-center">{cantidad}</td>
              {mostrarColumnaPrecio && (
                <>
                  <td className="border border-gray-700 px-2 py-1 text-center">
                    {precio != null ? `$${Number(precio).toFixed(2)}` : '—'}
                  </td>
                  <td className="border border-gray-700 px-2 py-1 text-center font-semibold">
                    {subtotal != null ? `$${subtotal.toFixed(2)}` : '—'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
        {mostrarColumnaPrecio && (
          <tfoot>
            <tr className="bg-blue-50 font-bold">
              <td className="border border-gray-700 px-2 py-1" colSpan={3}>Total</td>
              <td className="border border-gray-700 px-2 py-1 text-center text-blue-700">
                ${totalGeneral.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

// ── Tooltip de períodos de precio ─────────────────────────────────────────
const TooltipPeriodos = ({ pruebaCertificado }) => {
  const [visible, setVisible] = useState(false);
  const periodos = getPeriodosPrueba(pruebaCertificado);
  if (periodos.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="text-blue-400 hover:text-blue-600"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {visible && (
        <div className="absolute z-20 left-5 top-0 bg-gray-800 text-white text-[11px] rounded-lg px-3 py-2 w-52 shadow-lg">
          <p className="font-semibold mb-1">Precios por período:</p>
          {periodos.map((p) => (
            <div key={p.nombre} className="flex justify-between gap-2">
              <span className="capitalize text-gray-300">
                {p.nombre} ({p.horaInicio}–{p.horaFin})
              </span>
              <span className="font-bold text-green-400">${p.precio}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Panel maestro de opciones ─────────────────────────────────────────────
const PanelOpciones = ({
  mostrarColumnaPrecio, setMostrarColumnaPrecio,
  mostrarTablaResumen, setMostrarTablaResumen,
  precioCertificadoMaestro, setPrecioCertificadoMaestro,
  registrosOcultos, mostrarTodosLosRegistros,
  pruebaCertificado,
  datosVisibles,
  registrosConCertificado,
  agregarCertificadoATodos, quitarCertificadoATodos,
}) => {
  const [abierto, setAbierto] = useState(false);
  const todosConCert =
    datosVisibles.length > 0 &&
    datosVisibles.every((d) => registrosConCertificado.has(d.id));

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-purple-600" />
          Opciones de columnas y certificados
        </span>
        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {abierto && (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 space-y-3">

          {/* Columna precio */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mostrarColumnaPrecio}
              onChange={(e) => setMostrarColumnaPrecio(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-700">Mostrar columna de precio por registro</span>
          </label>

          {/* Tabla resumen */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mostrarTablaResumen}
              onChange={(e) => setMostrarTablaResumen(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <BarChart2 className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-700">Tabla de resumen por hoja (conteos × precio)</span>
          </label>

          {/* Precio maestro certificado */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">Precio Certificado (maestro)</span>
              {pruebaCertificado && <TooltipPeriodos pruebaCertificado={pruebaCertificado} />}
            </div>
            <p className="text-[11px] text-amber-700">
              {precioCertificadoMaestro === null
                ? 'Automático desde BD según hora del registro'
                : `Fijo en $${precioCertificadoMaestro} para todos los registros`}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Auto (BD)"
                value={precioCertificadoMaestro ?? ''}
                onChange={(e) =>
                  setPrecioCertificadoMaestro(
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                className="w-28 px-2 py-1 border border-amber-300 rounded text-xs focus:ring-2 focus:ring-amber-400 bg-white"
              />
              {precioCertificadoMaestro !== null && (
                <button
                  onClick={() => setPrecioCertificadoMaestro(null)}
                  className="text-[11px] text-amber-600 underline hover:text-amber-800"
                >
                  Restablecer auto
                </button>
              )}
            </div>
          </div>

          {/* Certificado global */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 space-y-2">
            <p className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Certificado — acción masiva
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => agregarCertificadoATodos(datosVisibles)}
                disabled={todosConCert}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Agregar a todos
              </button>
              <button
                onClick={quitarCertificadoATodos}
                disabled={registrosConCertificado.size === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                Quitar de todos
              </button>
            </div>
            {registrosConCertificado.size > 0 && (
              <p className="text-[11px] text-blue-600">
                {registrosConCertificado.size} registro{registrosConCertificado.size !== 1 ? 's' : ''} con certificado
              </p>
            )}
          </div>

          {/* Restaurar ocultos */}
          {registrosOcultos.size > 0 && (
            <button
              onClick={mostrarTodosLosRegistros}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium w-full"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar {registrosOcultos.size} registro{registrosOcultos.size !== 1 ? 's' : ''} oculto{registrosOcultos.size !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Editor inline de precio por registro ─────────────────────────────────
const EditorPrecio = ({ label, valorActual, valorBase, onSave, placeholder }) => {
  const [editando, setEditando] = useState(false);
  const [temp, setTemp] = useState('');

  const iniciarEdicion = () => {
    setTemp(valorActual !== null && valorActual !== undefined ? String(valorActual) : '');
    setEditando(true);
  };

  const confirmar = () => {
    onSave(temp);
    setEditando(false);
  };

  const estaOverride = valorActual !== null && valorActual !== undefined;

  if (editando) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="number"
          min="0"
          step="1"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmar();
            if (e.key === 'Escape') setEditando(false);
          }}
          placeholder={placeholder}
          className="w-20 px-1.5 py-0.5 border border-blue-400 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onClick={confirmar} className="text-green-600 hover:text-green-800">
          <Check className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group cursor-pointer" onClick={iniciarEdicion}>
      <span className={`text-[10px] ${estaOverride ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>
        {label}: {estaOverride ? `$${Number(valorActual).toFixed(2)}` : `$${Number(valorBase ?? 0).toFixed(2)}`}
        {estaOverride && <span className="ml-1 text-[9px] text-blue-400">(editado)</span>}
      </span>
      <Edit3 className="w-2.5 h-2.5 text-gray-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

// ── Abreviador de motivos ─────────────────────────────────────────────────
const abreviarMotivo = (nombre) => {
  if (!nombre) return nombre;
  // No abreviar labels de certificado que ya traen precio: "Certificado ($200)"
  if (/^Certificado \(\$/.test(nombre)) return nombre;
  return nombre
    .replace(/ANTIDOPING/gi, 'TOX')
    .replace(/\(6 elementos\)/gi, '(6)')
    .replace(/ALCOHOLIMETRO/gi, 'ALCO')
    .replace(/Prueba de Embarazo/gi, 'P.Emb')
    .replace(/\bCertificado\b/gi, 'CERT');
};

// ── Fila de la tabla ──────────────────────────────────────────────────────
const FilaBitacora = ({
  item,
  mostrarColumnaPrecio,
  precioCertificadoMaestro,
  onToggleVisible,
  onToggleCertificado,
  onActualizarPrecioOverride,
  onActualizarPrecioCertOverride,
  esVisible,
}) => {
  // Fila vacía (relleno de página)
  if (!item.nombre) {
    const colCount = mostrarColumnaPrecio ? 7 : 6;
    return (
      <tr style={{ height: '22px' }}>
        {Array.from({ length: colCount }).map((_, i) => (
          <td key={i} className="border border-gray-800" style={{ fontSize: '10px', padding: '2px 6px' }}>
            &nbsp;
          </td>
        ))}
      </tr>
    );
  }

  const motivosMostrados = item.tieneCertificado
    ? [...item.motivos, 'Certificado']
    : item.motivos;

  const precioEfectivo = calcularPrecioRegistro(item, item.precioCertificadoEfectivo);

  return (
    <tr style={{ height: 'auto', minHeight: '22px' }} className={!esVisible ? 'opacity-40 bg-gray-50' : ''}>
      <td className="border border-gray-800 text-center" style={{ fontSize: '10px', padding: '2px 6px' }}>
        {item.fecha}
      </td>
      <td className="border border-gray-800 text-center" style={{ fontSize: '10px', padding: '2px 6px' }}>
        {item.hora}
      </td>
      <td className="border border-gray-800" style={{ fontSize: '10px', padding: '2px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {!esVisible ? <s>{item.nombre}</s> : item.nombre}
      </td>
      <td className="border border-gray-800 text-center" style={{ fontSize: '10px', padding: '2px 6px' }}>
        {item.edad}
      </td>
      <td className="border border-gray-800" style={{ fontSize: '10px', padding: '2px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {motivosMostrados.map(abreviarMotivo).join(', ')}
      </td>

      {mostrarColumnaPrecio && (
        <td className="border border-gray-800" style={{ fontSize: '10px', padding: '2px 6px', minWidth: '80px' }}>
          <div className="text-center font-medium text-green-700">
            ${precioEfectivo.toFixed(2)}
          </div>
          {/* Editores inline - sólo en vista previa, no se imprimen */}
          <div className="no-print space-y-0.5 mt-0.5">
            <EditorPrecio
              label="Base"
              valorActual={item.precioOverride}
              valorBase={item.precioBase}
              placeholder={String(item.precioBase ?? 0)}
              onSave={(val) => onActualizarPrecioOverride(item.id, val)}
            />
            {item.tieneCertificado && (
              <EditorPrecio
                label="Cert"
                valorActual={item.precioCertificadoOverride}
                valorBase={item.precioCertificadoEfectivo}
                placeholder={String(item.precioCertificadoEfectivo ?? precioCertificadoMaestro ?? 0)}
                onSave={(val) => onActualizarPrecioCertOverride(item.id, val)}
              />
            )}
          </div>
        </td>
      )}

      {/* Acciones — no se imprimen */}
      <td className="border border-gray-100 no-print" style={{ padding: '2px 4px', whiteSpace: 'nowrap', width: '56px' }}>
        <div className="flex items-center gap-1 justify-center">
          <button
            title={item.tieneCertificado ? 'Quitar certificado' : 'Agregar certificado'}
            onClick={() => onToggleCertificado(item.id)}
            className={`p-0.5 rounded transition-colors ${
              item.tieneCertificado
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
          </button>
          <button
            title={esVisible ? 'Ocultar registro' : 'Mostrar registro'}
            onClick={() => onToggleVisible(item.id)}
            className={`p-0.5 rounded transition-colors ${
              !esVisible
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            {esVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Modal principal ───────────────────────────────────────────────────────
const BitacoraModal = ({ onClose }) => {
  const {
    pruebas, pruebaCertificado, isLoading, error,
    fechaInicio, setFechaInicio, fechaFin, setFechaFin,
    pruebasSeleccionadas, mostrarFiltros, setMostrarFiltros,
    togglePrueba, seleccionarTodas, deseleccionarTodas,
    datosAgrupados, datosVisibles, paginas, pacientesUnicos,
    abrirPanelImpresion,
    mostrarColumnaPrecio, setMostrarColumnaPrecio,
    mostrarTablaResumen, setMostrarTablaResumen,
    precioCertificadoMaestro, setPrecioCertificadoMaestro,
    registrosOcultos, toggleRegistroVisible, mostrarTodosLosRegistros,
    registrosConCertificado, toggleCertificado,
    agregarCertificadoATodos, quitarCertificadoATodos,
    actualizarPrecioOverride, actualizarPrecioCertOverride,
  } = useBitacora();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <h2 className="text-sm sm:text-lg font-semibold">
              Bitácora de Atención de Certificación Médica
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Filtros y opciones */}
        <div className="p-3 sm:p-4 border-b bg-gray-50 space-y-2 flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-600">
            Filtra y descarga reportes clínicos por rango de fechas y tipo de prueba
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Fecha inicial
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Fecha final
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              Filtrar Pruebas
            </button>
            <button
              onClick={abrirPanelImpresion}
              disabled={datosVisibles.length === 0}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              Descargar PDF
            </button>
          </div>

          <PanelOpciones
            mostrarColumnaPrecio={mostrarColumnaPrecio}
            setMostrarColumnaPrecio={setMostrarColumnaPrecio}
            mostrarTablaResumen={mostrarTablaResumen}
            setMostrarTablaResumen={setMostrarTablaResumen}
            precioCertificadoMaestro={precioCertificadoMaestro}
            setPrecioCertificadoMaestro={setPrecioCertificadoMaestro}
            registrosOcultos={registrosOcultos}
            mostrarTodosLosRegistros={mostrarTodosLosRegistros}
            pruebaCertificado={pruebaCertificado}
            datosVisibles={datosVisibles}
            registrosConCertificado={registrosConCertificado}
            agregarCertificadoATodos={agregarCertificadoATodos}
            quitarCertificadoATodos={quitarCertificadoATodos}
          />

          {mostrarFiltros && (
            <FiltroPruebas
              pruebas={pruebas}
              pruebasSeleccionadas={pruebasSeleccionadas}
              onToggle={togglePrueba}
              onSeleccionarTodas={seleccionarTodas}
              onDeseleccionarTodas={deseleccionarTodas}
            />
          )}
        </div>

        {/* Leyenda */}
        <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-100 flex flex-wrap gap-4 text-[11px] text-gray-500 flex-shrink-0">
          <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" /> Certificado individual</span>
          <span className="flex items-center gap-1"><EyeOff className="w-3 h-3 text-red-400" /> Ocultar de impresión</span>
          <span className="flex items-center gap-1"><Edit3 className="w-3 h-3 text-blue-400" /> Clic en precio para editar</span>
          {registrosOcultos.size > 0 && (
            <span className="text-orange-600 font-medium">{registrosOcultos.size} oculto{registrosOcultos.size !== 1 ? 's' : ''}</span>
          )}
          {registrosConCertificado.size > 0 && (
            <span className="text-amber-600 font-medium">{registrosConCertificado.size} con certificado</span>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto">
          <div className="text-center mb-4 p-4">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
              BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Mostrando {pacientesUnicos} pacientes únicos ({datosVisibles.length} registros) —{' '}
              {paginas.length} página{paginas.length !== 1 ? 's' : ''}
            </p>
            {pruebasSeleccionadas.length < pruebas.length && (
              <p className="text-xs text-blue-600 mt-1">
                Filtrado por {pruebasSeleccionadas.length} prueba{pruebasSeleccionadas.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 text-sm">Error: {error}</div>
          ) : datosAgrupados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-sm">No hay reportes con los filtros seleccionados</p>
            </div>
          ) : (
            <div id="bitacora-print-area">
              {paginas.map((filasPagina, indexPagina) => (
                <div key={indexPagina} className="bitacora-page mb-8 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-16 h-16 border-2 border-gray-300 rounded-lg" />
                      <div className="text-right text-sm text-gray-500 italic">
                        SALUD AL ALCANCE DE TODOS
                      </div>
                    </div>

                    <h1 className="text-center text-sm font-bold text-blue-700 mb-3">
                      BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
                    </h1>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-800">
                        <thead>
                          <tr>
                            <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '10%' }}>FECHA</th>
                            <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '8%' }}>HORA</th>
                            <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: mostrarColumnaPrecio ? '28%' : '33%' }}>NOMBRE</th>
                            <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '7%' }}>EDAD</th>
                            <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: mostrarColumnaPrecio ? '30%' : '35%' }}>MOTIVO</th>
                            {mostrarColumnaPrecio && (
                              <th className="border border-gray-800 px-2 py-2 text-[11px] font-bold text-center bg-white" style={{ width: '10%' }}>PRECIO ($)</th>
                            )}
                            <th className="border border-gray-100 px-1 py-2 text-[10px] font-bold text-center bg-gray-50 no-print" style={{ width: '56px' }}>ACC.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filasPagina.map((item, index) => {
                            const esVisible = item.nombre ? !registrosOcultos.has(item.id) : true;
                            return (
                              <FilaBitacora
                                key={item.id || index}
                                item={item}
                                mostrarColumnaPrecio={mostrarColumnaPrecio}
                                precioCertificadoMaestro={
                                  precioCertificadoMaestro ??
                                  (item.precioCertificadoEfectivo ?? 0)
                                }
                                onToggleVisible={toggleRegistroVisible}
                                onToggleCertificado={toggleCertificado}
                                onActualizarPrecioOverride={actualizarPrecioOverride}
                                onActualizarPrecioCertOverride={actualizarPrecioCertOverride}
                                esVisible={esVisible}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Tabla resumen por hoja */}
                    {mostrarTablaResumen && (
                      <TablaResumenHoja
                        filasPagina={filasPagina.filter((f) => f.nombre && !registrosOcultos.has(f.id))}
                        precioCertificadoMaestro={precioCertificadoMaestro}
                        mostrarColumnaPrecio={mostrarColumnaPrecio}
                      />
                    )}

                    <div className="firmas-section" style={{ marginTop: '3rem', paddingTop: '1.5rem' }}>
                      <div className="flex justify-around items-end">
                        <div className="text-center">
                          <div className="border-t-2 border-gray-800 w-56 mb-2" />
                          <p className="text-xs font-bold">Dr. Seguridad Pública</p>
                          <p className="text-[10px] text-gray-600 mt-1">Firma y Sello</p>
                        </div>
                        <div className="text-center">
                          <div className="border-t-2 border-gray-800 w-56 mb-2" />
                          <p className="text-xs font-bold">Responsable Médico</p>
                          <p className="text-[10px] text-gray-600 mt-1">Firma y Sello</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-6 text-[10px] text-gray-500">
                      Página {indexPagina + 1} de {paginas.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t bg-gray-50 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BitacoraModal;
