/* eslint-disable no-unused-vars */
// src/utils/printUtils.js
// Función para imprimir reportes compatible con móvil y desktop

export const printReport = async (htmlContent, fileName = 'reporte') => {
  // Detectar si es dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // MÓVIL: Abrir en nueva ventana Y ejecutar print() inmediatamente
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Esperar a que se cargue completamente y luego abrir el panel de impresión
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus(); // Enfocar la ventana
          printWindow.print(); // Abrir panel de impresión
          
          // Cerrar la ventana después de imprimir o cancelar (opcional)
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 300); // Dar tiempo para que el contenido se renderice
      };
      
      return true;
    } else {
      alert('Por favor, permite las ventanas emergentes para imprimir el reporte.');
      return false;
    }
  } else {
    // DESKTOP: Usar iframe (método actual)
    return new Promise((resolve, reject) => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
              
              setTimeout(() => {
                document.body.removeChild(iframe);
                resolve(true);
              }, 100);
            } catch (error) {
              console.error('Error al imprimir:', error);
              document.body.removeChild(iframe);
              reject(error);
            }
          }, 250);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
};