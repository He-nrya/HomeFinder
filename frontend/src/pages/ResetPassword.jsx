import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import AuthShell, { StatusIcon, Spinner } from '../components/AuthShell';

// Same rule the server enforces (utils/validate.js).
const passwordProblem = (pw) => {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain both letters and numbers';
  return '';
};

// Opened from the link in the reset email:  /reset-password?token=...
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [linkError, setLinkError] = useState(token ? '' : 'This reset link is incomplete.');

  const submit = async (e) => {
    e.preventDefault();
    const problem = passwordProblem(password);
    if (problem) return toast.error(problem);
    if (password !== confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      if (err?.response?.data?.code === 'TOKEN_INVALID') setLinkError(errMsg(err));
      else toast.error(errMsg(err));
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <AuthShell>
        <div className="text-center">
          <StatusIcon tone="success"><Check size={34} /></StatusIcon>
          <h1 className="mb-2 text-3xl font-bold text-brand-green">Password updated</h1>
          <p className="mb-6 text-sm leading-6 text-gray-500">Your password has been changed and all other devices were signed out. Log in with your new password.</p>
          <Link to="/auth" className="btn-green w-full !py-3">Log in</Link>
        </div>
      </AuthShell>
    );
  }

  if (linkError) {
    return (
      <AuthShell>
        <div className="text-center">
          <StatusIcon tone="error"><X size={34} /></StatusIcon>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">This link can't be used</h1>
          <p className="mb-6 text-sm leading-6 text-gray-500">{linkError}</p>
          <Link to="/forgot-password" className="btn-green w-full !py-3">Request a new link</Link>
          <p className="mt-5 text-sm"><Link to="/auth" className="font-semibold text-brand-gold">Back to login</Link></p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters, with letters and numbers.">
      <form onSubmit={submit}>
        <label className="mb-1 block text-[13px] font-semibold text-gray-700">New password</label>
        <div className="relative mb-4">
          <Lock size={16} className="absolute left-4 top-[17px] text-gray-400" />
          <input className="input !px-11" type={show ? 'text' : 'password'} required minLength={8} autoFocus autoComplete="new-password" placeholder="Create a new password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-[15px] text-gray-400" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <label className="mb-1 block text-[13px] font-semibold text-gray-700">Confirm new password</label>
        <div className="relative mb-5">
          <ShieldCheck size={16} className="absolute left-4 top-[17px] text-gray-400" />
          <input className="input !pl-11" type={show ? 'text' : 'password'} required autoComplete="new-password" placeholder="Confirm your new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button disabled={busy} className="btn !h-[52px] w-full bg-[#18251f] text-white hover:bg-[#2b4036]">
          {busy ? <><Spinner className="h-4 w-4" /> Saving…</> : <>Update password <ArrowRight size={17} /></>}
        </button>
      </form>
    </AuthShell>
  );
}
