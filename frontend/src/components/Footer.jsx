import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';
export default function Footer() {
  return (
    <footer className="bg-brand-ink px-6 py-12 text-gray-400">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xl font-bold text-white"><BrandLogo /><span>Home<span className="text-brand-gold">Finder</span></span></h4>
          <p className="text-sm leading-7">Helping you find the right place to call home. Discover properties, connect with agents and make better housing decisions.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <h5 className="mb-2 font-semibold text-white">Quick Links</h5>
          {[['/', 'Home'], ['/buy', 'Buy'], ['/rent', 'Rent'], ['/dashboard?tab=add', 'Sell Property'], ['/student', 'Student Housing']].map(([to, t]) => <Link key={t} to={to} className="hover:text-white">{t}</Link>)}
        </div>
        <div className="space-y-2 text-sm">
          <h5 className="mb-2 font-semibold text-white">Contact Us</h5>
          <p className="flex items-center gap-2"><Phone size={15} /> +234 800 000 0000</p>
          <p className="flex items-center gap-2"><Mail size={15} /> info@homefinder.com</p>
        </div>
      </div>
      <hr className="mx-auto my-8 max-w-6xl border-gray-800" />
      <p className="text-center text-xs">© {new Date().getFullYear()} HomeFinder. All Rights Reserved.</p>
    </footer>
  );
}
