import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Header } from './Header';
import { User, Mail, Phone, MapPin, Building, Calendar, Save, Edit2, Shield } from 'lucide-react';
import { AlgerianPattern } from './AlgerianPattern';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';

interface ProfilePageProps {}

export function ProfilePage(_: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'أحمد محمد',
    email: 'ahmed.mohamed@example.dz',
    phone: '+213 555 123 456',
    city: 'الجزائر العاصمة',
    institution: 'وزارة التربية الوطنية',
    role: 'مدير مدرسة',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const stats = [
    { label: 'إجمالي التحليلات', value: '47', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'هذا الشهر', value: '12', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'متوسط الجودة', value: '84/100', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'عضو منذ', value: 'يناير 2024', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)' }}>
  <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header with Algerian Pattern */}
        <div className="relative">
          <Card className="border-2 border-emerald-600/20 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-l from-emerald-600 via-white to-red-600 opacity-10" />
            <AlgerianPattern className="absolute top-0 right-0 w-64 h-64 text-emerald-600" />
            
            <CardContent className="pt-8 pb-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="size-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                      أم
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-1.5">
                    <Shield className="size-4" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-right">
                  <h2 className="text-blue-900 mb-1">{formData.name}</h2>
                  <p className="text-gray-600 mb-3">{formData.role} - {formData.institution}</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4 text-red-600" />
                      {formData.city}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="size-4 text-emerald-600" />
                      {formData.email}
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className={isEditing ? "" : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"}
                >
                  <Edit2 className="size-4 ml-2" />
                  {isEditing ? 'إلغاء' : 'تعديل الملف'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.bg} border-2 border-emerald-600/10 shadow-md`}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className={`text-2xl ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Information */}
        <Card className="border-2 border-emerald-600/20 shadow-xl">
          <CardHeader className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-emerald-600 via-white to-red-600" />
            <CardTitle className="text-blue-900">المعلومات الشخصية</CardTitle>
            <CardDescription>
              {isEditing ? 'قم بتحديث معلوماتك الشخصية' : 'عرض وإدارة معلومات حسابك'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="size-4 text-emerald-600" />
                  الاسم الكامل
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? 'border-emerald-300' : 'bg-gray-50'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4 text-emerald-600" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? 'border-emerald-300' : 'bg-gray-50'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="size-4 text-emerald-600" />
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? 'border-emerald-300' : 'bg-gray-50'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600" />
                  المدينة
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? 'border-emerald-300' : 'bg-gray-50'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="institution" className="flex items-center gap-2">
                  <Building className="size-4 text-emerald-600" />
                  المؤسسة
                </Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? 'border-emerald-300' : 'bg-gray-50'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Calendar className="size-4 text-emerald-600" />
                  الوظيفة
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? 'border-emerald-300' : 'bg-gray-50'}
                />
              </div>
            </div>
            
            {isEditing && (
              <>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    <Save className="size-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-2 border-red-600/20 shadow-xl">
          <CardHeader className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-red-600 via-white to-emerald-600" />
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Shield className="size-5 text-red-600" />
              الأمان وكلمة المرور
            </CardTitle>
            <CardDescription>
              إدارة إعدادات الأمان وتغيير كلمة المرور
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
