import { useState, useCallback, useEffect } from 'react';
import { reportesAPI } from '../../../services/api';
import { reconstructFormData, reconstructTestConfig } from '../reportReconstruct';
import { buildResultados } from '../ReportsGenerator/reportUtils';
import { printReportElement, downloadReportAsPDF } from '../printUtils';

// Hook que carga el reporte a editar y expone toda la logica de edicion.
const useReportEditor = (reportToEdit, onBack) => {
  const [currentStep, setCurrentStep] = useState('form');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [testConfig, setTestConfig] = useState(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      if (!reportToEdit) {
        setIsLoadingTest(false);
        return;
      }

      try {
        setIsLoadingTest(true);

        setSelectedPatient({
          _id: reportToEdit.paciente?._id || reportToEdit.paciente,
          nombre: reportToEdit.datosPaciente?.nombre || 'N/A',
          numeroExpediente:
            reportToEdit.datosPaciente?.numeroExpediente ||
            reportToEdit.datosPaciente?.expediente ||
            'N/A',
          edad: reportToEdit.datosPaciente?.edad || ''
        });

        const config = await reconstructTestConfig(reportToEdit);
        setTestConfig(config);
        setFormData(reconstructFormData(reportToEdit));
      } catch (error) {
        console.error('Error al cargar datos del reporte:', error);
        alert('Error al cargar los datos del reporte');
      } finally {
        setIsLoadingTest(false);
      }
    };

    loadReportData();
  }, [reportToEdit]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors.length > 0) setErrors([]);
    },
    [errors.length]
  );

  const handlePatientChange = useCallback(
    (field, value) => {
      setSelectedPatient((prev) => ({ ...prev, [field]: value }));
      if (errors.length > 0) setErrors([]);
    },
    [errors.length]
  );

  const validateForm = () => {
    const validationErrors = [];
    if (!formData.fecha) validationErrors.push('Fecha');
    if (!formData.hora) validationErrors.push('Hora');
    if (!selectedPatient?.nombre?.trim()) validationErrors.push('Nombre del paciente');
    if (!selectedPatient?.edad) validationErrors.push('Edad del paciente');
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

  // Construye el payload de actualizacion con subpruebas y campos adicionales.
  const buildUpdatePayload = () => {
    const resultados = buildResultados(testConfig, formData);
    const fechaRealizacion = new Date(`${formData.fecha}T${formData.hora}:00`);

    return {
      resultados,
      observaciones: formData.observaciones || '',
      fechaRealizacion: fechaRealizacion.toISOString(),
      datosPaciente: {
        nombre: selectedPatient.nombre,
        edad: parseInt(selectedPatient.edad),
        numeroExpediente: selectedPatient.numeroExpediente
      }
    };
  };

  // Guarda los cambios en la base de datos sin imprimir.
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updateData = buildUpdatePayload();
      console.log('Actualizando reporte:', reportToEdit._id, updateData);
      await reportesAPI.update(reportToEdit._id, updateData);
      alert('Reporte actualizado exitosamente');
      onBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Guarda los cambios y luego imprime o descarga segun el dispositivo.
  const handleSaveAndPrint = async () => {
    setIsSaving(true);
    try {
      const updateData = buildUpdatePayload();
      await reportesAPI.update(reportToEdit._id, updateData);

      const reportElement = document.querySelector('.report-to-print');
      if (!reportElement) {
        alert('Error: No se encontro el elemento del reporte');
        setIsSaving(false);
        return;
      }

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        const fileName = `reporte_${reportToEdit.folio}_editado.pdf`;
        await downloadReportAsPDF(reportElement, fileName);
        alert('Reporte actualizado y PDF descargado');
        onBack();
      } else {
        printReportElement(reportElement, reportToEdit.folio);
        setTimeout(() => onBack(), 800);
      }
    } catch (error) {
      console.error('Error al guardar e imprimir:', error);
      alert('Error al actualizar el reporte: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedPatient,
    formData,
    errors,
    isSaving,
    testConfig,
    isLoadingTest,
    handleInputChange,
    handlePatientChange,
    handleGeneratePreview,
    handleSaveChanges,
    handleSaveAndPrint
  };
};

export default useReportEditor;
