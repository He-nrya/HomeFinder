import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Map, LayoutGrid, SearchX, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../api';
import PropertyCard, { CardSkeleton } from '../components/PropertyCard';
import MapView from '../components/MapView';
import Reveal from '../components/Reveal';

const copy = {
  sale: ['FIND YOUR DREAM HOME', 'Properties For Sale', 'Explore quality houses and apartments available for purchase in desirable locations.'],
  rent: ['RENT WITH CONFIDENCE', 'Properties For Rent', 'Comfortable homes and apartments ready for you to move in.'],
  student: ['CAMPUS LIVING', 'Student Accommodation', 'Safe, affordable rooms, hostels and self-contains close to your university.'],
  '': ['EXPLORE EVERYTHING', 'All Properties', 'Every approved listing on HomeFinder in one place.'],
};
const rentPhotos = [
  { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1500&q=85', alt: 'Modern home with a landscaped front garden' },
  { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1500&q=85', alt: 'Contemporary family home framed by greenery' },
  { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=85', alt: 'Bright, comfortable living room in a modern home' },
  { src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1500&q=85', alt: 'Welcoming home exterior with a covered entry' },
];
const types = { sale: ['Duplex', 'Apartment', 'Bungalow', 'Terrace House'], rent: ['Apartment', 'Self Contain', 'Duplex'], student: ['Single Room', 'Self Contain', 'Shared Apartment', 'Hostel', '2 Bedroom'], '': [] };
const unis = ['University of Abuja', 'Nile University', 'Baze University', 'University of Lagos', 'University of Ibadan', 'Obafemi Awolowo University', 'University of Nigeria', 'Ahmadu Bello University'];
const prices = { sale: [[50000000, 'Under ₦50M'], [100000000, 'Under ₦100M'], [200000000, 'Under ₦200M']], default: [[300000, 'Under ₦300K'], [500000, 'Under ₦500K'], [1000000, 'Under ₦1M'], [5000000, 'Under ₦5M']] };

export default function Listings({ category }) {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState(null);
  const [map, setMap] = useState(false);
  const [show, setShow] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const f = Object.fromEntries(sp);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); n.delete('page'); setSp(n); };
  const [kicker, title, sub] = copy[category];
  const titleBreak = title.lastIndexOf(' ');
  const titleLead = title.slice(0, titleBreak);
  const titleAccent = title.slice(titleBreak + 1);

  useEffect(() => {
    setData(null);
    api.get('/properties', { params: { ...f, category: category || undefined, limit: map ? 30 : 9 } })
      .then((r) => setData(r.data)).catch(() => setData({ items: [], total: 0, pages: 1 }));
    // eslint-disable-next-line
  }, [sp.toString(), category, map]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhotoIndex((index) => (index + 1) % rentPhotos.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const page = Number(f.page || 1);
  return (
    <>
      <header className="relative isolate flex min-h-[230px] items-center justify-center overflow-hidden bg-gray-900 px-5 py-4 text-center sm:min-h-[250px] md:min-h-[270px]">
        <div className="absolute inset-0 -z-10" aria-label="Featured homes">
          <img
            key={photoIndex}
            src={rentPhotos[photoIndex].src}
            alt={rentPhotos[photoIndex].alt}
            className={`h-full w-full object-cover ${photoIndex % 2 === 0 ? 'rent-photo-zoom-in' : 'rent-photo-zoom-out'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/15" />
        </div>
        <Reveal className="mx-auto max-w-4xl py-5 text-white">
          <span className="inline-flex items-center rounded-sm border-l-2 border-brand-gold bg-black/45 px-3 py-1 text-xs font-bold tracking-[0.2em] text-brand-gold">{kicker}</span>
          <h1 className="my-3 text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">{titleLead} <span className="text-brand-gold">{titleAccent}</span></h1>
          <p className="mx-auto max-w-xl leading-7 text-white/90">{sub}</p>
        </Reveal>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent px-5 pb-5 pt-12 sm:px-8">
          <span className="text-sm font-semibold text-white">Find your place to feel at home</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tabular-nums text-white">
              {String(photoIndex + 1).padStart(2, '0')} / {String(rentPhotos.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              aria-label="Previous home photo"
              onClick={() => setPhotoIndex((photoIndex + rentPhotos.length - 1) % rentPhotos.length)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-800 transition hover:bg-white"
            ><ArrowLeft size={17} /></button>
            <button
              type="button"
              aria-label="Next home photo"
              onClick={() => setPhotoIndex((photoIndex + 1) % rentPhotos.length)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-800 transition hover:bg-white"
            ><ArrowRight size={17} /></button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto -mt-7 max-w-6xl px-4">
        <div className="rounded-2xl bg-white p-5 shadow-xl">
          <div className={`grid gap-3 ${category === 'student' ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
            <input className="input md:col-span-2" placeholder="Search location, title or campus" value={f.q || ''} onChange={(e) => set('q', e.target.value)} />
            {types[category].length > 0 && <select className="input" value={f.type || ''} onChange={(e) => set('type', e.target.value)}><option value="">All Types</option>{types[category].map((t) => <option key={t}>{t}</option>)}</select>}
            {category === 'student' && <select className="input" value={f.university || ''} onChange={(e) => set('university', e.target.value)}><option value="">All Universities</option>{unis.map((u) => <option key={u}>{u}</option>)}</select>}
            <select className="input" value={f.maxPrice || ''} onChange={(e) => set('maxPrice', e.target.value)}><option value="">Any Price</option>{(prices[category] || prices.default).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <select className="input" value={f.sort || 'new'} onChange={(e) => set('sort', e.target.value)}>
              <option value="new">Newest</option><option value="price-asc">Price: Low → High</option><option value="price-desc">Price: High → Low</option><option value="popular">Most viewed</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-500"><SlidersHorizontal size={15} className="mr-1 inline" /> Showing <b className="text-brand-green">{data?.total ?? '…'}</b> available properties</p>
          <button onClick={() => setMap(!map)} className="btn-outline !py-2">{map ? <><LayoutGrid size={15} /> Grid</> : <><Map size={15} /> Map</>}</button>
        </div>

        {map && data && <div className="mb-8"><MapView properties={data.items} height={460} zoom={11} /></div>}

        {!data ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : data.items.length === 0 ? (
          <div className="py-20 text-center"><SearchX size={56} className="mx-auto text-brand-gold" /><h3 className="mt-3 text-xl font-bold text-brand-green">No properties found</h3><button onClick={() => setSp({})} className="btn-green mt-4">Reset filters</button></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p, i) => <Reveal key={p._id} delay={(i % 3) * 0.07} className="h-full"><PropertyCard p={p} /></Reveal>)}
          </div>
        )}

        {data?.pages > 1 && !map && (
          <div className="mt-10 flex justify-center gap-2">
            {[...Array(data.pages)].map((_, i) => (
              <button key={i} onClick={() => { const n = new URLSearchParams(sp); n.set('page', i + 1); setSp(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`h-10 w-10 rounded-lg font-semibold ${page === i + 1 ? 'bg-brand-green text-white' : 'bg-white shadow-sm hover:bg-brand-soft'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
