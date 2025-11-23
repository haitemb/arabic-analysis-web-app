import { useEffect, useState } from 'react';
import { Lock, CheckCircle, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../services/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'error' | 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('User is allowed to reset password now');
      }
    });
  }, []);

  async function handleReset() {
    if (!password) {
      setAlert({ type: 'warning', message: 'يرجى إدخال كلمة مرور جديدة' });
      return;
    }

    if (password.length < 6) {
      setAlert({
        type: 'error',
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'كلمة المرور وتأكيدها غير متطابقين' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setAlert({ type: 'error', message: error.message });
      } else {
        setAlert({
          type: 'success',
          message: 'تم تغيير كلمة المرور بنجاح!',
        });
        setTimeout(() => setDone(true), 1500);
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || 'حدث خطأ أثناء تغيير كلمة المرور',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-br from-emerald-600 to-blue-600 p-4 rounded-2xl">
                <CheckCircle className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-blue-900">تم التحديث بنجاح</CardTitle>
            <CardDescription>
              تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمتك الجديدة.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Link to="/login" className="w-full">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600">
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-emerald-500 p-3 rounded-2xl">
              <GraduationCap className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-blue-900">منصة جودة التعليم AI</CardTitle>
          <CardDescription>إعادة تعيين كلمة المرور</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleReset}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 disabled:opacity-50"
          >
            {isLoading ? 'جاري التحديث...' : 'تأكيد'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            هل تتذكر كلمة المرور؟{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              تسجيل الدخول
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
