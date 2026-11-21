import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function Guard({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-20 text-center text-gray-400">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const standalone = {
    '/auth': <Auth />,
    '/verify-email': <VerifyEmail />,
    '/forgot-password': <ForgotPassword />,
    '/reset-password': <ResetPassword />,
  };
  const page = standalone[pathname.replace(/\/+$/, '') || '/'];
  if (page) return page;
  return (
    <>
      <Navbar onMenu={() => setOpen(true)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="min-h-screen pt-[70px] lg:ml-[250px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<Listings category="sale" />} />
          <Route path="/rent" element={<Listings category="rent" />} />
          <Route path="/student" element={<Listings category="student" />} />
          <Route path="/properties" element={<Listings category="" />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
          <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </main>
    </>
  );
}
