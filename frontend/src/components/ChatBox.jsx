import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';
import api, { API } from '../api';
import { useAuth } from '../context/AuthContext';

const emptyMessages = [];

export default function ChatBox({ room, title, height = 360 }) {
  const { user } = useAuth();
  const [messageState, setMessageState] = useState({ room: null, msgs: [] });
  const msgs = messageState.room === room ? messageState.msgs : emptyMessages;
  const [text, setText] = useState('');
  const [typing, setTyping] = useState('');
  const [online, setOnline] = useState(false);
  const [joined, setJoined] = useState(false);
  const [sendError, setSendError] = useState('');
  const sock = useRef(null);
  const end = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;
    api.get(`/chat/${room}`).then((r) => alive && setMessageState({ room, msgs: r.data })).catch(() => {});
    const s = io(API, { auth: { token: localStorage.getItem('hf_token') } });
    sock.current = s;
    s.on('connect', () => {
      s.emit('join', room, (result) => {
        setOnline(Boolean(result?.ok));
        setJoined(Boolean(result?.ok));
        if (!result?.ok) setSendError('You do not have access to this conversation.');
      });
    });
    s.on('connect_error', () => { setOnline(false); setJoined(false); setSendError('Could not connect. Check your login and API connection.'); });
    s.on('disconnect', () => { setOnline(false); setJoined(false); });
    s.on('message', (m) => setMessageState((current) => {
      const currentMsgs = current.room === room ? current.msgs : [];
      return currentMsgs.some((x) => x._id === m._id) ? current : { room, msgs: [...currentMsgs, m] };
    }));
    s.on('typing', (t) => { if (t.room === room) { setTyping(`${t.name} is typing…`); clearTimeout(timer.current); timer.current = setTimeout(() => setTyping(''), 1500); } });
    return () => { alive = false; clearTimeout(timer.current); s.disconnect(); };
  }, [room]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!sock.current?.connected || !joined) {
      setSendError('Chat is not connected yet. Your message has not been sent.');
      return;
    }
    sock.current.emit('message', { room, text }, (result) => {
      if (result?.ok) {
        setText('');
        setSendError('');
      } else {
        setSendError('Message could not be sent. Please try again.');
      }
    });
  };
  return (
    <div className="card flex flex-col" style={{ height }}>
      <div className="flex items-center justify-between bg-brand-green px-4 py-3 text-white">
        <strong className="truncate text-sm">{title}</strong>
        <span className="flex items-center gap-1 text-xs"><i className={`h-2 w-2 rounded-full ${online ? 'bg-green-300' : 'bg-gray-400'}`} />{online ? 'Live' : 'Connecting'}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3">
        {msgs.length === 0 && <p className="mt-10 text-center text-sm text-gray-400">No messages yet. Say hello 👋</p>}
        {msgs.map((m) => {
          const mine = m.sender === user.id;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? 'rounded-br-sm bg-brand-green text-white' : 'rounded-bl-sm bg-white shadow-sm'}`}>
                {!mine && <p className="text-[10px] font-bold text-brand-gold">{m.senderName}</p>}
                {m.text}
                <p className={`mt-0.5 text-[10px] ${mine ? 'text-green-200' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        {typing && <p className="text-xs italic text-gray-400">{typing}</p>}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-2">
        <input className="input !h-10" placeholder="Type a message…" value={text} onChange={(e) => { setText(e.target.value); setSendError(''); if (joined) sock.current?.emit('typing', { room }); }} maxLength={1000} />
        <button className="btn-green !px-3" aria-label="Send" disabled={!joined || !text.trim()}><Send size={16} /></button>
      </form>
      {sendError && <p role="status" className="border-t px-3 py-2 text-xs text-red-600">{sendError}</p>}
    </div>
  );
}
