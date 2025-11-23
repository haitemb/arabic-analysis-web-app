import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Header } from './Header';
import { AnalysisData } from '../App';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Separator } from './ui/separator';

interface DetailedReportProps {
  analysisData: AnalysisData;
}

export function DetailedReport({ analysisData }: DetailedReportProps) {
  const navigate = useNavigate();
  const handleDownloadPDF = () => {
    alert('سيتم تنزيل ملف PDF هنا');
  };
 
  const strengths = analysisData.strengths;
  const weaknesses = analysisData.weaknesses;
  const recommendations = analysisData.recommendations;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/analysis')}
            className="gap-2"
          >
            <ArrowLeft className="size-4 scale-x-[-1]" />
            العودة إلى التحليل
          </Button>
          
          <Button 
            onClick={handleDownloadPDF}
            className="gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600"
          >
            <Download className="size-4" />
            تنزيل التقرير الكامل (PDF)
          </Button>
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-emerald-50 p-20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white p-2 rounded-lg">
                <FileText className="size-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">تقرير التحليل التفصيلي</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  تم الإنشاء في {new Date(analysisData.uploadDate).toLocaleDateString('ar-SA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">المستند:</span>
                <p className="text-gray-900 mt-1">{analysisData.documentName}</p>
              </div>
              <div>
                <span className="text-gray-600">المستوى التعليمي:</span>
                <p className="text-gray-900 mt-1">{analysisData.educationLevel}</p>
              </div>
              <div>
                <span className="text-gray-600">درجة الجودة الإجمالية:</span>
                <p className="text-emerald-600 mt-1">{analysisData.overallScore}/100</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">الملخص التنفيذي</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {analysisData.executiveSummary }
            </p>

  
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">تفصيل المقاييس التفصيلي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-gray-900">التحليل اللغوي</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">التعقيد النحوي</p>
                  <p className="text-gray-900">
                    {analysisData.linguisticAnalysis.grammaticalComplexity}/100 - تعقيد معتدل مع بعض الهياكل المتقدمة
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">التنوع الأسلوبي</p>
                  <p className="text-gray-900">
                    {analysisData.linguisticAnalysis.stylisticDiversity}/100 - تنوع جيد مع مجال للتحسين
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">بساطة النص</p>
                  <p className="text-gray-900">
                    {analysisData.linguisticAnalysis.textSimplicity}/100 - يمكن الوصول إليه بشكل مناسب للمستوى المستهدف
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">سهولة اللغة</p>
                  <p className="text-gray-900">
                    {analysisData.linguisticAnalysis.languageEase}/100 - قابل للقراءة بشكل عام مع تحديات طفيفة
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-gray-900">التحليل الدلالي</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">كشف الغموض</p>
                  <p className="text-gray-900">
                    {100 - analysisData.semanticAnalysis.ambiguity}/100 - 
                    {analysisData.semanticAnalysis.ambiguity < 30 ? "الحد الأدنى من الغموض المكتشف" : analysisData.semanticAnalysis.ambiguity < 60 ? "غموض معتدل" : "غموض عالي"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">تكرار المصطلحات</p>
                  <p className="text-gray-900">
                    {100 - analysisData.semanticAnalysis.repetition}/100 - 
                    {analysisData.semanticAnalysis.repetition < 30 ? "تكرار منخفض" : analysisData.semanticAnalysis.repetition < 60 ? "تكرار معتدل" : "تكرار عالي"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">الفجوة المفاهيمية</p>
                  <p className="text-gray-900">
                    {100 - analysisData.semanticAnalysis.conceptualGap}/100 - 
                    {analysisData.semanticAnalysis.conceptualGap < 30 ? "استمرارية مفاهيمية قوية" : analysisData.semanticAnalysis.conceptualGap < 60 ? "استمرارية معتدلة" : "فجوات كبيرة"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">الروابط الدلالية</p>
                  <p className="text-gray-900">
                    {analysisData.semanticAnalysis.semanticLinks}/100 - 
                    {analysisData.semanticAnalysis.semanticLinks >= 80 ? "أفكار ومفاهيم متصلة بشكل جيد" : analysisData.semanticAnalysis.semanticLinks >= 60 ? "روابط جيدة" : "روابط ضعيفة"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-gray-900">المعايير التربوية</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">جودة الهيكل</p>
                  <p className="text-gray-900">
                    {analysisData.contentOrganization.structureQuality}/100 - 
                    {
                      analysisData.contentOrganization.structureQuality >= 80 ? "محتوى منظم بشكل جيد" : analysisData.contentOrganization.structureQuality >= 60 ? "منظم بشكل معتدل" : "يحتاج تحسين"
                    }
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">تقدم التعلم</p>
                  <p className="text-gray-900">
                    {analysisData.contentOrganization.learningProgression}/100 - 
                    {
                      analysisData.contentOrganization.learningProgression >= 80 ? "تدفق منطقي للمفاهيم" : analysisData.contentOrganization.learningProgression >= 60 ? "تدفق معتدل" : "يحتاج تحسين"
                    }
                  </p>
                </div>
                <div className="p-3	bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">ملاءمة المحتوى</p>
                  <p className="text-gray-900">
                    {analysisData.contentOrganization.contentRelevance}/100 - 
                    {
                      analysisData.contentOrganization.contentRelevance >= 80 ? "ذو صلة عالية بالأهداف" : analysisData.contentOrganization.contentRelevance >= 60 ? "صلة معتدلة" : "صلة منخفضة"
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="size-5" />
                نقاط القوة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="size-5" />
                مجالات التحسين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertTriangle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="size-6 text-amber-500" />
              التوصيات القابلة للتنفيذ
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              اقتراحات ملموسة لتحسين الجودة التعليمية وفعالية المحتوى الخاص بك
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-gray-900">
                      {index + 1}. {rec.title}
                    </h4>
                    <span className={`
                      px-2 py-1 rounded text-xs whitespace-nowrap mr-2
                      ${rec.priority === 'عالية' ? 'bg-red-100 text-red-700' : ''}
                      ${rec.priority === 'متوسطة' ? 'bg-amber-100 text-amber-700' : ''}
                      ${rec.priority === 'منخفضة' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                      أولوية {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4 pb-8">
          <Button 
            onClick={handleDownloadPDF}
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600"
          >
            <Download className="size-5" />
            تنزيل التقرير الكامل (PDF)
          </Button>
        </div>
      </main>
    </div>
  );
}
