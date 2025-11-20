import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, GraduationCap, Clock, CheckCircle2 } from 'lucide-react';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Alert } from './ui/alert';

interface DashboardProps {}

interface RecentAnalysis {
  id: string;
  documentName: string;
  date: string;
  educationLevel: string;
  score: number;
}

const mockRecentAnalyses: RecentAnalysis[] = [
  {
    id: '1',
    documentName: 'مقدمة_في_الجبر.pdf',
    date: '2025-11-14',
    educationLevel: 'ثانوي',
    score: 85,
  },
  {
    id: '2',
    documentName: 'الأحياء_الخلايا.docx',
    date: '2025-11-13',
    educationLevel: 'متوسط',
    score: 78,
  },
  {
    id: '3',
    documentName: 'القراءة_والفهم.pdf',
    date: '2025-11-12',
    educationLevel: 'ابتدائي',
    score: 92,
  },
];

export function Dashboard(_: DashboardProps) {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setUploadedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedLevel && uploadedFile) {
      setIsAnalyzing(true);
      try {
        // Move analysis start logic here (extract text, call Gemini, persist and navigate)
        try {
          const { extractTextFromFile } = await import('../services/textExtractor');
          const extractedText = await extractTextFromFile(uploadedFile);
          const { analyzeWithGemini } = await import('../services/geminiApi');
          const geminiResult = await analyzeWithGemini(extractedText, selectedLevel);

          const analysisData = {
            documentName: uploadedFile.name,
            executiveSummary: geminiResult.executiveSummary,
            educationLevel: selectedLevel,
            overallScore: geminiResult.overallScore,
            uploadDate: new Date().toISOString(),
            linguisticAnalysis: geminiResult.linguisticAnalysis,
            semanticAnalysis: geminiResult.semanticAnalysis,
            bloomsTaxonomy: geminiResult.bloomsTaxonomy,
            contentOrganization: geminiResult.contentOrganization,
            strengths: geminiResult.strengths,
            weaknesses: geminiResult.weaknesses,
            recommendations: geminiResult.recommendations,
            keyFindings: geminiResult.keyFindings,
          };

          sessionStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
          navigate('/analysis', { state: { analysisData } });
        } catch (error) {
          console.error('Analysis error:', error);
          alert(`خطأ في التحليل: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        setIsAnalyzing(false);
      }
    }
  };

  const canAnalyze = selectedLevel && uploadedFile && !isAnalyzing;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* New Analysis Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <GraduationCap className="size-6" />
              تحليل جديد
            </CardTitle>
            <CardDescription>
              اختر المستوى التعليمي وقم بتحميل المستند لبدء التحليل
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Education Level Selection */}
            <div className="space-y-2">
              <Label htmlFor="education-level">اختر المستوى التعليمي المستهدف</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger id="education-level" className="w-full">
                  <SelectValue placeholder="اختر المستوى التعليمي..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="ثانوي">ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* File Upload Zone */}
            <div className="space-y-2">
              <Label>رفع المستند</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-12
                  transition-all duration-200 cursor-pointer
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Upload className="size-8 text-blue-600" />
                  </div>
                  
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="size-5" />
                        <span>{uploadedFile.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        انقر أو اسحب لاستبدال الملف
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-gray-700">
                          اسحب وأفلت المستند هنا أو <span className="text-blue-600">تصفح</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          يدعم: PDF، DOC، DOCX • الحد الأقصى للملف: 10 ميجابايت
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="size-4 ml-2 animate-spin" />
                  جاري تحليل المستند...
                </>
              ) : (
                'تحليل النص'
              )}
            </Button>
            
            {isAnalyzing && (
              <Alert
                type="info"
                message={"جاري معالجة المستند بواسطة الذكاء الاصطناعي. قد يستغرق هذا بضع لحظات..."}
                onClose={() => {}}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Recent Analyses Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">التحليلات الأخيرة</CardTitle>
            <CardDescription>
              عرض المستندات التي تم تحليلها مسبقاً
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {mockRecentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-white p-2 rounded">
                      <FileText className="size-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-gray-900">{analysis.documentName}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{analysis.date}</span>
                        <span>•</span>
                        <span>{analysis.educationLevel}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full ${getScoreColor(analysis.score)}`}>
                    <span>{analysis.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}