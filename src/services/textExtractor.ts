import mammoth from 'mammoth';
import {
  GlobalWorkerOptions,
  getDocument,
  PDFDocumentProxy,
  TextContent,
  version
} from 'pdfjs-dist/legacy/build/pdf';

// Recommended worker version for stability
GlobalWorkerOptions.workerSrc =
   `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    } else if (name.endsWith('.doc') || name.endsWith('.docx') || file.type.includes('word')) {
      return await extractTextFromDOC(file);
    } else {
      throw new Error(`نوع الملف غير مدعوم: ${file.type}. يرجى رفع ملف PDF أو Word.`);
    }
  } catch (err: any) {
    console.error('Error in extractTextFromFile:', err);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                            PDF TEXT EXTRACTION                              */
/* -------------------------------------------------------------------------- */

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const pdf: PDFDocumentProxy = await getDocument({ data: uint8 }).promise;

    let text = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const txt: TextContent = await page.getTextContent({ normalizeWhitespace: false });

        const items = txt.items as any[];
        const pageText = combineArabicPDFItems(items);

        if (pageText.trim().length > 20) {
          text += pageText + '\n\n';
        } else {
          // Try OCR if selectable text is too poor
          const canvas = await renderPageToCanvas(page, 3);
          const ocrApiKey = (import.meta as any).env?.VITE_OCR_SPACE_API_KEY;
          if (ocrApiKey) {
            try {
              const ocrResult = await ocrSpaceRecognizeCanvas(canvas, ocrApiKey);
              if (ocrResult.trim()) text += ocrResult + '\n\n';
            } catch (e) {
              console.warn("OCR failed:", e);
            }
          }
        }
      } catch (err) {
        console.warn(`Page ${pageNum} extraction error`, err);
      }
    }

    return finalizeArabicText(text);
  } catch (err: any) {
    console.error('PDF extraction error:', err);
    throw new Error(`فشل في استخراج النص من PDF: ${err?.message ?? err}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 OCR SPACE                                   */
/* -------------------------------------------------------------------------- */

async function renderPageToCanvas(page: any, scale = 2): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas context error");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas;
}

async function ocrSpaceRecognizeCanvas(canvas: HTMLCanvasElement, apiKey: string): Promise<string> {
  const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

  const form = new FormData();
  form.append('apikey', apiKey);
  form.append('language', 'ara');
  form.append('OCREngine', '2');
  form.append('base64Image', `data:image/png;base64,${base64}`);

  const response = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: form });
  const json = await response.json();

  if (json.IsErroredOnProcessing) throw new Error(json.ErrorMessage);

  return json.ParsedResults?.map((p: any) => p.ParsedText).join('\n') ?? '';
}

/* -------------------------------------------------------------------------- */
/*                              WORD (.DOCX)                                   */
/* -------------------------------------------------------------------------- */

async function extractTextFromDOC(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return finalizeArabicText(result.value ?? '');
}

/* -------------------------------------------------------------------------- */
/*                         PDF.js Arabic Text Fixer                            */
/* -------------------------------------------------------------------------- */

function combineArabicPDFItems(items: any[]): string {
  if (!items || items.length === 0) return '';

  const lines: Record<number, { x: number; str: string }[]> = {};

  for (const it of items) {
    const tr = it.transform || [];
    const y = Math.round(tr[5] || 0);
    const x = Math.round(tr[4] || 0);
    const str = it.str || '';

    if (!lines[y]) lines[y] = [];
    lines[y].push({ x, str });
  }

  const sortedYs = Object.keys(lines)
    .map(Number)
    .sort((a, b) => b - a);

  const arabicRegex = /[\u0600-\u06FF]/;

  const mergedLines = sortedYs.map((y) => {
    const parts = lines[y];
    const combined = parts.map(p => p.str).join(' ');

    const isArabic = arabicRegex.test(combined);

    parts.sort((a, b) => (isArabic ? b.x - a.x : a.x - b.x));

    return parts.map(p => p.str).join(' ');
  });

  return mergedLines.join('\n');
}

/* -------------------------------------------------------------------------- */
/*                       Arabic Text Clean & Normalize                         */
/* -------------------------------------------------------------------------- */

function finalizeArabicText(text: string): string {
  if (!text) return '';

  let t = text.replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ');
  t = t.replace(/\n{3,}/g, '\n\n').trim();

  // Auto-fix OCR/PDF mis-shapes (very common)
  t = t
    .replace(/يف/g, 'في')
    .replace(/حتليل/g, 'تحليل')
    .replace(/حيويها/g, 'يحتويها')
    .replace(/ا ملعنى/g, 'المعنى')
    .replace(/اخرتاع/g, 'اختراع')
    .replace(/املعىن/g, 'المعنى')
    .replace(/رتكييب/g, 'تركيب')
    .replace(/اجلوانب/g, 'الجوانب');

  return t;
}
