import { useEffect, useRef, useState } from 'react';
import { Card, Spinner } from '@heroui/react';
import { GraduationCap } from 'lucide-react';
import { authService, useAuth } from '@/services/auth';

let googleScriptPromise: Promise<void> | null = null;
let initializedClientId: string | null = null;
let hasPrompted = false;
let credentialHandler: ((credential: string) => void) | null = null;

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

function loadGoogleScript() {
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google login.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google login.'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleLoginGate({ children }: { children: React.ReactNode }) {
  const { user, loginWithGoogleCredential } = useAuth();
  const [isLoading, setIsLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function setupGoogleLogin() {
      try {
        setIsLoading(true);
        const [clientId] = await Promise.all([
          authService.getGoogleClientId(),
          loadGoogleScript(),
        ]);

        if (!clientId) {
          throw new Error('Google login is not configured. Add your web client ID to the backend .env.');
        }

        credentialHandler = async (credential) => {
          try {
            setError(null);
            await loginWithGoogleCredential(credential);
          } catch (loginError) {
            if (isMounted) {
              setError(loginError instanceof Error ? loginError.message : 'Google login failed.');
            }
          }
        };

        if (initializedClientId !== clientId) {
          window.google?.accounts.id.initialize({
            client_id: clientId,
            auto_select: false,
            cancel_on_tap_outside: false,
            callback: (response) => {
              if (!response.credential) {
                setError('Google did not return a login credential.');
                return;
              }

              credentialHandler?.(response.credential);
            },
          });
          initializedClientId = clientId;
        }

        if (buttonRef.current) {
          const buttonContainer = buttonRef.current;
          if (buttonContainer.dataset.googleButtonRendered !== 'true') {
            buttonContainer.replaceChildren();
            window.google?.accounts.id.renderButton(buttonContainer, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular',
              width: 320,
            });
            buttonContainer.dataset.googleButtonRendered = 'true';
          }
        }

        if (!hasPrompted) {
          window.google?.accounts.id.prompt();
          hasPrompted = true;
        }
      } catch (setupError) {
        if (isMounted) {
          setError(setupError instanceof Error ? setupError.message : 'Google login setup failed.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    setupGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [loginWithGoogleCredential, user]);

  if (user) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md rounded-lg border border-slate-800 bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 text-white">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">IAE System</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in with your Google account to access the course shifting module.
          </p>
        </div>

        <div className="flex min-h-11 justify-center" ref={buttonRef} />
        {isLoading && (
          <div className="mt-3 flex justify-center">
            <Spinner size="sm" />
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </Card>
    </main>
  );
}
