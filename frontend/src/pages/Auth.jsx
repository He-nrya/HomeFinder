import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, BadgeCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import BrandLogo from '../components/BrandLogo';
import ResendVerification from '../components/ResendVerification';
import { StatusIcon } from '../components/AuthShell';

const Field = ({ icon: Icon, label, children }) => (
  <div className="mb-4"><label className="mb-1 block text-[13px] font-semibold text-gray-700">{label}</label>
    <div className="relative"><Icon size={16} className="absolute left-4 top-[17px] text-gray-400" />{children}</div></div>
);
const types = ['Tenant', 'Students', 'Home Seeker', 'Buyer', 'Landlord', 'Seller'];

// Same rule the server enforces (backend/utils/validate.js).
const passwordProblem = (pw) => {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain both letters and numbers';
  return '';
};

export default function Auth() {
  const { login, signup } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);        // set after a successful sign-up: { email, emailSent }
  const [unverified, setUnverified] = useState(''); // set when login is refused because the email isn't verified
  const [f, setF] = useState({ name: '', email: '', phone: '', accountType: '', password: '', confirm: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setUnverified('');
    if (mode === 'signup') {
      const problem = passwordProblem(f.password);
      if (problem) return toast.error(problem);
      if (f.password !== f.confirm) return toast.error('Passwords do not match');
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        const u = await login({ email: f.email, password: f.password });
        toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
        nav(u.role === 'admin' ? '/admin' : '/');
      } else {
        const { confirm, ...body } = f; // eslint-disable-line no-unused-vars
        const r = await signup(body);
        setSent({ email: r.email || f.email, emailSent: r.emailSent });
        setF((prev) => ({ ...prev, password: '', confirm: '' }));
      }
    } catch (err) {
      if (err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') setUnverified(err.response.data.email || f.email);
      else toast.error(errMsg(err));
    } finally { setBusy(false); }
  };
  const input = 'input !pl-11';

  return (
    <div className="flex min-h-screen bg-[#f5f7f5]">
      <div className="relative hidden w-[46%] items-center overflow-hidden p-14 text-white md:flex">
        <img src="/bac1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/50 to-[#f5f7f5]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-md">
          <p className="mb-4 text-xs font-bold tracking-[0.3em] text-brand-gold">YOUR HOME. YOUR FUTURE.</p>
          <h1 className="mb-5 text-5xl font-bold leading-[1.08] tracking-tight">Find a place<br />you'll love<br />to call home.</h1>
          <p className="text-white/90">Discover apartments, houses and premium properties that match your lifestyle and budget.</p>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center px-5 py-10 md:w-[54%]">
        <div className="w-full max-w-[470px]">
          <Link to="/" className="mb-8 flex items-center justify-center gap-3 text-3xl font-bold text-brand-green">
            <BrandLogo />
            <span className="tracking-tight">Home<span className="text-brand-gold">Finder</span></span>
          </Link>

          {sent ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <StatusIcon tone="success"><Mail size={32} /></StatusIcon>
              <h2 className="mb-2 text-4xl font-bold text-brand-green">Check your email</h2>
              <p className="mb-2 text-sm leading-6 text-gray-500">We sent a verification link to <strong className="text-gray-800">{sent.email}</strong>. Click it within 24 hours to activate your account, then log in.</p>
              <p className="mb-6 text-xs text-gray-400">Can't find it? Look in your spam folder.</p>
              {sent.emailSent === false && (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-left text-xs leading-5 text-amber-800">We couldn't send the email just now. Your account is saved — press the button below to try again.</p>
              )}
              <div className="text-left"><ResendVerification email={sent.email} /></div>
              <button onClick={() => { setSent(null); setMode('login'); }} className="mt-5 text-sm font-semibold text-brand-gold">Back to login</button>
            </motion.div>
          ) : (
            <>
              <div className="mb-8 flex border-b">
                {['login', 'signup'].map((m) => (
                  <button key={m} onClick={() => { setMode(m); setUnverified(''); }} className={`relative w-1/2 py-3 font-semibold ${mode === m ? 'text-gray-900' : 'text-gray-400'}`}>
                    {m === 'login' ? 'Login' : 'Sign Up'}{mode === m && <motion.i layoutId="tab" className="absolute inset-x-[15%] -bottom-px h-[3px] rounded bg-brand-gold" />}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.form key={mode} onSubmit={submit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="mb-1 text-4xl font-bold text-brand-green">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                  <p className="mb-6 text-sm text-gray-500">{mode === 'login' ? 'Login to continue your HomeFinder journey.' : 'Join HomeFinder and find your perfect property.'}</p>

                  {unverified && (
                    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="mb-1 text-sm font-semibold text-amber-900">Please verify your email first</p>
                      <p className="mb-3 text-xs leading-5 text-amber-800">Your password is correct, but <strong>{unverified}</strong> hasn't been verified yet. Open the link we emailed you (check spam too), or get a new one.</p>
                      <ResendVerification key={unverified} email={unverified} />
                    </div>
                  )}

                  {mode === 'signup' && <Field icon={User} label="Full Name"><input className={input} required placeholder="Enter your full name" value={f.name} onChange={set('name')} /></Field>}
                  <Field icon={Mail} label="Email Address"><input className={input} type="email" required autoComplete="email" placeholder="Enter your email" value={f.email} onChange={set('email')} /></Field>
                  {mode === 'signup' && <>
                    <Field icon={Phone} label="Phone Number"><input className={input} type="tel" required placeholder="Enter your phone number" value={f.phone} onChange={set('phone')} /></Field>
                    <Field icon={BadgeCheck} label="Account Type"><select className={input} required value={f.accountType} onChange={set('accountType')}><option value="">Select account type</option>{types.map((t) => <option key={t}>{t}</option>)}</select></Field>
                  </>}
                  <Field icon={Lock} label="Password">
                    <input className={input} type={show ? 'text' : 'password'} required minLength={mode === 'signup' ? 8 : undefined} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'} value={f.password} onChange={set('password')} />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-[15px] text-gray-400" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </Field>
                  {mode === 'signup' && <p className="-mt-2 mb-4 text-xs text-gray-400">At least 8 characters, with letters and numbers.</p>}
                  {mode === 'login' && (
                    <div className="-mt-2 mb-4 text-right">
                      <Link to="/forgot-password" state={{ email: f.email }} className="text-[13px] font-semibold text-brand-gold">Forgot password?</Link>
                    </div>
                  )}
                  {mode === 'signup' && <Field icon={ShieldCheck} label="Confirm Password"><input className={input} type="password" required autoComplete="new-password" placeholder="Confirm your password" value={f.confirm} onChange={set('confirm')} /></Field>}

                  <button disabled={busy} className="btn !h-[52px] w-full bg-[#18251f] text-white hover:bg-[#2b4036]">{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'} <ArrowRight size={17} /></button>

                  {mode === 'login' && (<>
                    <div className="my-5 flex items-center gap-3 text-xs text-gray-400"><i className="h-px flex-1 bg-gray-200" />OR<i className="h-px flex-1 bg-gray-200" /></div>
                    <button type="button" onClick={() => toast('Google sign-in is not set up yet')} className="btn w-full border border-gray-200 bg-white !py-3 text-gray-600 hover:bg-gray-50">Continue with Google</button>
                  </>)}
                  <p className="mt-5 text-center text-sm text-gray-500">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setUnverified(''); }} className="font-semibold text-brand-gold">{mode === 'login' ? 'Create one' : 'Login'}</button>
                  </p>
                </motion.form>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
