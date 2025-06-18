import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF from a HTML element
 * @param element The HTML element to convert to PDF
 * @param filename The name of the PDF file
 * @param options Additional options for PDF generation
 * @returns Promise<void>
 */
export const generatePDF = async (
  element: HTMLElement,
  filename: string = 'document.pdf',
  options: {
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    format?: 'a4' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    scale?: number;
    quality?: number;
    pagebreak?: boolean;
  } = {}
) => {
  if (!element) return;

  const {
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    format = 'a4',
    orientation = 'portrait',
    scale = 2,
    quality = 2,
    pagebreak = true
  } = options;

  // Set up dimensions
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: quality,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdfWidth - margin.left - margin.right;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If we need to handle page breaks for long content
    if (pagebreak && imgHeight > pdfHeight - margin.top - margin.bottom) {
      // Calculate the number of pages needed
      let heightLeft = canvas.height;
      let position = 0;
      let page = 1;

      // First page
      pdf.addImage(
        imgData, 
        'PNG', 
        margin.left, 
        margin.top, 
        imgWidth, 
        imgHeight
      );

      heightLeft -= pdfHeight;
      
      // Add more pages if needed
      while (heightLeft > 0) {
        position += pdfHeight;
        pdf.addPage();
        pdf.addImage(
          imgData, 
          'PNG', 
          margin.left, 
          margin.top - position, 
          imgWidth, 
          imgHeight
        );
        heightLeft -= pdfHeight;
        page++;
      }
    } else {
      // For single page content
      pdf.addImage(
        imgData, 
        'PNG', 
        margin.left, 
        margin.top, 
        imgWidth, 
        imgHeight
      );
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

/**
 * Adds signature and date to the PDF content
 * @param signature The signature text/image
 * @param date The date of signing
 */
export const addSignature = (pdf: jsPDF, signature: string, date: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFontSize(12);
  pdf.text('E-Signature:', 10, pdf.internal.pageSize.getHeight() - 30);
  pdf.text(signature, 50, pdf.internal.pageSize.getHeight() - 30);
  
  pdf.text('Date:', 10, pdf.internal.pageSize.getHeight() - 20);
  pdf.text(date, 50, pdf.internal.pageSize.getHeight() - 20);
  
  return pdf;
};
