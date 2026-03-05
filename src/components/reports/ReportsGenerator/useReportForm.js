import { useState, useCallback } from 'react';
import { getLocalDateString, getLocalTimeString } from './reportUtils';
import { reportesAPI } from '../../../services/api';
import { buildReportPayload } from './reportUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Hook que centraliza el estado y logica del formulario de reporte
const useReportForm = (onBack) => {
  const [currentStep, setCurrentStep] = useState('patient');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    // Bug corregido: se usan helpers locales para evitar que UTC salte la fecha en la tarde
    fecha: getLocalDateString(),
    hora: getLocalTimeString()
  });
  const [errors, setErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const handlePatientSelect = useCallback((patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, pacienteId: patient._id }));
    setCurrentStep('form');
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  }, [errors.length]);

  const validateForm = () => {
    const validationErrors = [];
    if (!formData.fecha) validationErrors.push('Fecha');
    if (!formData.hora) validationErrors.push('Hora');
    return validationErrors;
  };

  const handleGeneratePreview = () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setCurrentStep('preview');
  };

  // Guarda el reporte en base de datos sin imprimir
  const handleSaveOnly = async (testConfig) => {
    setIsSaving(true);
    try {
      const reportData = buildReportPayload(testConfig, formData);
      console.log('Datos completos a guardar:', reportData);
      await reportesAPI.create(reportData);
      alert('Reporte guardado exitosamente');
      onBack();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Guarda en BD y luego imprime: iframe en PC, PDF en movil
  const handlePrintAndSave = async (testConfig, selectedPatient) => {
    setIsSaving(true);
    try {
      // 1. Guardar en base de datos
      const reportData = buildReportPayload(testConfig, formData);
      console.log('Datos completos a guardar:', reportData);
      await reportesAPI.create(reportData);

      // 2. Obtener el elemento del reporte
      const reportElement = document.querySelector('.report-to-print');
      if (!reportElement) {
        alert('Error: No se encontro el reporte');
        setIsSaving(false);
        return;
      }

      // 3. Detectar si es movil
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        // Movil: generar PDF con html2canvas + jsPDF
        console.log('Generando PDF para movil...');

        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123,
          ignoreElements: (element) => {
            return element.tagName === 'IFRAME' || element.tagName === 'EMBED';
          },
          onclone: (clonedDoc) => {
            const images = clonedDoc.getElementsByTagName('img');
            Array.from(images).forEach(img => {
              img.onerror = null;
            });
          }
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (imgHeight > pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pdfHeight);
        } else {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }

        const fileName = `reporte_${selectedPatient?.nombre || 'paciente'}_${formData.fecha}.pdf`;
        pdf.save(fileName);

        alert('Reporte guardado y PDF descargado');
        onBack();

      } else {
        // PC: usar metodo iframe original
        console.log('Imprimiendo en PC con iframe...');

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Reporte Medico</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @page { size: A4; margin: 0.5in; }
                body { margin: 0; padding: 0; }
                * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
              </style>
            </head>
            <body>
              ${reportElement.innerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            onBack();
          }, 500);
        }, 250);
      }

    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedPatient,
    formData,
    setFormData,
    errors,
    isSaving,
    handlePatientSelect,
    handleInputChange,
    handleGeneratePreview,
    handleSaveOnly,
    handlePrintAndSave
  };
};

export default useReportForm;