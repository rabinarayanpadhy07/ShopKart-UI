import { useEffect, useRef } from 'react';
import { googleLogin } from '@/api/auth';

const GSI_SCRIPT_ID = 'google-gsi-script';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existing = document.getElementById(GSI_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GSI_SCRIPT_ID;
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  text = 'continue_with',
  expectedRole,
}) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const configured = Boolean(clientId && String(clientId).includes('.apps.googleusercontent.com'));

  useEffect(() => {
    if (!configured) return undefined;
    let cancelled = false;

    const handleCredential = async (response) => {
      try {
        const data = await googleLogin(response.credential, expectedRole);
        if (!cancelled) onSuccess?.(data);
      } catch (error) {
        if (!cancelled) onError?.(error.message || 'Google Sign-In failed');
      }
    };

    const render = () => {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 352,
        text,
        shape: 'rectangular',
      });
    };

    loadGoogleScript().then(render).catch((error) => {
      if (!cancelled) onError?.(error.message);
    });

    return () => {
      cancelled = true;
    };
  }, [configured, clientId, text, expectedRole, onSuccess, onError]);

  return (
    <div className="mt-4 space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-surface px-3 text-xs text-ink-muted uppercase tracking-wide">
          Or continue with Google
        </span>
      </div>
      {configured ? (
        <div ref={buttonRef} className="flex justify-center min-h-10" />
      ) : (
        <p className="text-xs text-center text-ink-muted">
          Set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> in ShopKart-UI to enable Google Sign-In.
        </p>
      )}
    </div>
  );
}
