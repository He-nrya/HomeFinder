import axios from 'axios';
export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: `${API}/api` });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('hf_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
export const money = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
export const priceLabel = (p) => (p.category === 'sale' ? money(p.price) : `${money(p.price)}/yr`);
export const wa = (p) => `https://wa.me/${(p.whatsapp || p.contactPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I'm interested in "${p.title}" on HomeFinder.`)}`;
export const cover = (p) => p.images?.[0]?.url || '/fh1.jpg';
export default api;
