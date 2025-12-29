import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// --- Layout Components ---
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ChatWidget } from './components/layout/ChatWidget';
import { CartDrawer } from './components/layout/CartDrawer';

// --- Full Page Components (Lazy Loaded) ---
const HomeContent = lazy(() => import('./components/pages/HomeContent').then(module => ({ default: module.HomeContent })));
const ContactContent = lazy(() => import('./components/pages/ContactContent').then(module => ({ default: module.ContactContent })));
const ServicesContent = lazy(() => import('./components/pages/ServicesContent').then(module => ({ default: module.ServicesContent })));
const ProjectsContent = lazy(() => import('./components/pages/ProjectsContent').then(module => ({ default: module.ProjectsContent })));
const StoreContent = lazy(() => import('./components/pages/StoreContent').then(module => ({ default: module.StoreContent })));
const AboutContent = lazy(() => import('./components/pages/AboutContent').then(module => ({ default: module.AboutContent })));
const AdminContent = lazy(() => import('./components/admin/AdminContent').then(module => ({ default: module.AdminContent })));

import { ErrorBoundary } from './components/errors/ErrorBoundary'; // Still using ErrorBoundary

// --- Types ---
import type { AppSettings } from './types';
import { getSettings } from './lib/firestoreService';

// --- Mock Settings (fallback) ---
const FALLBACK_SETTINGS: AppSettings = {
  siteName: "TECL Engineering",
  contactFormUrl: "/api/contact",
  enableStore: true,
  supportEmail: "support@tecl.com",
  socialLinks: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com" // Added Instagram as it's in new Footer
  },
  mission: "To provide world-class engineering and logistical support.",
  vision: "To be the leading partner for infrastructure solutions in Africa.",
  phoneNumber: "+256 773 505 795",
  address: "P.O Box 145784, Kawempe GPO, Kampala, Uganda",
  tagline: "Delivering excellence in engineering, logistics, and security solutions across East Africa. Committed to quality, safety, and innovation."
};

const NotFound = () => (
  <div className="py-20 text-center">
    <h1 className="text-2xl font-bold text-slate-900">404 - Page Not Found</h1>
    <p className="text-slate-600 mt-4">The page you are looking for does not exist.</p>
  </div>
);

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
  </div>
);

export default function App() {
  const [settingsState, setSettingsState] = useState<AppSettings>(FALLBACK_SETTINGS);
  const location = useLocation();

  // Fetch live settings and set SEO meta (falls back to FALLBACK_SETTINGS)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const remote = await getSettings();
        if (!mounted) return;
        if (remote && Object.keys(remote).length) {
          setSettingsState(remote as AppSettings);
          if (remote.metaTitle) document.title = remote.metaTitle;
          else if (remote.siteName) document.title = remote.siteName;

          // meta description tag
          try {
            const desc = remote.metaDescription || remote.metaDesc || '';
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', 'description');
              document.head.appendChild(meta);
            }
            if (meta && desc) meta.setAttribute('content', desc);
          } catch (e) { /* ignore */ }
        } else {
          if (FALLBACK_SETTINGS.siteName) document.title = FALLBACK_SETTINGS.siteName;
        }
      } catch (err) {
        console.warn('Failed to load remote settings, using fallback', err);
        if (FALLBACK_SETTINGS.siteName) document.title = FALLBACK_SETTINGS.siteName;
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Hide Navbar/Footer/Chat for Admin Dashboard
  const isLayoutVisible = !location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white">
      {isLayoutVisible && <Navbar settings={settingsState} />}

      {/* Main Content Area */}
      <main className={`flex-1 ${isLayoutVisible ? 'pt-20' : ''}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route path="/services" element={<ServicesContent />} />
            <Route path="/projects" element={<ProjectsContent />} />
            <Route path="/store" element={<StoreContent />} />
            <Route path="/contact" element={<ContactContent settings={settingsState} />} />
            <Route path="/about" element={<AboutContent settings={settingsState} />} />
            <Route path="/admin/*" element={
              <ErrorBoundary>
                <AdminContent />
              </ErrorBoundary>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {isLayoutVisible && <Footer settings={settingsState} />}
      {isLayoutVisible && <ChatWidget settings={settingsState} />}

      <CartDrawer />
    </div>
  );
}