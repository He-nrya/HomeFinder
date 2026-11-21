import { useEffect, useState } from 'react';
import { Users, Building2, Clock, MessageSquare, Check, X, Trash2, Ban, ShieldCheck, Star, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg, priceLabel } from '../api';
import ChatBox from '../components/ChatBox';

const badge = { approved: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' };

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [props, setProps] = useState([]);
  const [users, setUsers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [room, setRoom] = useState(null);
  const [filter, setFilter] = useState('');

  const load = () => {
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/properties').then((r) => setProps(r.data));
    api.get('/admin/users').then((r) => setUsers(r.data));
  };
  useEffect(load, []);
  useEffect(() => {
    if (tab !== 'messages') return undefined;
    const refresh = () => api.get('/chat/inbox').then((r) => setInbox(r.data)).catch((e) => toast.error(errMsg(e)));
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [tab]);
  const act = async (fn, msg) => { try { await fn(); toast.success(msg); load(); } catch (e) { toast.error(errMsg(e)); } };
  const patchP = (id, body, msg = 'Updated') => act(() => api.put(`/admin/properties/${id}`, body), msg);
  const patchU = (id, body, msg = 'Updated') => act(() => api.put(`/admin/users/${id}`, body), msg);
  const delP = (id) => confirm('Delete this listing?') && act(() => api.delete(`/properties/${id}`), 'Listing deleted');
  const delU = (id) => confirm('Delete this user and all their listings?') && act(() => api.delete(`/admin/users/${id}`), 'User deleted');

  const cards = stats && [[Users, 'Users', stats.users], [Building2, 'Listings', stats.properties], [Clock, 'Pending', stats.pending], [MessageSquare, 'Messages', stats.messages]];
  const max = Math.max(1, ...(stats?.byCategory.map((c) => c.count) || [1]));
  const shown = props.filter((p) => !filter || p.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-extrabold text-brand-green"><ShieldCheck /> Admin dashboard</h1>
      <div className="mb-6 flex gap-1 border-b">{['overview', 'listings', 'users', 'messages'].map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize ${tab === t ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-400'}`}>{t}{t === 'listings' && stats?.pending ? ` (${stats.pending} pending)` : ''}</button>)}</div>

      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map(([Icon, l, v]) => <div key={l} className="card flex items-center gap-4 p-5"><div className="rounded-xl bg-brand-soft p-3 text-brand-green"><Icon /></div><div><p className="text-2xl font-extrabold">{v}</p><p className="text-sm text-gray-500">{l}</p></div></div>)}</div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card p-6"><h3 className="mb-4 font-bold">Listings by category</h3>
              {stats.byCategory.map((c) => <div key={c._id} className="mb-3"><div className="mb-1 flex justify-between text-sm capitalize"><span>{c._id}</span><b>{c.count}</b></div><div className="h-3 rounded-full bg-gray-100"><div className="h-3 rounded-full bg-brand-green transition-all duration-700" style={{ width: `${(c.count / max) * 100}%` }} /></div></div>)}</div>
            <div className="card p-6"><h3 className="mb-4 font-bold">Newest users</h3>{stats.recent.map((u) => <div key={u._id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{u.name}<br /><small className="text-gray-400">{u.email}</small></span><span className="text-gray-500">{u.accountType}</span></div>)}</div>
          </div>
        </>
      )}

      {tab === 'listings' && (
        <>
          <select className="input mb-4 !w-48" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All statuses</option><option>pending</option><option>approved</option><option>rejected</option></select>
          <div className="space-y-3">
            {shown.map((p) => (
              <div key={p._id} className="card flex flex-wrap items-center gap-3 p-3">
                <img src={p.images?.[0]?.url || '/fh1.jpg'} alt="" className="h-16 w-24 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><Link to={`/property/${p._id}`} className="block truncate font-bold hover:text-brand-green">{p.title}</Link><p className="text-xs text-gray-500">{priceLabel(p)} · {p.category} · by {p.owner?.name}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge[p.status]}`}>{p.status}</span>
                {p.status !== 'approved' && <button title="Approve" onClick={() => patchP(p._id, { status: 'approved' }, 'Approved')} className="rounded-lg bg-green-50 p-2 text-green-700"><Check size={16} /></button>}
                {p.status !== 'rejected' && <button title="Reject" onClick={() => patchP(p._id, { status: 'rejected' }, 'Rejected')} className="rounded-lg bg-amber-50 p-2 text-amber-700"><X size={16} /></button>}
                <button title="Verified" onClick={() => patchP(p._id, { verified: !p.verified })} className={`rounded-lg p-2 ${p.verified ? 'bg-brand-soft text-brand-green' : 'text-gray-300'}`}><BadgeCheck size={16} /></button>
                <button title="Featured" onClick={() => patchP(p._id, { featured: !p.featured })} className={`rounded-lg p-2 ${p.featured ? 'bg-amber-50 text-brand-gold' : 'text-gray-300'}`}><Star size={16} /></button>
                <button title="Delete" onClick={() => delP(p._id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            ))}
            {shown.length === 0 && <p className="py-12 text-center text-gray-400">Nothing here.</p>}
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">Name</th><th>Email</th><th>Type</th><th>Role</th><th>Status</th><th /></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-3 font-semibold">{u.name}</td><td>{u.email}</td><td>{u.accountType}</td>
                <td><button onClick={() => patchU(u._id, { role: u.role === 'admin' ? 'user' : 'admin' }, 'Role changed')} className="rounded bg-gray-100 px-2 py-1 text-xs font-bold">{u.role}</button></td>
                <td>{u.blocked ? <span className="text-red-600">Blocked</span> : <span className="text-green-600">Active</span>}</td>
                <td className="space-x-1 pr-3 text-right"><button title="Block / unblock" onClick={() => patchU(u._id, { blocked: !u.blocked }, u.blocked ? 'Unblocked' : 'Blocked')} className="rounded p-2 hover:bg-gray-100"><Ban size={15} /></button><button title="Delete" onClick={() => delU(u._id)} className="rounded p-2 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button></td>
              </tr>))}</tbody>
          </table>
        </div>
      )}

      {tab === 'messages' && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card divide-y md:col-span-1">
            {inbox.length === 0 && <p className="p-6 text-sm text-gray-400">No conversations yet.</p>}
            {inbox.map((conversation) => <button key={conversation.room} onClick={() => setRoom(conversation)} className={`block w-full p-3 text-left hover:bg-brand-soft ${room?.room === conversation.room ? 'bg-brand-soft' : ''}`}>
              <b className="block truncate text-sm">{conversation.title}</b>
              <span className="block truncate text-xs text-gray-500">{conversation.from}: {conversation.last}</span>
            </button>)}
          </div>
          <div className="md:col-span-2">{room ? <ChatBox room={room.room} title={room.title} height={460} /> : <p className="py-20 text-center text-gray-400">Select a conversation</p>}</div>
        </div>
      )}
    </div>
  );
}
