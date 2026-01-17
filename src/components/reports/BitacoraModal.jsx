/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { X, Download, Loader2, Calendar, FileText } from 'lucide-react';
import { reportesAPI } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BitacoraModal = ({ onClose }) => {
  const [reportes, setReportes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchAllReportes();
  }, []);

  const fetchAllReportes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportesAPI.getAll({ limit: 1000 });
      setReportes(response.data || []);
    } catch (err) {
      console.error('Error al cargar bitácora:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarReportes = () => {
    if (!fechaInicio && !fechaFin) return reportes;

    return reportes.filter(report => {
      const fechaReporte = new Date(report.fechaRealizacion);
      const inicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
      const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;

      if (inicio && fin) {
        return fechaReporte >= inicio && fechaReporte <= fin;
      } else if (inicio) {
        return fechaReporte >= inicio;
      } else if (fin) {
        return fechaReporte <= fin;
      }
      return true;
    });
  };

  const agruparReportesInteligente = (reportes) => {
    const agrupados = {};
    
    reportes.forEach(reporte => {
      const nombrePaciente = reporte.datosPaciente?.nombre || reporte.paciente?.nombre || 'N/A';
      
      if (!agrupados[nombrePaciente]) {
        agrupados[nombrePaciente] = [];
      }
      
      agrupados[nombrePaciente].push(reporte);
    });

    const resultado = [];
    
    Object.values(agrupados).forEach(reportesPaciente => {
      reportesPaciente.sort((a, b) => 
        new Date(a.fechaRealizacion) - new Date(b.fechaRealizacion)
      );

      let grupoActual = [reportesPaciente[0]];
      
      for (let i = 1; i < reportesPaciente.length; i++) {
        const reporteAnterior = grupoActual[grupoActual.length - 1];
        const reporteActual = reportesPaciente[i];
        
        const fechaAnterior = new Date(reporteAnterior.fechaRealizacion);
        const fechaActual = new Date(reporteActual.fechaRealizacion);
        
        const diffMinutos = (fechaActual - fechaAnterior) / (1000 * 60);
        
        if (diffMinutos <= 30) {
          grupoActual.push(reporteActual);
        } else {
          resultado.push(crearRegistro(grupoActual));
          grupoActual = [reporteActual];
        }
      }
      
      resultado.push(crearRegistro(grupoActual));
    });
    
    return resultado.sort((a, b) => b.fechaOriginal - a.fechaOriginal);
  };

  const crearRegistro = (grupo) => {
    return {
      nombre: grupo[0].datosPaciente?.nombre || 'N/A',
      edad: grupo[0].datosPaciente?.edad || 'N/A',
      fecha: formatDate(grupo[0].fechaRealizacion),
      hora: formatTime(grupo[0].fechaRealizacion),
      motivos: grupo.map(r => r.datosPrueba?.nombre || r.prueba?.nombre || 'N/A'),
      fechaOriginal: new Date(grupo[0].fechaRealizacion)
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // ✅ PDF CON FORMATO IDÉNTICO AL WORD - 20 FILAS POR PÁGINA
  const exportarPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const reportesFiltrados = filtrarReportes();
    const datosAgrupados = agruparReportesInteligente(reportesFiltrados);

    const FILAS_POR_PAGINA = 20;
    const totalPaginas = Math.ceil(datosAgrupados.length / FILAS_POR_PAGINA);

    for (let numPagina = 0; numPagina < totalPaginas; numPagina++) {
      if (numPagina > 0) {
        doc.addPage();
      }

      // ========== TÍTULO ==========
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const titulo = 'BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA';
      const tituloWidth = doc.getTextWidth(titulo);
      doc.text(titulo, (doc.internal.pageSize.width - tituloWidth) / 2, 20);

      // ========== TABLA ==========
      const inicio = numPagina * FILAS_POR_PAGINA;
      const fin = Math.min(inicio + FILAS_POR_PAGINA, datosAgrupados.length);
      const datosPagina = datosAgrupados.slice(inicio, fin);

      // Crear exactamente 20 filas (rellenar con vacías si es necesario)
      const tableData = [];
      for (let i = 0; i < FILAS_POR_PAGINA; i++) {
        if (i < datosPagina.length) {
          const item = datosPagina[i];
          tableData.push([
            item.fecha || '',
            item.hora || '',
            item.nombre || '',
            item.edad?.toString() || '',
            item.motivos.join(', ') || ''
          ]);
        } else {
          // Fila vacía
          tableData.push(['', '', '', '', '']);
        }
      }

      autoTable(doc, {
        startY: 30,
        head: [['FECHA', 'HORA', 'NOMBRE', 'EDAD', 'MOTIVO']],
        body: tableData,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left',
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 60 },
          3: { cellWidth: 15 },
          4: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 }
      });

      // ========== FIRMA EN CADA PÁGINA ==========
      const finalY = doc.lastAutoTable.finalY + 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const firmaText = '_________________________________';
      const firmaWidth = doc.getTextWidth(firmaText);
      doc.text(firmaText, (doc.internal.pageSize.width - firmaWidth) / 2, finalY);
      
      doc.setFont('helvetica', 'bold');
      const responsableText = 'Dr. Seguridad Pública Responsable Médico';
      const responsableWidth = doc.getTextWidth(responsableText);
      doc.text(responsableText, (doc.internal.pageSize.width - responsableWidth) / 2, finalY + 6);
    }

    const nombreArchivo = `bitacora_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
  };

  const reportesFiltrados = filtrarReportes();
  const datosAgrupados = agruparReportesInteligente(reportesFiltrados);
  const pacientesUnicos = new Set(datosAgrupados.map(d => d.nombre)).size;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        
        <div className="p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Bitácora de Atención de Certificación Médica</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">
            Filtra y descarga reportes clínicos por rango de fechas
          </p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha inicial
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha final
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={exportarPDF}
              disabled={datosAgrupados.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-600">Error: {error}</div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    BITÁCORA DE ATENCIÓN DE CERTIFICACIÓN MÉDICA
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mostrando {pacientesUnicos} pacientes únicos ({datosAgrupados.length} registros)
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">FECHA</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">HORA</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">NOMBRE</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">EDAD</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm">MOTIVO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosAgrupados.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{item.fecha}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{item.hora}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm font-medium">{item.nombre}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{item.edad}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {item.motivos.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BitacoraModal;