import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Genera el HTML completo listo para inyectar en iframe o ventana nueva.
// folio se usa solo en el titulo de la pagina.
const buildPrintHTML = (reportElement, folio, isMobileHeader = false) => {
  const baseStyles = `
    @page { size: A4; margin: 0.5in; }
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
  `;

  if (!isMobileHeader) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Reporte Medico${folio ? ' - ' + folio : ''}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>${baseStyles}</style>
  </head>
  <body>${reportElement.innerHTML}</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Medico${folio ? ' - ' + folio : ''}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
      ${baseStyles}
      body { padding-top: 70px; }
      @media print {
        .no-print { display: none !important; }
        body { padding-top: 0; }
      }
      .header-bar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex; justify-content: space-between; align-items: center;
      }
      .header-text { color: white; font-size: 16px; font-weight: 600; margin-right: 12px; }
      .print-button {
        background: #3b82f6; color: white; padding: 14px 24px;
        border-radius: 8px; font-weight: bold; border: none;
        font-size: 16px; cursor: pointer; margin-right: 8px;
      }
      .print-button:active { background: #2563eb; transform: scale(0.95); }
      .close-button {
        background: white; color: #ef4444; padding: 14px 28px;
        border-radius: 8px; font-weight: bold; border: none;
        font-size: 18px; cursor: pointer; flex-shrink: 0;
      }
      .close-button:active { transform: scale(0.95); background: #fee; }
    </style>
  </head>
  <body>
    <div class="header-bar no-print">
      <div class="header-text">Reporte Medico</div>
      <div style="display: flex; align-items: center;">
        <button onclick="window.print()" class="print-button">Imprimir</button>
        <button onclick="window.close()" class="close-button">Volver</button>
      </div>
    </div>
    ${reportElement.innerHTML}
  </body>
</html>`;
};

// Imprime el elemento usando iframe en PC y ventana nueva en movil.
// reportElement debe ser el nodo DOM del reporte ya renderizado.
export const printReportElement = (reportElement, folio = '') => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Permite las ventanas emergentes para imprimir el reporte');
      return;
    }
    printWindow.document.write(buildPrintHTML(reportElement, folio, true));
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  } else {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(buildPrintHTML(reportElement, folio, false));
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  }
};

// Genera un PDF a partir del elemento DOM del reporte y lo descarga.
// Usar solo en movil cuando se necesita descarga directa en lugar de imprimir.
export const downloadReportAsPDF = async (reportElement, fileName) => {
  const canvas = await html2canvas(reportElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    windowHeight: 1123,
    ignoreElements: (el) => el.tagName === 'IFRAME' || el.tagName === 'EMBED',
    onclone: (clonedDoc) => {
      Array.from(clonedDoc.getElementsByTagName('img')).forEach(img => {
        img.onerror = null;
      });
    }
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight);
  pdf.save(fileName);
};