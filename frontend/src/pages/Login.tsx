import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Label, Spinner } from '@heroui/react';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { authService, useAuth } from '@/services/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { loginWithGoogleCredential } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  // Setup Google Sign-In
  useEffect(() => {
    let isMounted = true;

    async function setupGoogleSignIn() {
      try {
        // Load Google Script
        if (window.google?.accounts?.id) {
          initializeGoogleSignIn();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) initializeGoogleSignIn();
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error('Failed to load Google Sign-In:', err);
      }
    }

    setupGoogleSignIn();

    return () => {
      isMounted = false;
    };
  }, []);

  async function initializeGoogleSignIn() {
    try {
      const clientId = await authService.getGoogleClientId();

      if (!clientId) {
        console.warn('Google Client ID not configured on backend');
        return;
      }

      window.google?.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: false,
        callback: handleGoogleResponse,
      });

      if (googleButtonRef.current && !googleButtonRef.current.hasChildNodes()) {
        window.google?.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          width: 280,
        });
      }
    } catch (err) {
      console.error('Failed to initialize Google Sign-In:', err);
    }
  }

  async function handleGoogleResponse(response: { credential?: string }) {
    if (!response.credential) {
      setError('Google authentication failed. Please try again.');
      return;
    }

    try {
      setIsGoogleLoading(true);
      setError(null);
      await loginWithGoogleCredential(response.credential);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const validateStudentId = (id: string): boolean => {
    // Format: STU-YYYY-NNNNN (e.g., STU-2021-00001)
    const pattern = /^STU-\d{4}-\d{5}$/;
    return pattern.test(id.trim());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = studentId.trim();
    const trimmedEmail = email.trim();

    if (!trimmedId) {
      setError('Please enter your student ID');
      return;
    }

    if (!validateStudentId(trimmedId)) {
      setError('Invalid student ID format. Expected: STU-YYYY-NNNNN (e.g., STU-2021-00001)');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);

      // Create dev token: dev:role:userId
      const devToken = `dev:student:${trimmedId}`;

      // Store in localStorage
      localStorage.setItem('authToken', devToken);
      localStorage.setItem('studentId', trimmedId);
      localStorage.setItem('email', trimmedEmail);
      localStorage.setItem('fullName', trimmedEmail.split('@')[0]);
      localStorage.setItem('userRole', 'student');

      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to dashboard
      navigate('/student/dashboard');
    } catch (err) {
      setError('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">IAE System</h1>
          <p className="text-slate-600 mt-2">Course Shifting Module</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Student Login
              </h2>
              <p className="text-sm text-slate-600">
                Sign in to access the course shifting application.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Student ID Input */}
            <div>
              <Label className="text-sm font-medium text-slate-700 block mb-1.5">Student ID</Label>
              <Input
                placeholder="STU-2021-00001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">Format: STU-YYYY-NNNNN</p>
            </div>

            {/* Email Input */}
            <div>
              <Label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</Label>
              <Input
                placeholder="juan.delacruz@university.edu"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="w-full"
              />
            </div>

            {/* Dev Login Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Logging in...
                </>
              ) : (
                'Continue with Student ID'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Sign-In Button */}
            <div className="space-y-3">
              {isGoogleLoading && (
                <div className="flex items-center justify-center gap-2 text-blue-600 py-3">
                  <Spinner size="sm" />
                  <span className="text-sm font-medium">Signing in with Google...</span>
                </div>
              )}
              {!isGoogleLoading && (
                <div ref={googleButtonRef} className="flex justify-center" />
              )}
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Development Environment • v1.0.0
        </p>
      </div>
    </div>
  );
}
