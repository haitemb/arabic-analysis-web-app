import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({
  apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
});

export async function extractTextFromFile(file: File): Promise<string> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractWithMistral(file);
  }

  if (lower.endsWith('.doc') || lower.endsWith('.docx') || file.type.includes('word')) {
    return extractWithMistral(file);
  }

  throw new Error(`نوع الملف غير مدعوم: ${file.type}`);
}

async function extractWithMistral(file: File): Promise<string> {
  try {
    // 1. Upload file — pass the File object directly
    const upload = await mistral.files.upload({
      file,         // <-- just pass the File
      purpose: "ocr" // or "document"
    });

    // 2. Chat + file
    const extraction = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: "Extract all text from the uploaded document and return clean Arabic text only.",
        }
      ],
      files: [upload.id], // attach the uploaded file
    });

    // 3. Get result
    const text = extraction.choices?.[0]?.message?.content ?? "";

    return cleanArabic(text);

  } catch (err) {
    console.error("Mistral extraction error:", err);
    throw new Error("فشل استخراج النص عبر Mistral");
  }
}

function cleanArabic(text: string): string {
  return text
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
