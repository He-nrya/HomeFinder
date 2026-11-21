// Gold house-and-key logo (moved out of Auth.jsx so every auth page can share it).
export default function BrandLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-visible">
      <svg viewBox="0 0 120 120" className="h-12 w-12 drop-shadow-[0_5px_12px_rgba(245,158,11,0.35)]" aria-label="HomeFinder logo" role="img">
        <defs>
          <linearGradient id="goldBrandAuth" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fff9e6" />
            <stop offset="22%" stopColor="#f5d678" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="82%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#a85c00" />
          </linearGradient>
        </defs>

        <path d="M22 58 L60 29 L98 58" fill="none" stroke="url(#goldBrandAuth)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 54 V84 H88 V54" fill="url(#goldBrandAuth)" stroke="#9a5300" strokeWidth="1.5" />
        <path d="M48 62 H72 V84 H48z" fill="#fff9e6" opacity="0.96" />
        <path d="M76 36c-13 0-23 10-23 23 0 11 8 20 19 22l-2 10h10l-2-10c11-2 19-11 19-22 0-13-10-23-23-23zm0 11c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" fill="none" stroke="url(#goldBrandAuth)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M76 57h25v18c0 9-7 16-16 16s-16-7-16-16V57z" fill="none" stroke="url(#goldBrandAuth)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 62h10" stroke="#fff9e6" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <circle cx="100" cy="62" r="5.5" fill="#fff9e6" opacity="0.9" />
      </svg>
    </div>
  );
}
