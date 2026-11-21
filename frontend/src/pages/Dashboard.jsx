import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, priceLabel, cover } from '../api';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import ChatBox from '../components/ChatBox';

const typeOpts = { sale: ['Duplex', 'Apartment', 'Bungalow', 'Terrace House'], rent: ['Apartment', 'Self Contain', 'Duplex'], student: ['Single Room', 'Self Contain', 'Shared Apartment', 'Hostel', '2 Bedroom'] };
const blank = { title: '', description: '', category: 'sale', type: 'Duplex', price: '', address: '', city: 'Abuja', lat: '', lng: '', bedrooms: 1, bathrooms: 1, parking: 0, features: '', nearby: '', university: '', distanceToCampus: '', contactPhone: '', whatsapp: '' };
const badge = { approved: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' };

const F = ({ f, set, k, label, ...r }) => <div><label className="label">{label}</label><input className="input" value={f[k]} onChange={set(k)} {...r} /></div>;

function PropertyForm({ initial, onDone, onCancel }) {
  const [f, setF] = useState(() => initial ? { ...blank, ...initial, address: initial.location?.address || '', city: initial.location?.city || 'Abuja', lat: initial.location?.lat || '', lng: initial.location?.lng || '', features: (initial.features || []).join(', ') } : blank);
  const [files, setFiles] = useState([]);
  const [remove, setRemove] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const existing = (initial?.images || []).filter((i) => !remove.includes(i.publicId));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    ['title', 'description', 'category', 'type', 'price', 'address', 'city', 'lat', 'lng', 'bedrooms', 'bathrooms', 'parking', 'features', 'nearby', 'university', 'distanceToCampus', 'contactPhone', 'whatsapp'].forEach((k) => fd.append(k, f[k] ?? ''));
    files.forEach((x) => fd.append('images', x));
    if (remove.length) fd.append('removeImages', JSON.stringify(remove));
    try {
      const { data } = initial ? await api.put(`/properties/${initial._id}`, fd) : await api.post('/properties', fd);
      toast.success(data.status === 'pending' ? 'Saved! Waiting for admin approval.' : 'Saved!');
      onDone();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <h3 className="text-xl font-bold">{initial ? 'Edit listing' : 'List a property'}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <F f={f} set={set} k="title" label="Title" required />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">For</label><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, type: typeOpts[e.target.value][0] })}><option value="sale">Sale</option><option value="rent">Rent</option><option value="student">Student</option></select></div>
          <div><label className="label">Type</label><select className="input" value={f.type} onChange={set('type')}>{typeOpts[f.category].map((t) => <option key={t}>{t}</option>)}</select></div>
        </div>
        <F f={f} set={set} k="price" label={f.category === 'sale' ? 'Price (₦)' : 'Price per year (₦)'} type="number" min="0" required />
        <F f={f} set={set} k="contactPhone" label="Contact phone (+234…)" required />
        <F f={f} set={set} k="address" label="Address" required />
        <F f={f} set={set} k="whatsapp" label="WhatsApp (optional)" />
        <div className="grid grid-cols-3 gap-3"><F f={f} set={set} k="bedrooms" label="Beds" type="number" min="0" /><F f={f} set={set} k="bathrooms" label="Baths" type="number" min="0" /><F f={f} set={set} k="parking" label="Parking" type="number" min="0" /></div>
        <F f={f} set={set} k="features" label="Features (comma separated)" placeholder="Borehole, Security, Fitted kitchen" />
        {f.category === 'student' && <><F f={f} set={set} k="university" label="University" /><F f={f} set={set} k="distanceToCampus" label="Distance to campus" placeholder="5 min walk" /></>}
      </div>
      <div><label className="label">Description</label><textarea className="input !h-28 py-3" value={f.description} onChange={set('description')} required /></div>
      <div><label className="label">Location details / nearby</label><textarea className="input !h-20 py-3" value={f.nearby} onChange={set('nearby')} /></div>

      <div>
        <label className="label">Pin on map {f.lat && <span className="normal-case text-brand-green">({f.lat}, {f.lng})</span>}</label>
        <MapView height={260} zoom={12} properties={[]} center={f.lat ? { lat: +f.lat, lng: +f.lng } : undefined} onPick={({ lat, lng }) => setF((p) => ({ ...p, lat, lng }))} />
        <p className="mt-1 text-xs text-gray-400">Click the map to set the exact location.</p>
      </div>

      <div>
        <label className="label">Photos (max 8)</label>
        <div className="flex flex-wrap gap-3">
          {existing.map((i) => <div key={i.publicId || i.url} className="relative"><img src={i.url} alt="" className="h-20 w-28 rounded-lg object-cover" /><button type="button" onClick={() => setRemove([...remove, i.publicId])} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"><X size={12} /></button></div>)}
          {files.map((x, i) => <div key={i} className="relative"><img src={URL.createObjectURL(x)} alt="" className="h-20 w-28 rounded-lg object-cover" /><button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"><X size={12} /></button></div>)}
          <button type="button" onClick={() => fileRef.current.click()} className="flex h-20 w-28 flex-col items-center justify-center rounded-lg border-2 border-dashed text-xs text-gray-400 hover:border-brand-green hover:text-brand-green"><ImagePlus size={20} />Add</button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => setFiles([...files, ...e.target.files].slice(0, 8))} />
        </div>
      </div>
      <div className="flex gap-3"><button disabled={busy} className="btn-green">{busy ? 'Saving…' : 'Save listing'}</button><button type="button" onClick={onCancel} className="btn-outline">Cancel</button></div>
    </form>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'listings';
  const [mine, setMine] = useState(null);
  const [saved, setSaved] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [edit, setEdit] = useState(null);
  const [room, setRoom] = useState(null);
  const go = (t) => setSp({ tab: t });

  const load = () => {
    api.get('/properties/mine').then((r) => setMine(r.data));
    api.get('/properties/favorites').then((r) => setSaved(r.data));
    api.get('/chat/inbox').then((r) => setInbox(r.data));
  };
  useEffect(load, []);
  const del = async (id) => { if (!confirm('Delete this listing permanently?')) return; try { await api.delete(`/properties/${id}`); toast.success('Deleted'); load(); } catch (e) { toast.error(errMsg(e)); } };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold text-brand-green">Hi, {user.name.split(' ')[0]} 👋</h1><p className="text-sm text-gray-500">{user.email} · {user.accountType}</p></div>
        <button onClick={() => { setEdit(null); go('add'); }} className="btn-green"><Plus size={16} /> New listing</button>
      </div>
      <div className="mb-6 flex gap-1 border-b">
        {[['listings', 'My listings'], ['saved', 'Saved'], ['messages', 'Messages']].map(([k, l]) => <button key={k} onClick={() => go(k)} className={`px-4 py-2 text-sm font-semibold ${tab === k ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-400'}`}>{l}</button>)}
      </div>

      {tab === 'add' && <PropertyForm key={edit?._id || 'new'} initial={edit} onDone={() => { setEdit(null); go('listings'); load(); }} onCancel={() => { setEdit(null); go('listings'); }} />}

      {tab === 'listings' && (mine?.length === 0 ? <p className="py-16 text-center text-gray-400">You haven't listed anything yet.</p> : (
        <div className="space-y-3">
          {(mine || []).map((p) => (
            <div key={p._id} className="card flex items-start gap-3 p-3 sm:items-center sm:gap-4">
              <img src={cover(p)} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="min-w-0"><Link to={`/property/${p._id}`} className="block truncate font-bold hover:text-brand-green">{p.title}</Link><p className="mt-1 text-sm text-gray-500">{priceLabel(p)} <span className="px-1 text-gray-300">·</span> {p.views} views</p></div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2 sm:border-0 sm:pt-0">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge[p.status]}`}>{p.status}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEdit(p); go('add'); }} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Edit"><Pencil size={17} /></button>
                  <button onClick={() => del(p._id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 size={17} /></button>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {tab === 'saved' && (saved?.length === 0 ? <p className="py-16 text-center text-gray-400">Tap the heart on a property to save it.</p> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{(saved || []).map((p) => <PropertyCard key={p._id} p={p} />)}</div>)}

      {tab === 'messages' && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card divide-y md:col-span-1">
            {inbox.length === 0 && <p className="p-6 text-sm text-gray-400">No conversations yet.</p>}
            {inbox.map((c) => <button key={c.room} onClick={() => setRoom(c)} className={`block w-full p-3 text-left hover:bg-brand-soft ${room?.room === c.room ? 'bg-brand-soft' : ''}`}><b className="block truncate text-sm">{c.title}</b><span className="block truncate text-xs text-gray-500">{c.from}: {c.last}</span></button>)}
          </div>
          <div className="md:col-span-2">{room ? <ChatBox room={room.room} title={room.title} height={460} /> : <p className="py-20 text-center text-gray-400">Select a conversation</p>}</div>
        </div>
      )}
    </div>
  );
}
