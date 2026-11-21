import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BedDouble, Bath, Car, MapPin, MessageCircle, Phone, Check, Eye, BadgeCheck, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { priceLabel, wa, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import ChatBox from '../components/ChatBox';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [img, setImg] = useState(0);
  const [chat, setChat] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); api.get(`/properties/${id}`).then((r) => setP(r.data)).catch((e) => { toast.error(errMsg(e)); nav('/properties'); }); }, [id, nav]);
  useEffect(() => { if (chat) chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [chat]);
  if (!p) return <div className="mx-auto max-w-6xl p-8"><div className="skeleton h-96 rounded-2xl" /></div>;

  const imgs = p.images?.length ? p.images : [{ url: '/fh1.jpg' }];
  const { lat, lng } = p.location || {};
  const isOwner = user && p.owner?._id === user.id;
  const openChat = () => (user ? setChat(true) : (toast('Log in to chat with the owner'), nav('/auth')));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {p.status !== 'approved' && <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">This listing is <b>{p.status}</b> and only visible to you.</div>}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl"><img src={imgs[img].url} alt={p.title} className="h-[260px] w-full object-cover sm:h-[420px]" /></div>
          <div className="mt-3 flex gap-2 overflow-x-auto">{imgs.map((im, i) => <button key={i} onClick={() => setImg(i)}><img src={im.url} alt="" className={`h-16 w-24 rounded-lg object-cover ${i === img ? 'ring-2 ring-brand-green' : 'opacity-70'}`} /></button>)}</div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold">{p.title} {p.verified && <BadgeCheck className="inline text-brand-green" />}</h1>
              <p className="mt-1 flex items-center gap-1 text-gray-500"><MapPin size={16} className="text-brand-gold" />{p.location?.address}</p>
            </div>
            <div className="text-right"><p className="text-3xl font-extrabold text-brand-green">{priceLabel(p)}</p><p className="flex items-center justify-end gap-1 text-xs text-gray-400"><Eye size={13} /> {p.views} views</p></div>
          </div>

          <div className="my-5 flex flex-wrap gap-5 border-y py-4 text-sm">
            <span className="flex items-center gap-1"><BedDouble size={17} className="text-brand-green" />{p.bedrooms} Bedrooms</span>
            <span className="flex items-center gap-1"><Bath size={17} className="text-brand-green" />{p.bathrooms} Bathrooms</span>
            {p.category !== 'student' && <span className="flex items-center gap-1"><Car size={17} className="text-brand-green" />{p.parking} Parking</span>}
            {p.university && <span>🎓 {p.university} · {p.distanceToCampus}</span>}
          </div>

          <h3 className="mb-2 text-lg font-bold">About this property</h3>
          <p className="leading-8 text-gray-600">{p.description}</p>
          {p.features?.length > 0 && <div className="mt-5 grid grid-cols-2 gap-2 text-sm">{p.features.map((f) => <span key={f} className="flex items-center gap-2"><Check size={15} className="text-brand-green" />{f}</span>)}</div>}

          <h3 className="mb-2 mt-8 text-lg font-bold"><MapPin className="inline text-brand-green" size={18} /> Location details</h3>
          <p className="mb-4 text-gray-600">{p.nearby || p.location?.address}</p>
          {lat && lng ? (
            <>
              <MapView properties={[p]} center={{ lat, lng }} zoom={15} height={320} />
              <a className="btn-outline mt-3" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}><Navigation size={15} /> Get directions</a>
            </>
          ) : <p className="text-sm text-gray-400">The owner hasn't pinned this property on the map.</p>}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h4 className="mb-1 font-bold">Contact {p.owner?.name || 'the owner'}</h4>
            <p className="mb-4 text-sm text-gray-500">{p.owner?.accountType}</p>
            <a href={wa(p)} target="_blank" rel="noreferrer" className="btn mb-2 w-full bg-[#25D366] text-white hover:bg-[#1da851]"><MessageCircle size={17} /> WhatsApp</a>
            <a href={`tel:${p.contactPhone}`} className="btn-gold mb-2 w-full"><Phone size={17} /> {p.contactPhone}</a>
            {!isOwner && !chat && <button onClick={openChat} className="btn-green w-full"><MessageCircle size={17} /> Live chat</button>}
            {isOwner && <p className="text-xs text-gray-400">This is your listing. Replies appear under Messages in your dashboard.</p>}
          </div>
          {chat && user && <div ref={chatRef}><ChatBox room={`${p._id}:${user.id}`} title={`Chat · ${p.title}`} /></div>}
          <Link to={`/${p.category === 'sale' ? 'buy' : p.category}`} className="block text-center text-sm text-brand-green hover:underline">← Back to listings</Link>
        </aside>
      </div>
    </div>
  );
}
