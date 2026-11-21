import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import api, { errMsg } from '../api';
import AuthShell, { StatusIcon, Spinner } from '../components/AuthShell';
import ResendVerification from '../components/ResendVerification';

// Opened from the link in the verification email:  /verify-email?token=...
export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'This verification link is incomplete. Request a new one below.');
  const started = useRef(false); // React dev mode runs effects twice; the token must only be used once

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    api.post('/auth/verify-email', { token })
      .then(() => setState('success'))
      .catch((err) => { setState('error'); setMessage(errMsg(err)); });
  }, [token]);

  if (state === 'loading') {
    return (
      <AuthShell>
        <div className="py-8 text-center text-brand-green">
          <Spinner className="mx-auto mb-4 h-10 w-10" />
          <p className="font-semibold">Verifying your email…</p>
        </div>
      </AuthShell>
    );
  }

  if (state === 'success') {
    return (
      <AuthShell>
        <div className="text-center">
          <StatusIcon tone="success"><Check size={34} /></StatusIcon>
          <h1 className="mb-2 text-3xl font-bold text-brand-green">Email verified</h1>
          <p className="mb-6 text-sm leading-6 text-gray-500">Your HomeFinder account is active. Log in to start exploring homes — we've also sent you a welcome email.</p>
          <Link to="/auth" className="btn-green w-full !py-3">Log in</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="text-center">
        <StatusIcon tone="error"><X size={34} /></StatusIcon>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">We couldn't verify your email</h1>
        <p className="mb-6 text-sm leading-6 text-gray-500">{message}</p>
      </div>
      <p className="mb-3 text-sm font-semibold text-gray-700">Get a new verification link</p>
      <ResendVerification askEmail />
      <p className="mt-5 text-center text-sm text-gray-500">Already verified? <Link to="/auth" className="font-semibold text-brand-gold">Log in</Link></p>
    </AuthShell>
  );
}
