import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Header } from './Header';
import { AnalysisData } from '../App';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { DetailedReportContent } from './DetailedReportContent';
import { downloadReportElementAsPdf } from '../utils/reportPdf';

interface DetailedReportProps {
  analysisData: AnalysisData;
}

export function DetailedReport({ analysisData }: DetailedReportProps) {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = React.useState(false);

  const handleDownloadPDF = async () => {
    const element =
      reportRef.current?.querySelector('#detailed-report-pdf-root') ??
      reportRef.current;
    if (!element || !(element instanceof HTMLElement)) {
      return;
    }

    try {
      setPdfLoading(true);
      await downloadReportElementAsPdf(element, analysisData.documentName);
    } catch {
      // Error toast is shown inside downloadReportElementAsPdf
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between" data-pdf-exclude>
          <Button
            variant="ghost"
            onClick={() => navigate('/analysis')}
            className="gap-2"
          >
            <ArrowLeft className="size-4 scale-x-[-1]" />
            العودة إلى التحليل
          </Button>

          <Button
            onClick={() => void handleDownloadPDF()}
            disabled={pdfLoading}
            className="gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600"
          >
            <Download className="size-4" />
            {pdfLoading ? 'جاري التنزيل...' : 'تنزيل التقرير الكامل (PDF)'}
          </Button>
        </div>

        <div ref={reportRef}>
          <DetailedReportContent analysisData={analysisData} />
        </div>

        <div className="flex justify-center pt-4 pb-8" data-pdf-exclude>
          <Button
            onClick={() => void handleDownloadPDF()}
            disabled={pdfLoading}
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600"
          >
            <Download className="size-5" />
            {pdfLoading ? 'جاري التنزيل...' : 'تنزيل التقرير الكامل (PDF)'}
          </Button>
        </div>
      </main>
    </div>
  );
}
