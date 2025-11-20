import React, { useState } from 'react';
import { extractTextFromFile } from '../services/textExtractor';

export function TestExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResult('');
    setError(null);
    const f = e.target.files && e.target.files[0];
    setFile(f ?? null);
  };

  const runExtraction = async () => {
    if (!file) {
      setError('اختر ملفاً للاختبار');
      return;
    }
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const text = await extractTextFromFile(file);
      console.groupCollapsed('TestExtractor result');
      console.log('Extracted text length:', text.length);
      console.log('Preview:', text.slice(0, 1000));
      console.groupEnd();
      setResult(text);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium mb-4">Test: extractTextFromFile</h2>

      <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
      <div className="mt-4 flex gap-2">
        <button onClick={runExtraction} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded">
          {loading ? 'جارٍ الاستخراج...' : 'استخراج النص'}
        </button>
        <button onClick={() => { setFile(null); setResult(''); setError(null); }} className="px-4 py-2 bg-gray-200 rounded">
          إعادة تعيين
        </button>
      </div>

      {error && <div className="mt-4 text-red-600">خطأ: {error}</div>}

      {result !== '' && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">النص المستخرج (معاينة)</h3>
          <pre className="whitespace-pre-wrap max-h-80 overflow-auto p-4 bg-gray-50 border rounded text-sm">{result}</pre>
        </div>
      )}

      {result === '' && !error && !loading && <div className="mt-4 text-gray-500">لم يتم عرض نص بعد.</div>}
    </div>
  );
}

export default TestExtractor;