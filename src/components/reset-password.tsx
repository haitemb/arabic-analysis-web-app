import { useEffect, useState } from 'react';
import { Lock, CheckCircle, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-emerald-600 to-blue-600 p-4 rounded-2xl animate-slide-down">
              <CheckCircle className="size-12 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              تم التحديث بنجاح
            </h2>
            <p className="text-gray-600">
              تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمتك الجديدة.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-emerald-500 p-3 rounded-2xl">
              <GraduationCap className="size-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">منصة جودة التعليم AI</h1>
          <p className="text-gray-600">إعادة تعيين كلمة المرور</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-5">
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-medium py-2 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري التحديث...' : 'تأكيد'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          هل تتذكر كلمة المرور؟{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
