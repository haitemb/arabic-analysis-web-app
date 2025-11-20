import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Header } from './Header';
import { FileText, Search, Filter, Calendar, TrendingUp, Download, Eye, Trash2, Star } from 'lucide-react';
import { AlgerianPattern } from './AlgerianPattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface HistoryPageProps {}

interface Analysis {
  id: string;
  documentName: string;
  date: string;
  educationLevel: string;
  score: number;
  status: 'مكتمل' | 'قيد المعالجة' | 'فشل';
  category: string;
  favorite: boolean;
}

const mockAnalyses: Analysis[] = [
  {
    id: '1',
    documentName: 'مقدمة_في_الجبر_المتقدم.pdf',
    date: '2025-11-14',
    educationLevel: 'ثانوي',
    score: 92,
    status: 'مكتمل',
    category: 'رياضيات',
    favorite: true,
  },
  {
    id: '2',
    documentName: 'الأحياء_الخلايا_والأنسجة.docx',
    date: '2025-11-13',
    educationLevel: 'متوسط',
    score: 78,
    status: 'مكتمل',
    category: 'علوم',
    favorite: false,
  },
  {
    id: '3',
    documentName: 'القراءة_والفهم_المستوى_الأول.pdf',
    date: '2025-11-12',
    educationLevel: 'ابتدائي',
    score: 88,
    status: 'مكتمل',
    category: 'لغة عربية',
    favorite: true,
  },
  {
    id: '4',
    documentName: 'تاريخ_الجزائر_المعاصر.pdf',
    date: '2025-11-10',
    educationLevel: 'ثانوي',
    score: 85,
    status: 'مكتمل',
    category: 'تاريخ',
    favorite: false,
  },
  {
    id: '5',
    documentName: 'الفيزياء_الكهرباء_والمغناطيسية.docx',
    date: '2025-11-08',
    educationLevel: 'ثانوي',
    score: 81,
    status: 'مكتمل',
    category: 'علوم',
    favorite: false,
  },
  {
    id: '6',
    documentName: 'الجغرافيا_موارد_الجزائر.pdf',
    date: '2025-11-05',
    educationLevel: 'متوسط',
    score: 76,
    status: 'مكتمل',
    category: 'جغرافيا',
    favorite: false,
  },
];

export function HistoryPage(_: HistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('الكل');
  const [filterCategory, setFilterCategory] = useState('الكل');
  const [analyses, setAnalyses] = useState(mockAnalyses);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const toggleFavorite = (id: string) => {
    setAnalyses(analyses.map(a => 
      a.id === id ? { ...a, favorite: !a.favorite } : a
    ));
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         analysis.category.includes(searchQuery);
    const matchesLevel = filterLevel === 'الكل' || analysis.educationLevel === filterLevel;
    const matchesCategory = filterCategory === 'الكل' || analysis.category === filterCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const stats = {
    total: analyses.length,
    thisMonth: analyses.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length,
    avgScore: Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length),
    favorites: analyses.filter(a => a.favorite).length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)' }}>
  <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header with Algerian Pattern */}
        <div className="relative">
          <Card className="border-2 border-emerald-600/20 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-emerald-600/5 via-white/50 to-red-600/5" />
            <AlgerianPattern className="absolute bottom-0 left-0 w-96 h-96 text-emerald-600 opacity-50" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <FileText className="size-6 text-emerald-600" />
                سجل التحليلات
              </CardTitle>
              <CardDescription>
                عرض وإدارة جميع تحليلاتك السابقة
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 mb-1">إجمالي التحليلات</p>
                  <p className="text-3xl text-emerald-600">{stats.total}</p>
                </div>
                <FileText className="size-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">هذا الشهر</p>
                  <p className="text-3xl text-blue-600">{stats.thisMonth}</p>
                </div>
                <Calendar className="size-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 mb-1">متوسط الجودة</p>
                  <p className="text-3xl text-amber-600">{stats.avgScore}/100</p>
                </div>
                <TrendingUp className="size-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 mb-1">المفضلة</p>
                  <p className="text-3xl text-red-600">{stats.favorites}</p>
                </div>
                <Star className="size-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 border-emerald-600/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="البحث في التحليلات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 border-emerald-300 focus:border-emerald-500"
                />
              </div>
              
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="border-emerald-300">
                  <SelectValue placeholder="المستوى التعليمي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع المستويات</SelectItem>
                  <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="ثانوي">ثانوي</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="border-emerald-300">
                  <SelectValue placeholder="المادة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع المواد</SelectItem>
                  <SelectItem value="رياضيات">رياضيات</SelectItem>
                  <SelectItem value="علوم">علوم</SelectItem>
                  <SelectItem value="لغة عربية">لغة عربية</SelectItem>
                  <SelectItem value="تاريخ">تاريخ</SelectItem>
                  <SelectItem value="جغرافيا">جغرافيا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analyses List */}
        <Card className="border-2 border-emerald-600/20 shadow-xl">
          <CardHeader className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-emerald-600 via-white to-red-600" />
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">التحليلات</CardTitle>
                <CardDescription>
                  عرض {filteredAnalyses.length} من {analyses.length} تحليل
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-l from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded-lg">
                      <FileText className="size-6 text-emerald-700" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-900">{analysis.documentName}</p>
                        {analysis.favorite && (
                          <Star className="size-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(analysis.date).toLocaleDateString('ar-SA')}
                        </span>
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                          {analysis.educationLevel}
                        </Badge>
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {analysis.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg border-2 ${getScoreColor(analysis.score)}`}>
                      <span className="font-medium">{analysis.score}/100</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(analysis.id)}
                        className="hover:bg-amber-50"
                      >
                        <Star className={`size-4 ${analysis.favorite ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                        <Eye className="size-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-emerald-50">
                        <Download className="size-4 text-emerald-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-red-50">
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
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
