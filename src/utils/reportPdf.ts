import { toast } from 'sonner';
import type { AnalysisData } from '../App';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function listItems(items: string[]): string {
  if (!items.length) return '<p style="color:#6b7280">لا توجد بيانات</p>';
  return `<ul style="margin:0;padding-right:20px">${items.map((i) => `<li style="margin-bottom:6px">${escapeHtml(i)}</li>`).join('')}</ul>`;
}

function buildReportHtml(data: AnalysisData): string {
  const dateStr = new Date(data.uploadDate).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const recommendationsHtml = data.recommendations
    .map(
      (rec, i) => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:10px;background:#ffffff">
        <strong style="color:#111827">${i + 1}. ${escapeHtml(rec.title)}</strong>
        <span style="font-size:12px;color:#6b7280;margin-right:8px">(أولوية ${escapeHtml(rec.priority)})</span>
        <p style="margin:8px 0 0;font-size:14px;color:#374151">${escapeHtml(rec.description)}</p>
      </div>`,
    )
    .join('');

  const la = data.linguisticAnalysis;
  const sa = data.semanticAnalysis;
  const co = data.contentOrganization;

  return `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;line-height:1.6;color:#111827;background:#ffffff">
      <h1 style="color:#1e3a8a;font-size:22px;margin:0 0 8px">تقرير التحليل التفصيلي</h1>
      <p style="color:#6b7280;font-size:13px;margin:0 0 20px">تم الإنشاء في ${escapeHtml(dateStr)}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;color:#111827">
        <tr><td style="padding:6px;color:#6b7280">المستند</td><td style="padding:6px;color:#111827">${escapeHtml(data.documentName)}</td></tr>
        <tr><td style="padding:6px;color:#6b7280">المستوى التعليمي</td><td style="padding:6px;color:#111827">${escapeHtml(data.educationLevel)}</td></tr>
        <tr><td style="padding:6px;color:#6b7280">درجة الجودة</td><td style="padding:6px;color:#059669;font-weight:bold">${data.overallScore}/100</td></tr>
      </table>

      <h2 style="color:#1e3a8a;font-size:16px;border-bottom:2px solid #e5e7eb;padding-bottom:6px">الملخص التنفيذي</h2>
      <p style="font-size:14px;margin-bottom:24px;color:#374151">${escapeHtml(data.executiveSummary || '—')}</p>

      <h2 style="color:#1e3a8a;font-size:16px;border-bottom:2px solid #e5e7eb;padding-bottom:6px">التحليل اللغوي</h2>
      <p style="font-size:13px;color:#374151">التعقيد النحوي: ${la.grammaticalComplexity}/100 · التنوع الأسلوبي: ${la.stylisticDiversity}/100 · بساطة النص: ${la.textSimplicity}/100 · سهولة اللغة: ${la.languageEase}/100</p>

      <h2 style="color:#1e3a8a;font-size:16px;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:20px">التحليل الدلالي</h2>
      <p style="font-size:13px;color:#374151">الغموض: ${sa.ambiguity}/100 · التكرار: ${sa.repetition}/100 · الفجوة المفاهيمية: ${sa.conceptualGap}/100 · الروابط الدلالية: ${sa.semanticLinks}/100</p>

      <h2 style="color:#1e3a8a;font-size:16px;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:20px">تنظيم المحتوى</h2>
      <p style="font-size:13px;color:#374151">جودة الهيكل: ${co.structureQuality}/100 · تقدم التعلم: ${co.learningProgression}/100 · ملاءمة المحتوى: ${co.contentRelevance}/100</p>

      <h2 style="color:#059669;font-size:16px;margin-top:24px">نقاط القوة</h2>
      ${listItems(data.strengths)}

      <h2 style="color:#d97706;font-size:16px;margin-top:20px">مجالات التحسين</h2>
      ${listItems(data.weaknesses)}

      <h2 style="color:#1e3a8a;font-size:16px;margin-top:24px">التوصيات القابلة للتنفيذ</h2>
      ${recommendationsHtml || '<p style="color:#6b7280">لا توجد توصيات</p>'}
    </div>
  `;
}

function safeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').slice(0, 80) || 'report';
}

/**
 * Render report HTML in an isolated iframe so html2canvas never reads
 * the app's global CSS (oklch, color-mix, etc.) which it cannot parse.
 */
function mountIsolatedReportFrame(html: string): {
  body: HTMLElement;
  cleanup: () => void;
} {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'pdf-export');
  iframe.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;height:1px;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('تعذر إنشاء إطار التصدير');
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    }
    body { padding: 32px; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>${html}</body>
</html>`);
  doc.close();

  return {
    body: doc.body,
    cleanup: () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    },
  };
}

/** Download تقرير التحليل التفصيلي as PDF (same content as DetailedReport). */
export async function downloadAnalysisReportPdf(data: AnalysisData): Promise<void> {
  const toastId = toast.loading('جاري إعداد تقرير PDF وتنزيله...', {
    duration: Infinity,
  });

  let cleanupFrame: (() => void) | null = null;

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const { body, cleanup } = mountIsolatedReportFrame(buildReportHtml(data));
    cleanupFrame = cleanup;

    // Let the iframe layout settle before capture
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Capture only iframe content — no parent document styles
      windowWidth: body.scrollWidth,
      windowHeight: body.scrollHeight,
    });

    cleanup();
    cleanupFrame = null;

    const imgData = canvas.toDataURL('image/png');
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

    const filename = `تقرير-${safeFilename(data.documentName)}.pdf`;
    pdf.save(filename);

    toast.success('تم تنزيل التقرير بنجاح', { id: toastId });
  } catch (err) {
    console.error('PDF download failed:', err);
    toast.error('تعذر تنزيل التقرير. حاول مرة أخرى.', { id: toastId });
    throw err;
  } finally {
    cleanupFrame?.();
  }
}
