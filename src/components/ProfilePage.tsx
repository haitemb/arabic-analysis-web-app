import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Header } from './Header';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Phone, MapPin, Building, Calendar, Save, Edit2, Shield, Camera, Loader2 } from 'lucide-react';
import { AlgerianPattern } from './AlgerianPattern';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { showError, showSuccess } from '../utils/toast';
import { toast } from 'sonner';
import { AppModal } from './AppModal';
import { modalDebug } from '../utils/modalDebug';

interface ProfilePageProps {}

export function ProfilePage(_: ProfilePageProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  // ── Avatar state ──────────────────────────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    // legacy - replaced by handleSaveProfile
  };

  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Validation helpers ────────────────────────────────────────────────────

  function validateName(name: string): boolean {
    const pattern = /^[\p{L}\s]{3,50}$/u;
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

  // ── Avatar upload ─────────────────────────────────────────────────────────

  /**
   * Uploads the selected image to the `avatars` Supabase Storage bucket.
   * Uses `${user.id}.png` as the filename with `upsert: true` so there is
   * always exactly one file per user (old image is replaced automatically).
   * After upload, writes the public URL into profiles.avatar_url.
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.id) return;

    // Accept only image files
    if (!file.type.startsWith('image/')) {
      showError('يُسمح فقط برفع ملفات الصور.');
      return;
    }

    // Guard against huge files (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت.');
      return;
    }

    try {
      setAvatarUploading(true);

      // 1️⃣  Upload (upsert) — one file per user, auto-replaces old one
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${formData.id}.png`, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        showError('فشل رفع الصورة. يرجى المحاولة مرة أخرى.');
        return;
      }

      // 2️⃣  Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${formData.id}.png`);

      // Add cache-busting query param so the browser re-fetches the new image
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // 3️⃣  Persist URL to profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', formData.id);

      if (profileError) {
        console.error('Profile avatar_url update error:', profileError);
        showError('تم رفع الصورة لكن فشل حفظها في الملف الشخصي.');
        return;
      }

      // 4️⃣  Update local UI immediately
      setAvatarUrl(publicUrl);
      showSuccess('تم تحديث الصورة الشخصية بنجاح!');
    } catch (err) {
      console.error('Unexpected avatar upload error:', err);
      showError('حدث خطأ غير متوقع أثناء رفع الصورة.');
    } finally {
      setAvatarUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const organization = formData.institution;
      const job_title = formData.role;

      if (!validateName(formData.name)) {
        showError('الاسم غير صالح. يجب أن يحتوي على 3 أحرف على الأقل.');
        setLoading(false);
        return;
      }

      if (!validateOptionalPhone(formData.phone)) {
        showError('رقم الهاتف يجب أن يكون بالشكل: +213XXXXXXXXX');
        setLoading(false);
        return;
      }

      if (!validateOptionalText(formData.city)) {
        showError('اسم المدينة غير صالح.');
        setLoading(false);
        return;
      }

      if (!validateOptionalText(organization)) {
        showError('اسم المؤسسة غير صالح.');
        setLoading(false);
        return;
      }

      if (!validateOptionalText(job_title)) {
        showError('الوظيفة غير صالحة.');
        setLoading(false);
        return;
      }

      const profileUpdate: any = {
        id: formData.id,
        full_name: formData.name,
        email: formData.email,
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
        showError('حدث خطأ أثناء حفظ المعلومات.');
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: formData.name },
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        showError('لم نتمكن من تحديث بيانات الحساب.');
        setLoading(false);
        return;
      }

      setIsEditing(false);
      showSuccess('تم حفظ التعديلات بنجاح!');
    } catch (err) {
      console.error('Unexpected error:', err);
      showError('حدث خطأ غير متوقع.');
    } finally {
      setLoading(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────

  const handleChangePassword = async (): Promise<boolean> => {
    modalDebug('profile-password', 'confirm-handler-start');
    if (!newPassword || newPassword.length < 6) {
      showError('كلمة المرور يجب أن تكون أطول من 6 أحرف.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      showError('كلمتا المرور غير متطابقتين.');
      return false;
    }

    try {
      setPasswordLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error('Error updating password:', error);
        showError('تعذر تغيير كلمة المرور.');
        return false;
      }

      showSuccess('تم تغيير كلمة المرور بنجاح!');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false);
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      showError('حدث خطأ غير متوقع.');
      return false;
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────────────────

  const handleDeleteAccount = async () => {
    modalDebug('profile-delete', 'confirm-handler-start', { userId: formData.id });
    if (!formData.id) {
      showError('تعذر تحديد الحساب.');
      return;
    }

    try {
      setDeleteLoading(true);

      const { error: rpcError } = await supabase.rpc('delete_user_account');

      if (rpcError) {
        const { error: analysesError } = await supabase
          .from('analyses')
          .delete()
          .eq('user_id', formData.id);

        if (analysesError) {
          console.error('Error deleting analyses:', analysesError);
          showError('فشل حذف بيانات التحليلات.');
          return;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', formData.id);

        if (profileError) {
          console.error('Error deleting profile:', profileError);
          showError('فشل حذف الملف الشخصي.');
          return;
        }
      }

      await logout();
      setShowDeleteDialog(false);
      toast.success('تم حذف الحساب نهائياً');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      toast.error('فشل حذف الحساب. ' + message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Fetch user data ───────────────────────────────────────────────────────

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

        // ── Load saved avatar URL ─────────────────────────────────────────
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      } catch (err) {
        console.error('Unexpected error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────

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

        if (!analyses || analyses.length === 0) return;

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)' }}>
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header card with avatar ───────────────────────────────────── */}
        <div className="relative">
          <Card className="border-2 border-emerald-600/20 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-l from-emerald-600 via-white to-red-600 opacity-10" />
            <AlgerianPattern className="absolute top-0 right-0 w-64 h-64 text-emerald-600" />

            <CardContent className="pt-8 pb-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-6">

                {/* ── Avatar with upload overlay ────────────────────────── */}
                <div className="relative group">
                  {/* Hidden file input */}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />

                  <Avatar className="size-24 border-4 border-white shadow-lg">
                    {avatarUrl && (
                      <AvatarImage
                        src={avatarUrl}
                        alt="صورة الملف الشخصي"
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                      {formData.name ? formData.name.charAt(0) : 'أم'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload overlay — shown on hover or while uploading */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    aria-label="تغيير الصورة الشخصية"
                    className={`
                      absolute inset-0 rounded-full flex flex-col items-center justify-center gap-1
                      bg-black/50 text-white
                      transition-opacity duration-200
                      ${avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                      cursor-pointer disabled:cursor-not-allowed
                    `}
                  >
                    {avatarUploading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="size-5" />
                        <span className="text-[10px] font-medium leading-none">تغيير</span>
                      </>
                    )}
                  </button>

                  {/* Verified badge */}
                  <div className="absolute -bottom-1 -left-1 bg-emerald-600 text-white rounded-full p-1.5 pointer-events-none">
                    <Shield className="size-4" />
                  </div>
                </div>

                {/* Name / role / email */}
                <div className="flex-1 text-center md:text-right">
                  <h2 className="text-blue-900 mb-1">{formData.name || 'الاسم'}</h2>
                  <p className="text-gray-600 mb-3">
                    {formData.role || 'العمل'} - {formData.institution || 'المؤسسة'}
                  </p>
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
                  variant={isEditing ? 'outline' : 'default'}
                  className={
                    isEditing
                      ? ''
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                  }
                >
                  <Edit2 className="size-4 ml-2" />
                  {isEditing ? 'إلغاء' : 'تعديل الملف'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Statistics ────────────────────────────────────────────────── */}
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

        {/* ── Profile Information ───────────────────────────────────────── */}
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

        {/* ── Security Section ──────────────────────────────────────────── */}
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
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
              onClick={() => {
                modalDebug('profile-password', 'trigger-click');
                setShowPasswordDialog(true);
              }}
            >
              تغيير كلمة المرور
            </Button>

            <Separator className="my-6" />

            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-700">يمكنك حذف حسابك نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
              <Button
                variant="outline"
                onClick={() => {
                  modalDebug('profile-delete', 'trigger-click');
                  setShowDeleteDialog(true);
                }}
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto self-start"
              >
                حذف الحساب نهائياً
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Password Dialog ───────────────────────────────────────────── */}
        <AppModal
          modalId="profile-password"
          open={showPasswordDialog}
          onClose={() => {
            setShowPasswordDialog(false);
            setNewPassword('');
            setConfirmPassword('');
          }}
          title="تغيير كلمة المرور"
          description="أدخل كلمة المرور الجديدة وتأكيدها."
          disableDismiss={passwordLoading}
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={passwordLoading}
                onClick={() => {
                  modalDebug('profile-password', 'cancel-click');
                  setShowPasswordDialog(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                disabled={passwordLoading}
                variant="destructive"
                className="!bg-red-600 !text-white hover:!bg-red-700 border-0"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                onClick={() => void handleChangePassword()}
              >
                {passwordLoading ? 'جاري التغيير...' : 'حفظ'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </div>
          </div>
        </AppModal>

        {/* ── Delete Account Dialog ─────────────────────────────────────── */}
        <AppModal
          modalId="profile-delete"
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="تأكيد حذف الحساب"
          description="هل أنت متأكد من أنك تريد حذف حسابك نهائياً؟ سيتم مسح جميع بياناتك وتقاريرك، ولا يمكن التراجع عن هذا الإجراء أبداً."
          confirmText="تأكيد الحذف"
          cancelText="إلغاء"
          destructive
          confirmLoading={deleteLoading}
          disableDismiss={deleteLoading}
          onConfirm={handleDeleteAccount}
        />

      </main>
    </div>
  );
}