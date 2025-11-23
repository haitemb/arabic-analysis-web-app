import React, { useEffect, useState } from 'react'; 
import { GraduationCap, LogOut, Settings, User, History, Home } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../services/supabaseClient';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
 
  const [fullName, setFullName] = useState('المستخدم');

useEffect(() => {
  const fetchUserName = async () => {
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return;
      }

      if (!session?.user) return;

      const user = session.user;
      const name = user.user_metadata?.full_name || user.user_metadata?.display_name || 'المستخدم';
      setFullName(name);
    } catch (err) {
      console.error('Unexpected error fetching user name:', err);
    }
  };

  fetchUserName();

  // Optional: listen for auth state changes to update the name dynamically
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const name = session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || 'المستخدم';
      setFullName(name);
    }
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);



  const handleNavigate = (path: string) => navigate(path);
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b-2 shadow-md relative z-50" style={{ pointerEvents: 'auto' }}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-emerald-600 via-white to-red-600" />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 rounded-xl shadow-lg">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-blue-900">منصة جودة التعليم AI</h1>
              <p className="text-sm text-gray-600">تحليل جودة المحتوى التعليمي</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => handleNavigate('/dashboard')}
                className={`gap-2 hover:bg-emerald-50 hover:text-emerald-700 ${location.pathname === '/dashboard' ? 'bg-emerald-50 text-emerald-700' : ''}`}
              >
                <Home className="size-4" />
                الرئيسية
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleNavigate('/history')}
                className={`gap-2 hover:bg-blue-50 hover:text-blue-700 ${location.pathname === '/history' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <History className="size-4" />
                السجل
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-emerald-50">
                  <span className="text-gray-700">{fullName || 'المستخدم'}</span>
                  <Avatar className="size-8 border-2 border-emerald-600">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700">
                      {fullName?.[0] || 'أم'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-right">حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleNavigate('/profile')} className="cursor-pointer">
                  <User className="size-4 ml-2" />
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleNavigate('/history')} className="cursor-pointer md:hidden">
                  <History className="size-4 ml-2" />
                  السجل
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleNavigate('/dashboard')} className="cursor-pointer md:hidden">
                  <Home className="size-4 ml-2" />
                  الرئيسية
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="size-4 ml-2" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="size-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
