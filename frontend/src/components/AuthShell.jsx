import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

// Centered card used by the verify / forgot / reset pages. Same logo and colours as the login page.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f5] px-4 py-10">
      <div className="w-full max-w-[470px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 text-3xl font-bold text-brand-green">
          <BrandLogo />
          <span className="tracking-tight">Home<span className="text-brand-gold">Finder</span></span>
        </Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {title && <h1 className="mb-1 text-3xl font-bold text-brand-green">{title}</h1>}
          {subtitle && <p className="mb-6 text-sm text-gray-500">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </div>
  );
}

// Round icon shown at the top of status screens (success / error / info).
export function StatusIcon({ tone = 'info', children }) {
  const tones = { success: 'bg-brand-soft text-brand-green', error: 'bg-red-50 text-red-600', info: 'bg-amber-50 text-brand-gold' };
  return <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}>{children}</div>;
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} role="status" aria-label="Loading" />;
}
