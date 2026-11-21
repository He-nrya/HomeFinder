import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, BedDouble, Bath, Car, MessageCircle, Phone, BadgeCheck, Footprints } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { cover, priceLabel, wa, errMsg } from '../api';

const tag = { sale: 'FOR SALE', rent: 'FOR RENT', student: 'STUDENT' };

export default function PropertyCard({ p }) {
  const { user, toggleFavorite } = useAuth();
  const nav = useNavigate();
  const liked = user?.favorites?.includes(p._id);
  const like = async (e) => {
    e.preventDefault();
    if (!user) { toast('Log in to save properties'); return nav('/auth'); }
    try { await toggleFavorite(p._id); } catch (err) { toast.error(errMsg(err)); }
  };
  return (
    <motion.div whileHover={{ y: -6 }} className="card flex h-full flex-col transition-shadow hover:shadow-xl">
      <Link to={`/property/${p._id}`} className="group relative block h-56 overflow-hidden">
        <img src={cover(p)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        <span className="absolute left-4 top-4 rounded-full bg-brand-green px-3 py-1 text-[11px] font-bold text-white">{tag[p.category]}</span>
        {p.verified && <span className="absolute bottom-3 left-4 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[11px] font-bold text-brand-green"><BadgeCheck size={13} /> Verified</span>}
        <button onClick={like} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:scale-110" aria-label="Save">
          <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : 'text-brand-green'} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug text-gray-900">{p.title}</h3>
          <span className="whitespace-nowrap text-lg font-extrabold text-brand-green">{priceLabel(p)}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} className="text-brand-gold" /> {p.location?.address}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">{p.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 border-y border-gray-100 py-3 text-xs text-gray-600">
          <span className="flex items-center gap-1"><BedDouble size={14} className="text-brand-green" /> {p.bedrooms} Bed</span>
          <span className="flex items-center gap-1"><Bath size={14} className="text-brand-green" /> {p.bathrooms} Bath</span>
          {p.category !== 'student' && <span className="flex items-center gap-1"><Car size={14} className="text-brand-green" /> {p.parking} Parking</span>}
          {p.distanceToCampus && <span className="flex items-center gap-1"><Footprints size={14} className="text-brand-green" /> {p.distanceToCampus}</span>}
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <Link to={`/property/${p._id}`} className="btn-green flex-1 !py-2 text-xs">View Details</Link>
          <a href={wa(p)} target="_blank" rel="noreferrer" className="btn bg-[#25D366] !px-3 !py-2 text-white hover:bg-[#1da851]" aria-label="WhatsApp"><MessageCircle size={16} /></a>
          <a href={`tel:${p.contactPhone}`} className="btn-gold !px-3 !py-2" aria-label="Call"><Phone size={16} /></a>
        </div>
      </div>
    </motion.div>
  );
}

export const CardSkeleton = () => (
  <div className="card"><div className="skeleton h-56" /><div className="space-y-3 p-5"><div className="skeleton h-5 w-3/4 rounded" /><div className="skeleton h-4 w-1/2 rounded" /><div className="skeleton h-12 rounded" /></div></div>
);
