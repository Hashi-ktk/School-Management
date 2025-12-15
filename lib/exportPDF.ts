import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export current page as PDF
 */
export async function exportPageAsPDF(
  elementId: string,
  filename: string = 'report.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
}

/**
 * Export grouping report with summary
 */
export async function exportGroupingReport(): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  await exportPageAsPDF('grouping-report', `class-grouping-${timestamp}.pdf`);
}

/**
 * Export analytics dashboard
 */
export async function exportAnalyticsDashboard(): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  await exportPageAsPDF('analytics-dashboard', `class-analytics-${timestamp}.pdf`);
}
