import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import AuthShell, { StatusIcon, Spinner } from '../components/AuthShell';

export default function ForgotPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || ''); // prefilled from the login form
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSentTo(email.trim());
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  if (sentTo) {
    return (
      <AuthShell>
        <div className="text-center">
          <StatusIcon tone="success"><Mail size={32} /></StatusIcon>
          <h1 className="mb-2 text-3xl font-bold text-brand-green">Check your email</h1>
          <p className="mb-2 text-sm leading-6 text-gray-500">If an account exists for <strong className="text-gray-800">{sentTo}</strong>, we've sent a link to reset your password. It expires in 60 minutes.</p>
          <p className="mb-6 text-xs text-gray-400">Nothing arrived? Check your spam folder, or try again in a minute.</p>
          <button onClick={() => setSentTo('')} className="btn-outline mb-3 w-full">Use a different email</button>
          <Link to="/auth" className="text-sm font-semibold text-brand-gold">Back to login</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your account email and we'll send you a link to choose a new password.">
      <form onSubmit={submit}>
        <label className="mb-1 block text-[13px] font-semibold text-gray-700">Email Address</label>
        <div className="relative mb-5">
          <Mail size={16} className="absolute left-4 top-[17px] text-gray-400" />
          <input className="input !pl-11" type="email" required autoFocus placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button disabled={busy} className="btn !h-[52px] w-full bg-[#18251f] text-white hover:bg-[#2b4036]">
          {busy ? <><Spinner className="h-4 w-4" /> Sending…</> : <>Send reset link <ArrowRight size={17} /></>}
        </button>
        <p className="mt-5 text-center text-sm text-gray-500">Remembered it? <Link to="/auth" className="font-semibold text-brand-gold">Back to login</Link></p>
      </form>
    </AuthShell>
  );
}
