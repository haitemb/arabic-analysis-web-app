import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Header } from './Header';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Phone, MapPin, Building, Calendar, Save, Edit2, Shield } from 'lucide-react';
import { AlgerianPattern } from './AlgerianPattern';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';

interface ProfilePageProps {}

export function ProfilePage(_: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    institution: '',
    role: '',
  });

  const handleSave = () => {
    // legacy - replaced by handleSaveProfile
  };

  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Validation helpers
  function validateName(name: string): boolean {
    const pattern = /^[\p{L}\s]{3,50}$/u; // required
    return pattern.test(name);
  }

  function validateOptionalPhone(phone: string): boolean {
    if (!phone) return true;
    const pattern = /^\+213[0-9]{9}$/;
    return pattern.test(phone);
  }

  function validateOptionalText(text: string): boolean {
    return !text || (typeof text === 'string' && text.trim().length <= 100);
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // derive organization/job_title from current form shape
      const organization = formData.institution;
      const job_title = formData.role;

      // === VALIDATION ===
      if (!validateName(formData.name)) {
        alert('الاسم غير صالح. يجب أن يحتوي على 3 أحرف على الأقل.');
        setLoading(false);
        return;
      }

      // optional validations
      if (!validateOptionalPhone(formData.phone)) {
        alert('رقم الهاتف يجب أن يكون بالشكل: +213XXXXXXXXX');
        setLoading(false);
        return;
      }

      if (!validateOptionalText(formData.city)) {
        alert('اسم المدينة غير صالح.');
        setLoading(false);
        return;
      }

      if (!validateOptionalText(organization)) {
        alert('اسم المؤسسة غير صالح.');
        setLoading(false);
        return;
      }

      if (!validateOptionalText(job_title)) {
        alert('الوظيفة غير صالحة.');
        setLoading(false);
        return;
      }

      // === UPDATE PROFILE TABLE (safe) ===
      const profileUpdate: any = {
        id: formData.id,
        full_name: formData.name,
        email: formData.email, // read-only, keep existing
        phone: formData.phone || null,
        city: formData.city || null,
        organization: organization || null,
        job_title: job_title || null,
        role: formData.role || null,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileUpdate, { onConflict: 'id' });

      if (profileError) {
        console.error('Error updating profile table:', profileError);
        alert('حدث خطأ أثناء حفظ المعلومات.');
        setLoading(false);
        return;
      }

      // === UPDATE AUTH.USERS (only full_name) ===
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
        },
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        alert('لم نتمكن من تحديث بيانات الحساب.');
        setLoading(false);
        return;
      }

      // SUCCESS
      setIsEditing(false);
      alert('تم حفظ التعديلات بنجاح!');
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('حدث خطأ غير متوقع.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون أطول من 6 أحرف.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setPasswordLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error('Error updating password:', error);
        alert('تعذر تغيير كلمة المرور.');
        return;
      }

      alert('تم تغيير كلمة المرور بنجاح!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('حدث خطأ غير متوقع.');
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          return;
        }

        if (!session?.user) return;
        const user = session.user;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = No rows found (supabase might use different codes depending on adapter)
          console.error('Error fetching profile:', profileError);
        }

        setFormData({
          id: user.id,
          name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.display_name || '',
          email: user.email || '',
          phone: profile?.phone || '',
          city: profile?.city || '',
          institution: profile?.organization || '',
          role: profile?.job_title || '',
        });
      } catch (err) {
        console.error('Unexpected error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const [stats, setStats] = useState([
    { label: 'إجمالي التحليلات', value: '0', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'هذا الشهر', value: '0', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'متوسط الجودة', value: '0/100', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'عضو منذ', value: '-', color: 'text-red-600', bg: 'bg-red-50' },
  ]);

  useEffect(() => {
    if (!formData.id) return;

    const fetchStats = async () => {
      try {
        const { data: analyses, error } = await supabase
          .from('analyses')
          .select('overall_score, created_at')
          .eq('user_id', formData.id);

        if (error) {
          console.error('Error fetching analyses for stats:', error);
          return;
        }

        if (!analyses || analyses.length === 0) {
          return;
        }

        const totalAnalyses = analyses.length;

        const now = new Date();
        const analysesThisMonth = analyses.filter((a: any) => {
          const created = new Date(a.created_at);
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;

        const totalScore = analyses.reduce((sum: number, a: any) => sum + (Number(a.overall_score) || 0), 0);
        const avgScore = Math.round(totalScore / totalAnalyses);

        const firstAnalysisDate = analyses
          .map((a: any) => new Date(a.created_at))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0];

        const memberSince = firstAnalysisDate
          ? firstAnalysisDate.toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' })
          : '-';

        setStats([
          { label: 'إجمالي التحليلات', value: totalAnalyses.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'هذا الشهر', value: analysesThisMonth.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'متوسط الجودة', value: `${avgScore}/100`, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'عضو منذ', value: memberSince, color: 'text-red-600', bg: 'bg-red-50' },
        ]);
      } catch (err) {
        console.error('Unexpected error fetching stats:', err);
      }
    };

    fetchStats();
  }, [formData.id]);

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
                  <h2 className="text-blue-900 mb-1">{formData.name || 'الاسم'}</h2>
                  <p className="text-gray-600 mb-3">{(formData.role || 'العمل')} - {(formData.institution || 'المؤسسة')}</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4 text-red-600" />
                      {formData.city || 'المدينة'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="size-4 text-emerald-600" />
                      {formData.email || 'البريد الإلكتروني'}
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
                  placeholder="الاسم الكامل"
                  className={isEditing ? 'border-emerald-300' : 'bg-gray-50'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4 text-emerald-600" />
                  البريد الإلكتروني
                </Label>
                <input
                  id="email"
                  value={formData.email}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
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
                  placeholder="رقم الهاتف"
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
                  placeholder="المدينة"
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
                  placeholder="المؤسسة"
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
                  placeholder="العمل"
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
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    <Save className="size-4 ml-2" />
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
            <div className="mt-2 p-4 border rounded-lg">
              {!showPasswordForm ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-700">لتغيير كلمة المرور، اضغط الزر أدناه.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const ok = window.confirm('تحذير: سيتم تغيير كلمة المرور لحسابك. هل تريد المتابعة؟');
                      if (ok) setShowPasswordForm(true);
                    }}
                    className="border-red-300 text-red-700 hover:bg-red-50 w-full"
                  >
                    تغيير كلمة المرور
                  </Button>
                </div>
              ) : (
                <div className="mt-2 p-0 space-y-3">
                  <h3 className="font-semibold mb-2">تغيير كلمة المرور</h3>

                  <Input
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={passwordLoading}
                  />

                  <Input
                    type="password"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={passwordLoading}
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="bg-blue-600 text-white flex-1"
                    >
                      {passwordLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      disabled={passwordLoading}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
