import { GoogleGenerativeAI } from '@google/generative-ai';
import * as mammoth from 'mammoth';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not configured.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromFile(file: File): Promise<string> {
  const lower = file.name.toLowerCase();

  try {
    // 1. PDF and Images
    if (
      lower.endsWith('.pdf') || 
      file.type === 'application/pdf' || 
      lower.endsWith('.png') || 
      lower.endsWith('.jpg') || 
      lower.endsWith('.jpeg') || 
      file.type.startsWith('image/')
    ) {
      const base64 = await fileToBase64(file);
      const prompt = "Extract all Arabic text clearly from this document. Return only clean text.";
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: file.type || (lower.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
          }
        }
      ]);
      const text = result.response.text();
      return cleanArabic(text);
    }

    // 2. TXT Files
    if (lower.endsWith('.txt') || file.type === 'text/plain') {
      const text = await file.text();
      return extractWithGeminiText(text);
    }

    // 3. DOCX Files
    if (lower.endsWith('.doc') || lower.endsWith('.docx') || file.type.includes('word')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return extractWithGeminiText(result.value);
    }

    throw new Error(`نوع الملف غير مدعوم: ${file.type}`);
  } catch (err: any) {
    console.error("Gemini extraction error:", err);
    throw new Error("فشل استخراج النص: " + err.message);
  }
}

async function extractWithGeminiText(rawText: string): Promise<string> {
  const prompt = "Extract all Arabic text clearly from this document. Return only clean text.\n\n" + rawText.substring(0, 30000);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return cleanArabic(text);
}

function cleanArabic(text: string): string {
  return text
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
