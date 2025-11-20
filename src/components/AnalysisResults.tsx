import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Header } from './Header';
import { AnalysisData } from '../App';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ArrowLeft, TrendingUp, Brain, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { GaugeChart } from './charts/GaugeChart';
import { RadarChart as CustomRadarChart } from './charts/RadarChart';
import { HorizontalBarChart } from './charts/HorizontalBarChart';
import { ScoreCard } from './charts/ScoreCard';

interface AnalysisResultsProps {
  analysisData: AnalysisData;
}

export function AnalysisResults({ analysisData }: AnalysisResultsProps) {
  const navigate = useNavigate();
  
  // Transform linguistic analysis data
  const linguisticData = [
    { metric: 'التعقيد النحوي', value: analysisData.linguisticAnalysis.grammaticalComplexity },
    { metric: 'التنوع الأسلوبي', value: analysisData.linguisticAnalysis.stylisticDiversity },
    { metric: 'بساطة النص', value: analysisData.linguisticAnalysis.textSimplicity },
    { metric: 'سهولة اللغة', value: analysisData.linguisticAnalysis.languageEase },
  ];

  // Transform semantic analysis data (invert ambiguity, repetition, conceptualGap since lower is better)
  const semanticData = [
    { name: 'الغموض', value: 100 - analysisData.semanticAnalysis.ambiguity },
    { name: 'التكرار', value: 100 - analysisData.semanticAnalysis.repetition },
    { name: 'الفجوة المفاهيمية', value: 100 - analysisData.semanticAnalysis.conceptualGap },
    { name: 'الروابط الدلالية', value: analysisData.semanticAnalysis.semanticLinks },
  ];

  // Transform Bloom's taxonomy data
  const bloomsData = [
    { category: 'الإبداع', value: analysisData.bloomsTaxonomy.creativity },
    { category: 'التقييم', value: analysisData.bloomsTaxonomy.evaluation },
    { category: 'التحليل', value: analysisData.bloomsTaxonomy.analysis },
    { category: 'التطبيق', value: analysisData.bloomsTaxonomy.application },
    { category: 'الفهم', value: analysisData.bloomsTaxonomy.understanding },
    { category: 'التذكر', value: analysisData.bloomsTaxonomy.remembering },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number): 'good' | 'average' | 'poor' => {
    if (score >= 80) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
  };

  return (
    <div className="min-h-screen">
  <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="size-4 scale-x-[-1]" />
          العودة إلى لوحة التحكم
        </Button>

        {/* Document Overview */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FileText className="size-4" />
                  <span className="text-sm">تحليل المستند</span>
                </div>
                <h2 className="text-blue-900 mb-2">{analysisData.documentName}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <span>المستوى التعليمي: <strong>{analysisData.educationLevel}</strong></span>
                  <span>•</span>
                  <span>تاريخ التحليل: {new Date(analysisData.uploadDate).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-2">درجة الجودة الإجمالية</div>
                <GaugeChart score={analysisData.overallScore} size={140} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Tabs */}
        <Tabs defaultValue="linguistic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="linguistic" className="gap-2">
              <TrendingUp className="size-4" />
              التحليل اللغوي
            </TabsTrigger>
            <TabsTrigger value="semantic" className="gap-2">
              <Brain className="size-4" />
              التحليل الدلالي
            </TabsTrigger>
            <TabsTrigger value="pedagogical" className="gap-2">
              <BookOpen className="size-4" />
              المعايير التربوية
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Linguistic Analysis */}
          <TabsContent value="linguistic" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-900">التحليل البنيوي والنحوي</CardTitle>
                <CardDescription>
                  تحليل بنية الجمل والأسلوب وتعقيد اللغة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="mb-4 text-gray-700">درجات المقاييس</h3>
                    <div className="space-y-4">
                      {linguisticData.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-700">{item.metric}</span>
                            <span className={`${getScoreColor(item.value)}`}>
                              {item.value}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                item.value >= 80 ? 'bg-emerald-500' :
                                item.value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="mb-4 text-gray-700">التمثيل البصري</h3>
                    <div className="flex justify-center">
                      <CustomRadarChart data={linguisticData} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CheckCircle className="size-5 text-emerald-600" />
                  النتائج الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  {analysisData.keyFindings.linguistic.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {index % 2 === 0 ? (
                        <CheckCircle className="size-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Semantic Analysis */}
          <TabsContent value="semantic" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-900">الاتساق والوضوح</CardTitle>
                <CardDescription>
                  قياس وضوح النص واستخدام المصطلحات والاتساق المفاهيمي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <ScoreCard
                    title="كشف الغموض"
                    score={100 - analysisData.semanticAnalysis.ambiguity}
                    description={analysisData.semanticAnalysis.ambiguity < 30 ? "غموض منخفض" : analysisData.semanticAnalysis.ambiguity < 60 ? "غموض معتدل" : "غموض عالي"}
                    status={getScoreStatus(100 - analysisData.semanticAnalysis.ambiguity)}
                  />
                  <ScoreCard
                    title="تكرار المصطلحات"
                    score={100 - analysisData.semanticAnalysis.repetition}
                    description={analysisData.semanticAnalysis.repetition < 30 ? "تكرار منخفض" : analysisData.semanticAnalysis.repetition < 60 ? "تكرار معتدل" : "تكرار عالي"}
                    status={getScoreStatus(100 - analysisData.semanticAnalysis.repetition)}
                  />
                  <ScoreCard
                    title="الفجوة المفاهيمية"
                    score={100 - analysisData.semanticAnalysis.conceptualGap}
                    description={analysisData.semanticAnalysis.conceptualGap < 30 ? "متصل بشكل جيد" : analysisData.semanticAnalysis.conceptualGap < 60 ? "اتصال معتدل" : "فجوات كبيرة"}
                    status={getScoreStatus(100 - analysisData.semanticAnalysis.conceptualGap)}
                  />
                  <ScoreCard
                    title="الروابط الدلالية"
                    score={analysisData.semanticAnalysis.semanticLinks}
                    description={analysisData.semanticAnalysis.semanticLinks >= 80 ? "روابط قوية" : analysisData.semanticAnalysis.semanticLinks >= 60 ? "روابط جيدة" : "روابط ضعيفة"}
                    status={getScoreStatus(analysisData.semanticAnalysis.semanticLinks)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CheckCircle className="size-5 text-emerald-600" />
                  النتائج الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  {analysisData.keyFindings.semantic.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {index % 2 === 0 ? (
                        <CheckCircle className="size-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Pedagogical Standards */}
          <TabsContent value="pedagogical" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-900">توزيع تصنيف بلوم</CardTitle>
                <CardDescription>
                  توزيع أهداف التعلم عبر المستويات المعرفية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HorizontalBarChart data={bloomsData} />
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>التفسير:</strong> يُظهر المحتوى توزيعاً متوازناً عبر 
                    المستويات المعرفية، مع التركيز المناسب على الفهم والتذكر 
                    للمستوى التعليمي {analysisData.educationLevel}.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-900">تنظيم المحتوى</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ScoreCard
                    title="جودة الهيكل"
                    score={analysisData.contentOrganization.structureQuality}
                    description={analysisData.contentOrganization.structureQuality >= 80 ? "منظم بشكل جيد" : analysisData.contentOrganization.structureQuality >= 60 ? "منظم بشكل معتدل" : "يحتاج تحسين"}
                    status={getScoreStatus(analysisData.contentOrganization.structureQuality)}
                  />
                  <ScoreCard
                    title="تقدم التعلم"
                    score={analysisData.contentOrganization.learningProgression}
                    description={analysisData.contentOrganization.learningProgression >= 80 ? "تدفق منطقي" : analysisData.contentOrganization.learningProgression >= 60 ? "تدفق معتدل" : "يحتاج تحسين"}
                    status={getScoreStatus(analysisData.contentOrganization.learningProgression)}
                  />
                  <ScoreCard
                    title="ملاءمة المحتوى"
                    score={analysisData.contentOrganization.contentRelevance}
                    description={analysisData.contentOrganization.contentRelevance >= 80 ? "ذو صلة عالية" : analysisData.contentOrganization.contentRelevance >= 60 ? "صلة معتدلة" : "صلة منخفضة"}
                    status={getScoreStatus(analysisData.contentOrganization.contentRelevance)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CheckCircle className="size-5 text-emerald-600" />
                  النتائج الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  {analysisData.keyFindings.pedagogical.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {index % 2 === 0 ? (
                        <CheckCircle className="size-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Report Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => {
              // Update sessionStorage to persist data
              sessionStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
              navigate('/report', { state: { analysisData } });
            }}
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600"
          >
            <Download className="size-5" />
            عرض التقرير التفصيلي والتوصيات
          </Button>
        </div>
      </main>
    </div>
  );
}