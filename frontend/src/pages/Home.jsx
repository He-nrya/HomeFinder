import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReactTyped } from 'react-typed';
import { Building, KeyRound, GraduationCap, PlusSquare, ChevronLeft, ChevronRight, ShieldCheck, MapPinned, MessageCircle, Star } from 'lucide-react';
import api from '../api';
import SearchBox from '../components/SearchBox';
import Reveal from '../components/Reveal';
import BrandLogo from '../components/BrandLogo';
import PropertyCard, { CardSkeleton } from '../components/PropertyCard';

const cats = [
  [KeyRound, 'Homes for Rent', 'Find comfortable homes and apartments for rent.', '/rent'],
  [Building, 'Properties for Sale', 'Browse houses and apartments to own.', '/buy'],
  [GraduationCap, 'Student Housing', 'Hostels and self-contains near your campus.', '/student'],
  [PlusSquare, 'List Your Property', 'Reach thousands of buyers and tenants.', '/dashboard?tab=add'],
];
const how = [[MapPinned, 'Search & explore', 'Filter by location, price and type — and see every home on the map.'], [MessageCircle, 'Chat live', 'Message owners instantly or jump straight to WhatsApp.'], [ShieldCheck, 'Move in safely', 'Look for verified listings reviewed by our admin team.']];
const reviews = [['Amina O.', 'UniAbuja student', 'Found a self-contain five minutes from campus in one afternoon.'], ['Chidi E.', 'First-time buyer', 'The live chat with the seller saved me weeks of back-and-forth.'], ['Fatima B.', 'Landlady', 'Listing my flats was easy and the enquiries started the same day.']];
const audiences = [
  ['Students', 'Find rooms and shared housing close to campus.'],
  ['Professionals', 'Explore homes that fit your work, location and lifestyle.'],
  ['Families', 'Discover space to settle in, grow and feel at home.'],
  ['Luxury home seekers', 'Browse distinctive properties with the features you value.'],
];

const letterVariants = {
  hidden: { opacity: 0, y: 7 },
  visible: {
    opacity: 1,
    y: 0,
    textShadow: ['0 0 12px rgba(245, 158, 11, 0.9)', '0 0 0 rgba(245, 158, 11, 0)'],
    transition: { duration: 0.32, ease: 'easeOut' },
  },
};

