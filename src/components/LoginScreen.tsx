import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { User, Lock, GraduationCap } from 'lucide-react';
import { Alert } from './ui/alert';
import { supabase } from '../services/supabaseClient';

interface LoginScreenProps {
  onLogin: () => void;
}

type AlertState = {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
} | null;

async function sendPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) throw error;
  return data;
}
export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState<AlertState>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (type: 'error' | 'success' | 'info' | 'warning', message: string) => {
    setAlert({ type, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          showAlert('error', 'كلمة المرور وتأكيدها غير متطابقين');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          showAlert('error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            showAlert('error', 'هذا البريد الإلكتروني مسجل بالفعل');
          } else {
            showAlert('error', error.message || 'حدث خطأ أثناء التسجيل');
          }
        } else {
          showAlert('success', 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد');
          setTimeout(() => {
            setIsSignUp(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setName('');
          }, 2000);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            showAlert('error', 'بيانات الدخول غير صحيحة');
          } else if (error.message.includes('Email not confirmed')) {
            showAlert('warning', 'يرجى التحقق من بريدك الإلكتروني أولاً');
          } else {
            showAlert('error', error.message || 'حدث خطأ أثناء تسجيل الدخول');
          }
        } else {
          showAlert('success', 'تسجيل الدخول بنجاح!');
          setTimeout(() => onLogin(), 1500);
        }
      }
    } catch (err: any) {
      showAlert('error', err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardDescription>
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول إلى حسابك'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="أحمد محمد"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pr-10"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            {isSignUp && (
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
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="text-left">
              <button
  type="button"
  className="text-sm text-blue-600 hover:text-blue-700"
  onClick={async () => {
    if (!email) {
      showAlert("warning", "يرجى إدخال بريدك الإلكتروني أولًا");
      return;
    }

    try {
      await sendPasswordReset(email);
      showAlert("success", "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني");
    } catch (err: any) {
      showAlert("error", err.message || "تعذر إرسال رابط الاستعادة");
    }
  }}
>
  هل نسيت كلمة المرور؟
</button>

              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 disabled:opacity-50"
            >
              {isLoading ? 'جاري التحميل...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAlert(null);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setName('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
