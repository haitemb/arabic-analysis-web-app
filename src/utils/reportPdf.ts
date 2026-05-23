import { createRoot } from 'react-dom/client';
import React from 'react';
import { toast } from 'sonner';
import type { AnalysisData } from '../App';
import {
  DetailedReportContent,
  DETAILED_REPORT_PDF_ROOT_ID,
} from '../components/DetailedReportContent';

/** Single toast slot so loading/success/error replace each other instead of stacking. */
const PDF_EXPORT_TOAST_ID = 'pdf-export';
const PDF_TOAST_DURATION_MS = 5000;

function safeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').slice(0, 80) || 'report';
}

function showPdfLoading(): void {
  toast.dismiss(PDF_EXPORT_TOAST_ID);
  toast.loading('جاري إعداد تقرير PDF وتنزيله...', { id: PDF_EXPORT_TOAST_ID });
}

function showPdfSuccess(): void {
  toast.success('تم تنزيل التقرير بنجاح', {
    id: PDF_EXPORT_TOAST_ID,
    duration: PDF_TOAST_DURATION_MS,
  });
}

function showPdfError(): void {
  toast.error('تعذر تنزيل التقرير. حاول مرة أخرى.', {
    id: PDF_EXPORT_TOAST_ID,
    duration: PDF_TOAST_DURATION_MS,
  });
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * Capture DOM via html-to-image (browser SVG render path).
 * Unlike html2canvas, this does not parse oklch/color-mix from stylesheets.
 */
async function elementToCanvas(sourceElement: HTMLElement): Promise<HTMLCanvasElement> {
  const { toCanvas } = await import('html-to-image');

  return toCanvas(sourceElement, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    skipAutoScale: false,
    filter: (node) => {
      if (node instanceof HTMLElement && node.hasAttribute('data-pdf-exclude')) {
        return false;
      }
      return true;
    },
  });
}

async function canvasToPdfFile(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

/**
 * Capture a live report DOM node (same UI as DetailedReport) and download as PDF.
 */
export async function downloadReportElementAsPdf(
  element: HTMLElement,
  documentName: string,
): Promise<void> {
  showPdfLoading();

  try {
    const previousScrollY = window.scrollY;
    const isOffscreenExport = element.closest('[data-pdf-export-host]');
    if (!isOffscreenExport) {
      element.scrollIntoView({ block: 'start' });
    }
    await waitForLayout();

    const canvas = await elementToCanvas(element);
    const filename = `تقرير-${safeFilename(documentName)}.pdf`;
    await canvasToPdfFile(canvas, filename);

    window.scrollTo(0, previousScrollY);
    showPdfSuccess();
  } catch (err) {
    console.error('PDF download failed:', err);
    showPdfError();
    throw err;
  }
}

/** Mount off-screen report UI (History export) — same component as DetailedReport. */
async function mountReportContentOffscreen(
  data: AnalysisData,
): Promise<{ element: HTMLElement; unmount: () => void }> {
  const host = document.createElement('div');
  host.setAttribute('data-pdf-export-host', 'true');
  host.style.cssText =
    'position:fixed;left:-12000px;top:0;width:1024px;pointer-events:none;overflow:visible;background:#ffffff;';
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(
    React.createElement(
      'div',
      { className: 'bg-white px-4 py-8', dir: 'rtl' },
      React.createElement(DetailedReportContent, { analysisData: data }),
    ),
  );

  await waitForLayout();
  await new Promise((r) => setTimeout(r, 150));

  const element = host.querySelector(`#${DETAILED_REPORT_PDF_ROOT_ID}`) as HTMLElement | null;
  if (!element) {
    root.unmount();
    host.remove();
    throw new Error('تعذر تحضير واجهة التقرير للتصدير');
  }

  return {
    element,
    unmount: () => {
      root.unmount();
      host.remove();
    },
  };
}

/** Download PDF from analysis data (History) using the same UI component as DetailedReport. */
export async function downloadAnalysisReportPdf(data: AnalysisData): Promise<void> {
  const { element, unmount } = await mountReportContentOffscreen(data);
  try {
    await downloadReportElementAsPdf(element, data.documentName);
  } finally {
    unmount();
  }
}
