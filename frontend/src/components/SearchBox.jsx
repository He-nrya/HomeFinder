import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';

const tabs = [['sale', 'Buy', '/buy'], ['rent', 'Rent', '/rent'], ['student', 'Student Housing', '/student']];
export default function SearchBox() {
  const [tab, setTab] = useState(0);
  const [f, setF] = useState({ q: '', type: '', price: '', bedrooms: '' });
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = () => {
    const qs = new URLSearchParams();
    if (f.q) qs.set('q', f.q);
    if (f.type) qs.set('type', f.type);
    if (f.price) qs.set('maxPrice', f.price);
    if (f.bedrooms) qs.set('bedrooms', f.bedrooms);
    nav(`${tabs[tab][2]}?${qs}`);
  };
  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-white p-5 text-left text-gray-800 shadow-2xl">
      <div className="mb-4 flex gap-2">
        {tabs.map(([, t], i) => (
          <button key={t} onClick={() => setTab(i)} className={`border-b-[3px] px-4 py-2 font-bold transition ${tab === i ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400'}`}>{t}</button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-6">
        <div className="relative sm:col-span-2 md:col-span-2"><MapPin size={16} className="absolute left-3 top-4 text-brand-green" /><input className="input !pl-9" placeholder="Enter location" value={f.q} onChange={set('q')} onKeyDown={(e) => e.key === 'Enter' && go()} /></div>
        <select className="input" value={f.type} onChange={set('type')}>
          <option value="">Property Type</option>
          {['Apartment', 'Self Contain', 'Duplex', 'Bungalow', 'Terrace House', 'Hostel', 'Shared Apartment'].map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="input" value={f.price} onChange={set('price')}>
          <option value="">Max Price</option>
          {[[500000, 'Under ₦500K'], [1000000, 'Under ₦1M'], [5000000, 'Under ₦5M'], [50000000, 'Under ₦50M'], [100000000, 'Under ₦100M']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="input" value={f.bedrooms} onChange={set('bedrooms')}>
          <option value="">Bedrooms</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n === 4 ? '4+' : n} Bedroom{n > 1 ? 's' : ''}</option>)}
        </select>
        <button onClick={go} className="btn-green !h-12"><Search size={16} /> Search</button>
      </div>
    </div>
  );
}
