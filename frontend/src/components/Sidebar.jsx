import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingCart, Key, PlusSquare, GraduationCap, User, Heart, Clock, MessageCircle, Settings, HelpCircle, X } from 'lucide-react';

const main = [[Home, 'Home', '/'], [Search, 'Find Accommodation', '/properties'], [ShoppingCart, 'Buy Property', '/buy'], [Key, 'Rent Property', '/rent'], [PlusSquare, 'Sell / List Property', '/dashboard?tab=add'], [GraduationCap, 'UNI / NYSC Student Accommodation', '/student']];
const acct = [[User, 'My Profile', '/dashboard'], [Heart, 'Saved Properties', '/dashboard?tab=saved'], [Clock, 'Recently Viewed', '/properties?sort=popular'], [MessageCircle, 'My Enquiries', '/dashboard?tab=messages'], [Settings, 'Settings', '/dashboard'], [HelpCircle, 'Help & Support', '/']];

const Group = ({ title, items, onClose }) => (
  <>
    <p className="mx-4 mb-2 mt-4 text-xs font-bold uppercase text-gray-400">{title}</p>
    {items.map(([Icon, label, to]) => (
      <NavLink key={label} to={to} onClick={onClose} end className={({ isActive }) => `mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-brand-soft hover:text-brand-green ${isActive && !to.includes('?') ? 'bg-brand-soft text-brand-green' : ''}`}>
        <Icon size={18} /> {label}
      </NavLink>
    ))}
  </>
);

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-[890] bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-[70px] z-[900] h-[calc(100vh-70px)] w-[250px] overflow-y-auto border-r border-gray-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={onClose} className="absolute right-3 top-3 lg:hidden"><X size={18} /></button>
        <Group title="Main Menu" items={main} onClose={onClose} />
        <Group title="My Account" items={acct} onClose={onClose} />
      </aside>
    </>
  );
}
