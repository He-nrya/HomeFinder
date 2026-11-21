import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { Spinner } from './AuthShell';

// "Send me another verification email" with a 60-second cooldown.
// Pass `email` when we already know it, or `askEmail` to show an input.
export default function ResendVerification({ email: knownEmail = '', askEmail = false }) {
  const [email, setEmail] = useState(knownEmail);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email address');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/resend-verification', { email: email.trim() });
      toast.success('Verification email sent');
      setDone(data.message);
      setWait(60);
    } catch (err) {
      toast.error(errMsg(err));
      if (err?.response?.status === 429) setWait(60);
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={send} className="space-y-3">
      {askEmail && (
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-[17px] text-gray-400" />
          <input className="input !pl-11" type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      )}
      <button disabled={busy || wait > 0} className="btn-outline w-full">
        {busy && <Spinner className="h-4 w-4" />}
        {wait > 0 ? `Resend available in ${wait}s` : 'Resend verification email'}
      </button>
      {done && <p className="rounded-lg bg-brand-soft p-3 text-xs leading-5 text-brand-green">{done}</p>}
    </form>
  );
}
