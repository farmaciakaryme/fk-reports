// src/utils/printUtils.js
// Función para imprimir reportes compatible con móvil y desktop

export const printReport = async (htmlContent, fileName = 'reporte') => {
  // Detectar si es dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // MÓVIL: Abrir en nueva ventana
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      return true;
    } else {
      // Si falla, descargar como HTML
      return downloadAsHTML(htmlContent, fileName);
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

// Función auxiliar para descargar como HTML
const downloadAsHTML = (htmlContent, fileName) => {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error al descargar:', error);
    return false;
  }
};