function AnimatedText({ children, className = '' }) {
  const words = children.split(' ');
  return (
    <motion.span
      className={className}
      role="text"
      aria-label={children}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.65 }}
      variants={{ visible: { transition: { staggerChildren: 0.012 } } }}
    >
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span className={`inline-block whitespace-nowrap ${wordIndex < words.length - 1 ? 'mr-[0.25em]' : ''}`} key={`${word}-${wordIndex}`}>
            {Array.from(word).map((letter, letterIndex) => (
              <motion.span className="inline-block" variants={letterVariants} key={`${letter}-${letterIndex}`}>{letter}</motion.span>
            ))}
          </span>
        ))}
      </span>
    </motion.span>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [r, setR] = useState(0);
  const rail = useRef(null);
  useEffect(() => { api.get('/properties?limit=8&sort=popular').then((x) => setFeatured(x.data.items)).catch(() => setFeatured([])); }, []);
  useEffect(() => { const t = setInterval(() => setR((i) => (i + 1) % reviews.length), 4500); return () => clearInterval(t); }, []);
  const scroll = (d) => rail.current?.scrollBy({ left: d * 340, behavior: 'smooth' });

  return (
    <>
      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden px-5 py-16 text-center text-white">
        <motion.img src="/bac1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 8 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative w-full max-w-5xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 text-xs font-bold tracking-[0.3em] text-brand-gold">YOUR HOME. YOUR FUTURE.</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
            <span className="block">Find a Place You&apos;ll
              <span className="inline-block min-w-[5.5rem] align-middle text-brand-gold">
                <ReactTyped
                  strings={['Like', 'Adore', 'Love']}
                  typeSpeed={90}
                  backSpeed={60}
                  backDelay={1200}
                  loop
                  smartBackspace
                />
              </span>
            </span>
            <span className="block">to Call <span className="text-brand-gold">Home.</span></span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mx-auto mb-8 max-w-2xl text-lg text-gray-200">Discover affordable homes, modern apartments and exclusive properties in your preferred location.</motion.p>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}><SearchBox /></motion.div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-9">
        <Reveal><h2 className="text-3xl font-bold">What are you looking for?</h2><p className="mb-8 text-gray-500">Find the right property for your needs.</p></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cats.map(([Icon, t, d, to], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <Link to={to} className="card group block h-full p-7 text-center transition hover:-translate-y-2 hover:border-brand-gold hover:shadow-xl">
                <Icon className="mx-auto mb-3 text-brand-green transition group-hover:scale-110 group-hover:text-brand-gold" size={38} />
                <h5 className="font-bold">{t}</h5><p className="mt-1 text-sm text-gray-500">{d}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 pb-14 md:px-9">
        <div className="mb-6 flex items-end justify-between">
          <Reveal><span className="text-xs font-bold tracking-widest text-brand-green">TRENDING</span><h2 className="text-3xl font-bold">Featured Properties</h2></Reveal>
          <div className="hidden gap-2 sm:flex">{[-1, 1].map((d) => <button key={d} onClick={() => scroll(d)} className="rounded-full border bg-white p-2 hover:bg-brand-green hover:text-white">{d < 0 ? <ChevronLeft /> : <ChevronRight />}</button>)}</div>
        </div>
        <div ref={rail} className="-mx-2 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-4 [scrollbar-width:none]">
          {(featured || [1, 2, 3]).map((p, i) => (
            <div key={p._id || i} className="w-[310px] shrink-0 snap-start">{featured ? <PropertyCard p={p} /> : <CardSkeleton />}</div>
          ))}
        </div>
        {featured?.length === 0 && <p className="text-gray-400">No listings yet — be the first to list a property!</p>}
      </section>

      <section className="bg-white px-5 py-14 md:px-9">
        <Reveal><h2 className="mb-8 text-center text-3xl font-bold">How HomeFinder works</h2></Reveal>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {how.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 0.1} className="rounded-2xl bg-brand-soft p-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-brand-gold"><Icon /></div>
              <h4 className="font-bold">{t}</h4><p className="mt-1 text-sm text-gray-600">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 py-14 md:px-9">
        <div className="mx-auto max-w-2xl text-center">
          <Star className="mx-auto mb-3 fill-brand-gold text-brand-gold" />
          <motion.div key={r} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-xl italic text-gray-700">“{reviews[r][2]}”</p>
            <p className="mt-3 font-bold text-brand-green">{reviews[r][0]} <span className="font-normal text-gray-400">· {reviews[r][1]}</span></p>
          </motion.div>
          <div className="mt-4 flex justify-center gap-2">{reviews.map((_, i) => <button key={i} onClick={() => setR(i)} className={`h-2 rounded-full transition-all ${i === r ? 'w-6 bg-brand-green' : 'w-2 bg-gray-300'}`} />)}</div>
        </div>
      </section>

      <section className="mx-5 mb-12 overflow-hidden rounded-2xl bg-brand-green px-6 py-14 text-center text-white md:mx-9">
        <img src="/logo1.png" alt="" className="mx-auto mb-2 h-28 animate-float" />
        <h2 className="text-3xl font-bold">Own a property? List it today</h2>
        <p className="mx-auto mt-2 max-w-xl text-green-100">Reach thousands of students, tenants and buyers across Nigeria.</p>
        <Link to="/dashboard?tab=add" className="btn-gold mt-5">List Your Property</Link>
      </section>

      <section className="border-t border-gray-200 bg-white px-5 py-16 md:px-9 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 border-b border-gray-200 pb-10 md:grid-cols-[1fr_1.2fr] md:items-end md:gap-16">
            <div>
              <div className="mb-5 flex items-center gap-2 text-xl font-bold text-brand-green">
                <BrandLogo />
                <span>Home<span className="text-brand-gold">Finder</span></span>
              </div>
              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-green">HOMEFINDER, FOR EVERYONE</p>
              <h2 className="text-3xl font-extrabold leading-tight text-brand-ink sm:text-4xl">
                <AnimatedText>A Place for Every Next Chapter</AnimatedText>
              </h2>
            </div>
            <p className="leading-7 text-gray-600">
              <AnimatedText>Home means something different to everyone. HomeFinder brings together places for students starting out, professionals looking for convenience, families ready for more room, and people searching for a distinctive or luxury home. Whether you want to rent, buy, or find student accommodation, explore by location, price, and property type, view places on the map, and connect with property owners to take the next step toward a place that feels like yours.</AnimatedText>
            </p>
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(([title, description], index) => (
              <div key={title} className="border-b border-gray-200 py-6 lg:border-b-0">
                <p className="mb-3 text-sm font-bold tabular-nums text-brand-gold">0{index + 1}</p>
                <h3 className="mb-2 font-bold text-brand-green"><AnimatedText>{title}</AnimatedText></h3>
                <p className="text-sm leading-6 text-gray-600"><AnimatedText>{description}</AnimatedText></p>
              </div>
            ))}
          </div>
          <Link to="/properties" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-green transition hover:text-brand-gold">
            Whatever home means to you, start finding it on HomeFinder <ChevronRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
