import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { DetailedReport } from './components/DetailedReport';
import { ProfilePage } from './components/ProfilePage';
import { HistoryPage } from './components/HistoryPage';
import { TestExtractor } from './components/test';
import { Toaster } from './components/ui/sonner';
import ResetPasswordPage from "./components/reset-password.tsx";
import { supabase } from './services/supabaseClient';
export interface AnalysisData {
  documentName: string;
  executiveSummary?: string;
  educationLevel: string;
  overallScore: number;
  uploadDate: string;
  linguisticAnalysis: {
    grammaticalComplexity: number;
    stylisticDiversity: number;
    textSimplicity: number;
    languageEase: number;
  };
  semanticAnalysis: {
    ambiguity: number;
    repetition: number;
    conceptualGap: number;
    semanticLinks: number;
  };
  bloomsTaxonomy: {
    creativity: number;
    evaluation: number;
    analysis: number;
    application: number;
    understanding: number;
    remembering: number;
  };
  contentOrganization: {
    structureQuality: number;
    learningProgression: number;
    contentRelevance: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    title: string;
    description: string;
    priority: 'عالية' | 'متوسطة' | 'منخفضة';
  }[];
  keyFindings: {
    linguistic: string[];
    semantic: string[];
    pedagogical: string[];
  };
}

// Auth Context
interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    // initialize session
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setIsAuthenticated(!!data.session);
        setUser(data.session?.user ?? null);
      } catch (e) {
        console.error('Failed to get supabase session', e);
      }
    })();

    const res = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
      if (!session) {
        // clear stored analysis when user signs out
        sessionStorage.removeItem('currentAnalysis');
      }
    });

    return () => {
      mounted = false;
      // res.data.subscription exists in the v2 callback result
      try {
        res.data.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error', e);
    } finally {
      sessionStorage.removeItem('currentAnalysis');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirects if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Login Page Component
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  return <LoginScreen onLogin={handleLogin} />;
}

// Note: wrapper page components removed. Pages use hooks (useAuth/useNavigate) directly.

// Root redirect component
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

// Analysis route component (reads state or sessionStorage)
function AnalysisRoute() {
  const location = useLocation();
  let analysisData = location.state?.analysisData as AnalysisData | undefined;

  if (!analysisData) {
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      try {
        analysisData = JSON.parse(stored) as AnalysisData;
      } catch (e) {
        console.error('Failed to parse stored analysis data', e);
      }
    }
  }

  if (!analysisData) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AnalysisResults analysisData={analysisData} />;
}

// Report route component
function ReportRoute() {
  const location = useLocation();
  let analysisData = location.state?.analysisData as AnalysisData | undefined;

  if (!analysisData) {
    const stored = sessionStorage.getItem('currentAnalysis');
    if (stored) {
      try {
        analysisData = JSON.parse(stored) as AnalysisData;
      } catch (e) {
        console.error('Failed to parse stored analysis data', e);
      }
    }
  }

  if (!analysisData) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DetailedReport analysisData={analysisData} />;
}

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <AnalysisRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ Public Reset Password route */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/test-extractor" element={<TestExtractor />} />

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}


// Main App Component
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <AppRoutes />
        </div>
        <Toaster dir="rtl" position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}
