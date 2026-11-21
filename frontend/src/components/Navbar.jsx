import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Plus, Bell, UserCircle, Building2, MessageCircle, Heart, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BrandLogo = () => (
  <div className="flex h-12 w-12 items-center justify-center overflow-visible">
    <svg viewBox="0 0 120 120" className="h-12 w-12 drop-shadow-[0_5px_12px_rgba(245,158,11,0.35)]" aria-label="HomeFinder logo" role="img">
      <defs>
        <linearGradient id="goldBrand" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#fff9e6" />
          <stop offset="22%" stopColor="#f5d678" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="82%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#a85c00" />
        </linearGradient>
      </defs>

      <path d="M22 58 L60 29 L98 58" fill="none" stroke="url(#goldBrand)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 54 V84 H88 V54" fill="url(#goldBrand)" stroke="#9a5300" strokeWidth="1.5" />
      <path d="M48 62 H72 V84 H48z" fill="#fff9e6" opacity="0.96" />
      <path d="M75 36c-13 0-23 10-23 23 0 11 8 20 19 22l-2 10h10l-2-10c11-2 19-11 19-22 0-13-10-23-23-23zm0 11c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" fill="none" stroke="url(#goldBrand)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M76 57h25v18c0 9-7 16-16 16s-16-7-16-16V57z" fill="none" stroke="url(#goldBrand)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M90 62h10" stroke="#fff9e6" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <circle cx="100" cy="62" r="5.5" fill="#fff9e6" opacity="0.9" />
    </svg>
  </div>
);

const links = [['/', 'Home'], ['/buy', 'Buy'], ['/rent', 'Rent'], ['/student', 'Student'], ['/properties', 'Properties']];
const notes = [
  [Building2, 'New property available', 'A new 2-bedroom apartment has been listed in Abuja.', '5 minutes ago'],
  [Heart, 'Property saved', 'Your favourite property has been updated.', '1 hour ago'],
  [MessageCircle, 'New message', 'You received a message from a property agent.', '2 hours ago'],
];

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const [bell, setBell] = useState(false);
  const [me, setMe] = useState(false);
  const nav = useNavigate();
  return (
    <nav className="fixed inset-x-0 top-0 z-[1000] flex h-[70px] items-center border-b border-gray-200 bg-white px-4 lg:px-6">
      <button onClick={onMenu} className="mr-3 lg:hidden" aria-label="Menu"><Menu /></button>
      <Link to="/" className="flex min-w-0 items-center gap-1 text-xl font-bold text-brand-green sm:gap-2 sm:text-2xl">
        <BrandLogo />
        <span className="truncate tracking-tight">Home<span className="text-brand-gold">Finder</span></span>
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <div className="hidden items-center lg:flex">
          {links.map(([to, t]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mx-1 rounded-md px-2 py-1 font-medium transition hover:text-brand-green ${isActive ? 'text-brand-green' : 'text-gray-700'}`}>{t}</NavLink>
          ))}
          <Link to="/dashboard?tab=add" className="btn-green ml-3"><Plus size={16} /> List Property</Link>
        </div>

        <div className="relative">
          <button onClick={() => { setBell(!bell); setMe(false); }} className="relative h-11 w-11 rounded-full text-gray-700 hover:bg-brand-soft"><Bell className="mx-auto" size={21} />
            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">3</span>
          </button>
          {bell && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[360px] rounded-xl bg-white p-4 shadow-2xl">
              <div className="flex justify-between border-b pb-2"><h6 className="font-bold">Notifications</h6><button onClick={() => setBell(false)} className="text-xs text-brand-green">Mark all as read</button></div>
              {notes.map(([Icon, t, d, time]) => (
                <div key={t} className="flex gap-3 rounded-lg p-2 hover:bg-gray-50">
                  <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-brand-soft text-brand-green"><Icon size={17} /></div>
                  <div><strong className="text-sm">{t}</strong><p className="text-xs text-gray-500">{d}</p><small className="text-[10px] text-gray-400">{time}</small></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <div className="relative">
            <button onClick={() => { setMe(!me); setBell(false); }} className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium hover:bg-brand-soft"><UserCircle size={26} /><span className="hidden sm:inline">{user.name.split(' ')[0]}</span></button>
            {me && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-2 text-sm shadow-2xl" onClick={() => setMe(false)}>
                <Link to="/dashboard" className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50"><LayoutDashboard size={16} /> My Dashboard</Link>
                {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50"><Shield size={16} /> Admin</Link>}
                <button onClick={() => { logout(); nav('/'); }} className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-red-600 hover:bg-gray-50"><LogOut size={16} /> Log out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="btn-green !px-3 !py-2 text-xs sm:text-sm">Sign up / in</Link>
        )}
      </div>
    </nav>
  );
}
