import { useState, useEffect } from 'react';
import { pruebasAPI } from '../../../services/api';

// Hook que carga la configuracion de la prueba y setea defaults en formData
const useTestConfig = (pruebaData, setFormData) => {
  const [testConfig, setTestConfig] = useState(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);

  useEffect(() => {
    const loadTestConfig = async () => {
      if (!pruebaData) {
        setIsLoadingTest(false);
        return;
      }

      try {
        setIsLoadingTest(true);

        let config = null;

        if (pruebaData.subPruebas && pruebaData.subPruebas.length > 0) {
          config = pruebaData;
        } else if (pruebaData._id) {
          config = await pruebasAPI.getById(pruebaData._id);
        }

        if (config) {
          setTestConfig(config);

          // Setear valores por defecto para subpruebas con opciones
          const defaults = {};
          config.subPruebas?.forEach((subPrueba) => {
            const tieneOpciones = subPrueba.valoresReferencia?.opciones?.length > 0;
            if (tieneOpciones) {
              defaults[subPrueba._id] = subPrueba.valoresReferencia.opciones[0].valor;
            }
          });

          setFormData(prev => ({ ...prev, ...defaults }));
        }
      } catch (error) {
        console.error('Error al cargar configuracion de prueba:', error);
        alert('Error al cargar la configuracion de la prueba');
      } finally {
        setIsLoadingTest(false);
      }
    };

    loadTestConfig();
  }, [pruebaData, setFormData]);

  return { testConfig, isLoadingTest };
};

export default useTestConfig;