import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, GraduationCap, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Header } from './Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { Alert } from './ui/alert';
import { supabase } from '../services/supabaseClient';
import { useEffect } from 'react';
import { showError } from '../utils/toast';

interface DashboardProps {}

interface RecentAnalysis {
  id: string;
  documentName: string;
  date: string;
  educationLevel: string;
  score: number;
}

export function Dashboard(_: DashboardProps) {
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchParams] = useSearchParams();
  const analysisIdFromQuery = searchParams.get('analysis');

  useEffect(() => {
    const fetchAnalyses = async () => {
      setLoadingAnalyses(true);

      if (!user) {
        setRecentAnalyses([]);
        setLoadingAnalyses(false);
        return;
      }

      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          filename,
          education_level,
          overall_score,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching analyses:', error);
      }

      const mapped =
        data?.map((a: any) => ({
          id: a.id,
          documentName: a.filename,
          date: new Date(a.created_at).toLocaleDateString('ar-DZ'),
          educationLevel: a.education_level,
          score: a.overall_score,
        })) ?? [];

      setRecentAnalyses(mapped);
      setLoadingAnalyses(false);
    };

    fetchAnalyses();
  }, [user]);

  useEffect(() => {
    const loadAnalysisFromSupabase = async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error loading analysis:', error);
          return;
        }

        if (!data) return;

        const mapped: RecentAnalysis = {
          id: data.id,
          documentName: data.filename ?? data.document_name ?? 'مستند',
          date: new Date(data.created_at).toLocaleDateString('ar-DZ'),
          educationLevel: data.education_level,
          score: data.overall_score ?? 0,
        };

        // also build full analysisData used by AnalysisResults/DetailedReport
        const analysisData = {
          documentName: data.filename ?? data.document_name ?? 'مستند',
          executiveSummary: data.executive_summary ?? data.executiveSummary ?? null,
          educationLevel: data.education_level,
          overallScore: data.overall_score ?? 0,
          uploadDate: data.created_at ?? new Date().toISOString(),
          linguisticAnalysis: data.linguistic_analysis ?? null,
          semanticAnalysis: data.semantic_analysis ?? null,
          bloomsTaxonomy: data.blooms_taxonomy ?? null,
          contentOrganization: data.content_organization ?? null,
          strengths: data.strengths ?? null,
          weaknesses: data.weaknesses ?? null,
          recommendations: data.recommendations ?? null,
          keyFindings: data.key_findings ?? data.keyFindings ?? null,
        };

        // prepend to recent analyses list
        setRecentAnalyses(prev => [mapped, ...prev.filter(a => a.id !== mapped.id)].slice(0, 10));

        // save to sessionStorage and navigate to the Analysis Results page so existing components render it
        try {
          sessionStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
          navigate('/analysis', { state: { analysisData } });
        } catch (e) {
          console.error('Error navigating to analysis page:', e);
        }
      } catch (err) {
        console.error('Error loading analysis:', err);
      }
    };

    if (analysisIdFromQuery) {
      loadAnalysisFromSupabase(analysisIdFromQuery);
    }
  }, [analysisIdFromQuery]);

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
      if (file.size > 5 * 1024 * 1024) {
        showError('حجم الملف يتجاوز 5 ميجابايت.');
        return;
      }
        // accept PDFs, Word docs and any image types
        if (
          file.type === 'application/pdf' ||
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type.startsWith('image/')
        ) {
          setUploadedFile(file);
        }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        showError('حجم الملف يتجاوز 5 ميجابايت.');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    if (selectedLevel && uploadedFile) {
      setIsAnalyzing(true);
      setLimitReached(false);

      try {
        // 1. CHECK USAGE BEFORE ANALYSIS
        if (user?.id) {
           const today = new Date();
           today.setHours(0,0,0,0);
           const { count, error: countError } = await supabase
             .from('analyses')
             .select('*', { count: 'exact', head: true })
             .eq('user_id', user.id)
             .gte('created_at', today.toISOString());
             
           if (countError) console.error("Error checking usage:", countError);

           if (count !== null && count >= 3) {
               setLimitReached(true);
               setIsAnalyzing(false);
               return;
           }
        }

        const { extractTextFromFile } = await import('../services/textExtractor');
        const { analyzeWithGemini } = await import('../services/geminiApi');

        const extractedText = await extractTextFromFile(uploadedFile);
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

        // === SAVE TO SUPABASE ===
const { data: inserted, error } = await supabase
  .from('analyses')
  .insert({
    user_id: user?.id,
    filename: uploadedFile.name,
    education_level: selectedLevel,
    overall_score: geminiResult.overallScore,
    executive_summary: analysisData.executiveSummary,
    linguistic_analysis: analysisData.linguisticAnalysis,
    semantic_analysis: analysisData.semanticAnalysis,
    blooms_taxonomy: analysisData.bloomsTaxonomy,
    content_organization: analysisData.contentOrganization,
    strengths: analysisData.strengths,
    weaknesses: analysisData.weaknesses,
    recommendations: analysisData.recommendations,
    key_findings: analysisData.keyFindings,
  })
  .select()
  .single();

if (error) {
  console.error('Error saving analysis:', error);
} else if (inserted) {
  // 4. INCREMENT USAGE ON SUCCESS
  if (user?.id) {
     await supabase.rpc('check_and_increment_usage', { uid: user.id });
  }

  // prepend to recent analyses
  const mapped: RecentAnalysis = {
    id: inserted.id,
    documentName: inserted.filename ?? analysisData.documentName,
    date: new Date(inserted.created_at ?? analysisData.uploadDate).toLocaleDateString('ar-DZ'),
    educationLevel: inserted.education_level ?? analysisData.educationLevel,
    score: inserted.overall_score ?? analysisData.overallScore,
  };

  setRecentAnalyses((prev) => [mapped, ...prev].slice(0, 10));
}


        // Save to session + navigate
        sessionStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
        navigate('/analysis', { state: { analysisData } });
      } catch (error) {
        console.error('Analysis failed:', error);
        showError('حدث خطأ أثناء التحليل');
      }

      setIsAnalyzing(false);
    }
  };

  const canAnalyze = selectedLevel && uploadedFile && !isAnalyzing;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  if (limitReached) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)' }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-2xl border-2 border-red-200 shadow-2xl p-8 text-center bg-white rounded-2xl mt-12">
            <div className="flex justify-center mb-6">
              <div className="bg-red-50 p-6 rounded-full border border-red-100">
                <AlertTriangle className="size-16 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-3xl text-red-700 mb-6 font-bold leading-relaxed">
              لقد استهلكت جميع المحاولات المجانية اليوم 🎯
            </CardTitle>
            <CardDescription className="text-xl text-gray-600 mb-8 leading-relaxed">
              يمكنك العودة غداً للحصول على محاولات جديدة
              <br />
              <span className="text-emerald-600 font-semibold mt-4 block">الباقة الاحترافية قريباً 🚀</span>
            </CardDescription>
            <Button 
              onClick={() => setLimitReached(false)} 
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-lg px-8 py-6 rounded-xl"
            >
              العودة للوحة التحكم
            </Button>
          </Card>
        </main>
      </div>
    );
  }

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
                  accept=".pdf,.doc,.docx,image/*"
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
                          يدعم: PDF، DOC، DOCX، الصور (PNG، JPG، GIF) • الحد الأقصى للملف: 5 ميجابايت
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
              {loadingAnalyses ? (
                <p className="text-center text-gray-500 py-4">جاري التحميل...</p>
              ) : recentAnalyses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد تحليلات حتى الآن</p>
              ) : (
                recentAnalyses.map((analysis: RecentAnalysis) => {
                  return (
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
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}