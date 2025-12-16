import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Zap, Video, 
  Sun, ShoppingCart, Lock, Trash2, 
  Plus, Check, ChevronRight, ChevronLeft, Facebook, Twitter, Instagram,
  Anchor, Settings as SettingsIcon, Briefcase, 
  Clock, Award, HardHat, Battery, Monitor, MessageCircle, Send, Layout, User,
  Droplet, Wind, Wrench, Building2, ExternalLink, Shield, Pencil, RotateCcw, Search, Quote, ArrowUp, AlertCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  deleteDoc, doc, query, serverTimestamp, orderBy, setDoc, updateDoc 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================

const userFirebaseConfig = {
  apiKey: "AIzaSyDNmHwSCxUQp4qOzSzSeh4O22kTF02ghoc",
  authDomain: "twilight-engineering.firebaseapp.com",
  projectId: "twilight-engineering",
  storageBucket: "twilight-engineering.firebasestorage.app",
  messagingSenderId: "708368955194",
  appId: "1:708368955194:web:53aff7d5abd5bcaa6ac203"
};

const app = initializeApp(userFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_COLLECTION_ID = 'twilight-production-v8'; 

// =================================================================
// 2. DATA & TYPES
// =================================================================

const ICON_MAP: any = {
  Zap, Sun, Video, Droplet, Wind, Wrench, Battery, Monitor, 
  Shield, Building2, Globe: SettingsIcon, Server: SettingsIcon, Wifi: SettingsIcon, Cpu: SettingsIcon, HardHat, Award
};

interface AppSettings { 
  logoUrl: string; 
  footerLogoUrl: string;
  adminPin: string; 
  companyPhone: string; 
  whatsappNumber: string;
  companyEmail: string;
  siteTitle: string;    
  faviconUrl: string;
  contactFormUrl: string;
  metaDescription: string;
  metaKeywords: string;
}

interface Product { id?: string; name: string; category: string; price: number; description: string; imageUrl: string; inStock: boolean; }
interface Project { id?: string; title: string; client: string; category: string; description: string; imageUrl: string; gallery?: string[]; stats: string[]; }
interface Slide { id?: string; title: string; subtitle: string; imageUrl: string; cta: string; }
interface Service { id?: string; title: string; desc: string; icon: string; }
interface Partner { id?: string; name: string; logoUrl: string; }
interface Testimonial { id?: string; text: string; client: string; role: string; }
interface CartItem extends Product { quantity: number; id: string; }
interface Message { id: string; name: string; email: string; phone?: string; text: string; createdAt: any; read: boolean; }

// --- DEFAULTS ---
const DEFAULT_SLIDES = [
  { id: 'd1', imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1920&auto=format&fit=crop", title: "POWERING THE NATION", subtitle: "Specialists in High Voltage Power Line Construction.", cta: "Our Services" },
  { id: 'd2', imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920&auto=format&fit=crop", title: "SUSTAINABLE ENERGY", subtitle: "Expert design and installation of Industrial & Domestic Solar Systems.", cta: "View Projects" },
  { id: 'd3', imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1920&auto=format&fit=crop", title: "ADVANCED SECURITY", subtitle: "State-of-the-art CCTV IP Camera installations and Security Alarms.", cta: "Contact Us" }
];

const DEFAULT_SERVICES = [
  { icon: 'Zap', title: "Power Line Construction", desc: "Comprehensive surveying, designing, and construction of Low, Medium, and High Voltage networks." },
  { icon: 'Sun', title: "Solar Systems", desc: "Professional design and sizing of solar energy systems for home & industry." },
  { icon: 'Video', title: "CCTV & Security", desc: "Installation of advanced IP Cameras and security alarm systems." },
  { icon: 'Droplet', title: "Civil & Water Works", desc: "General civil engineering services including plumbing infrastructure." },
  { icon: 'Wind', title: "AC Systems", desc: "Complete HVAC solutions including design, installation, and maintenance." },
  { icon: 'Wrench', title: "Underground Cabling", desc: "Specialized trenching and cable laying for Medium Voltage lines." },
  { icon: 'Battery', title: "Material Supply", desc: "Procurement and supply of genuine electrical materials." },
  { icon: 'Monitor', title: "Electrical Wiring", desc: "Certified industrial, commercial, and residential wiring services." },
];

const DEFAULT_PARTNERS = [
  { name: "EACPL / Kayunga", logoUrl: "" }, { name: "Sogea Satom", logoUrl: "" }, { name: "Nile Heavy Engineering", logoUrl: "" },
  { name: "Bwiza Furniture World", logoUrl: "" }, { name: "NWSC Mokono", logoUrl: "" }, { name: "Tian Tang Group", logoUrl: "" }
];

const DEFAULT_TESTIMONIALS = [
  { text: "Twilight Engineering delivered our 33KV line project ahead of schedule.", client: "John Doe", role: "Project Manager, EACPL" },
  { text: "We rely on TECL for all our substation maintenance. Their team is responsive.", client: "Sarah N.", role: "Director, Nile Heavy Engineering" },
  { text: "Excellent work on the solar installation at our factory.", client: "Mike K.", role: "Manager, Bwiza Furniture" }
];

const DEFAULT_PROJECTS = [
  { title: "MV & LV Network Construction", client: "EACPL / Kayunga", category: "Power", description: "Successful execution of 2.33km MV and 2.7km LV network construction.", imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80", stats: ["33KV Line", "Concrete Poles"], gallery: ["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80"] },
  { title: "Katosi Water Treatment Plant", client: "Sogea Satom", category: "Civil", description: "Replacement of 11KV/500KVA with 33KV/500KVA transformer.", imageUrl: "https://images.unsplash.com/photo-1581094794329-cd1361ddee2d?auto=format&fit=crop&w=800&q=80", stats: ["500KVA Tx", "Industrial"], gallery: ["https://images.unsplash.com/photo-1581094794329-cd1361ddee2d?auto=format&fit=crop&w=800&q=80"] }
];

const DEFAULT_PRODUCTS = [
  { name: "50KVA Transformer", category: "Supplies", price: 0, description: "High quality distribution transformer.", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=60", inStock: true },
  { name: "Solar Street Light Kit", category: "Electronics", price: 0, description: "Complete automated solar lighting system.", imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=60", inStock: true }
];

// =================================================================
// 3. UTILS
// =================================================================

const resolveImagePath = (url: string) => {
  if (!url) return '/logo.svg'; 
  if (url.startsWith('http') || url.startsWith('data:')) return url; 
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('/')) cleanUrl = '/' + cleanUrl;
  try { return encodeURI(cleanUrl); } catch(e) { return cleanUrl; }
};

const sendMessage = async (data: {name: string, email: string, message: string}, endpoint: string) => {
  try {
    await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'messages'), {
      name: data.name, email: data.email, text: data.message, createdAt: serverTimestamp(), read: false
    });
  } catch (err) { console.error("Firebase save failed", err); }

  if (endpoint && endpoint.startsWith('http')) {
    try {
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } catch (err) { console.error("Email send failed", err); }
  }
};

const updateMetaTags = (settings: AppSettings) => {
  if (settings.siteTitle) document.title = settings.siteTitle;
  const iconHref = resolveImagePath(settings.faviconUrl || '/favicon.png');
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.href = iconHref;
};

// =================================================================
// 4. COMPONENTS
// =================================================================

const HeroSlider = ({ setActiveTab, slides }: any) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev: number) => (prev + 1) % activeSlides.length), 6000); 
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const prevSlide = () => setCurrentSlide((prev: number) => (prev - 1 + activeSlides.length) % activeSlides.length);
  const nextSlide = () => setCurrentSlide((prev: number) => (prev + 1) % activeSlides.length);

  return (
    <div className="relative bg-slate-900 text-white min-h-[90vh] flex items-center justify-center overflow-hidden">
      {activeSlides.map((slide: any, index: number) => (
        <div key={slide.id || index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-110" style={{ backgroundImage: `url('${slide.imageUrl}')`, transform: index === currentSlide ? 'scale(100)' : 'scale(110)' }}></div>
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
      ))}
      <div className="relative z-20 max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
        <div className="mb-6 inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/50 px-4 py-2 rounded-full text-orange-400 text-sm font-bold uppercase tracking-wider backdrop-blur-sm animate-fade-in-up"><Zap className="w-4 h-4" /> Creating New Ways</div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none animate-slide-in-right uppercase text-center">TWILIGHT<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ENGINEERING</span></h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300 font-light leading-relaxed animate-slide-in-left">{activeSlides[currentSlide]?.subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
          <button onClick={() => setActiveTab('services')} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold transition flex items-center justify-center shadow-lg shadow-orange-900/30 transform hover:-translate-y-1">{activeSlides[currentSlide]?.cta || "Learn More"} <ChevronRight className="ml-2 w-5 h-5" /></button>
          <button onClick={() => setActiveTab('store')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-lg font-bold transition transform hover:-translate-y-1 flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Visit Store</button>
        </div>
      </div>
      <button onClick={prevSlide} className="absolute left-4 z-30 p-3 bg-white/10 hover:bg-orange-600 rounded-full backdrop-blur-md transition group hidden md:block"><ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition" /></button>
      <button onClick={nextSlide} className="absolute right-4 z-30 p-3 bg-white/10 hover:bg-orange-600 rounded-full backdrop-blur-md transition group hidden md:block"><ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition" /></button>
      <div className="absolute bottom-8 z-30 flex gap-3">{activeSlides.map((_: any, index: number) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-orange-600 w-8' : 'bg-white/50 hover:bg-white'}`} />))}</div>
    </div>
  );
};

const ServicesCarousel = ({ services, whatsappNumber, companyPhone }: { services: Service[], whatsappNumber: string, companyPhone: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayServices = services && services.length > 0 ? services : DEFAULT_SERVICES;
  
  const handleInquiry = (serviceName: string) => {
    const cleanPhone = (whatsappNumber || companyPhone || '256773505795').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=Hello! I am interested in your ${serviceName} services.`, '_blank');
  };

  useEffect(() => {
    const scroll = () => { if (containerRef.current) { const { scrollLeft, scrollWidth, clientWidth } = containerRef.current; const isEnd = scrollLeft + clientWidth >= scrollWidth - 10; containerRef.current.scrollTo({ left: isEnd ? 0 : scrollLeft + 320, behavior: 'smooth' }); } };
    const timer = setInterval(scroll, 4000); return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="py-24 bg-white relative overflow-hidden"><div className="max-w-7xl mx-auto px-4 mb-12 text-center"><h2 className="text-4xl font-bold text-slate-900 mb-4">What We Do</h2><div className="w-20 h-1.5 bg-orange-600 mx-auto rounded-full"></div></div><div className="relative max-w-[1920px] mx-auto"><div ref={containerRef} className="flex gap-6 overflow-x-auto pb-12 px-4 md:px-12 snap-x snap-mandatory scrollbar-hide" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>{displayServices.map((service, idx) => { const Icon = ICON_MAP[service.icon] || Zap; return (<div key={idx} className="flex-none w-80 md:w-96 bg-slate-50 border border-slate-100 p-8 rounded-2xl snap-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-default flex flex-col h-full"><div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-orange-600 shadow-md group-hover:bg-orange-600 group-hover:text-white transition-colors"><Icon className="w-8 h-8" /></div><h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">{service.title}</h3><p className="text-slate-600 leading-relaxed text-sm flex-grow">{service.desc}</p><button onClick={() => handleInquiry(service.title)} className="mt-6 w-full py-2 bg-slate-50 border border-slate-200 rounded text-slate-700 font-bold hover:bg-orange-600 hover:text-white hover:border-transparent transition">Get Quote</button></div>); })}</div></div></div>
  );
};

const PartnersStrip = ({ partners }: { partners: Partner[] }) => {
  const displayPartners = partners && partners.length > 0 ? partners : DEFAULT_PARTNERS;
  return (
    <div className="bg-slate-50 py-12 border-y border-slate-100 overflow-hidden"><div className="max-w-7xl mx-auto px-4 mb-8 text-center"><p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trusted by Industry Leaders</p></div><div className="relative flex overflow-x-hidden group"><div className="flex animate-marquee whitespace-nowrap">{[...displayPartners, ...displayPartners].map((partner, i) => (<div key={i} className="mx-12 flex items-center gap-3 select-none transition-colors cursor-default opacity-60 hover:opacity-100 grayscale hover:grayscale-0">{partner.logoUrl ? <img src={partner.logoUrl} alt={partner.name} className="h-12 w-auto object-contain" /> : <div className="flex items-center gap-2 text-xl font-black text-slate-400 uppercase hover:text-orange-500"><Building2 className="w-6 h-6" /> {partner.name}</div>}</div>))}</div></div></div>
  );
};

const RecentProjects = ({ projects, setActiveTab }: { projects: Project[], setActiveTab: (t: string) => void }) => {
  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;
  const topProjects = displayProjects.slice(0, 3);
  
  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
           <div><h2 className="text-3xl font-bold text-slate-900 mb-2">Recent Projects</h2><div className="w-16 h-1 bg-orange-600 rounded-full"></div></div>
           <button onClick={() => setActiveTab('projects')} className="text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">View All <ChevronRight className="w-4 h-4"/></button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
           {topProjects.map((p, i) => (
             <div key={i} className="group cursor-pointer" onClick={() => setActiveTab('projects')}>
               <div className="h-64 overflow-hidden rounded-2xl relative mb-4">
                 <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                 <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold uppercase">{p.category || 'General'}</div>
               </div>
               <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition">{p.title}</h3>
               <p className="text-slate-500 text-sm mt-1">{p.client}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  return (
    <div className="py-20 bg-slate-900 text-white relative overflow-hidden"><div className="max-w-7xl mx-auto px-4 relative z-10"><div className="text-center mb-16"><h2 className="text-3xl font-bold mb-4">Client Feedback</h2><div className="w-20 h-1 bg-orange-600 mx-auto rounded-full"></div></div><div className="grid md:grid-cols-3 gap-8">{displayTestimonials.map((t, i) => (<div key={i} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 relative"><Quote className="w-10 h-10 text-orange-600 mb-4 opacity-50" /><p className="text-slate-300 italic mb-6">"{t.text}"</p><div className="border-t border-slate-700 pt-4"><div className="font-bold text-white">{t.client}</div><div className="text-sm text-orange-500">{t.role}</div></div></div>))}</div></div></div>
  );
};

const ChatWidget = ({ settings }: { settings: AppSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('input'); 
  const [formData, setFormData] = useState({ name: '', email: '', message: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setStep('sending'); await sendMessage(formData, settings.contactFormUrl); setStep('success'); setFormData({ name: '', email: '', message: '', phone: '' }); };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl mb-4 w-80 sm:w-96 overflow-hidden border border-slate-100 animate-fade-in-up">
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 overflow-hidden"><img src={resolveImagePath(settings.logoUrl)} alt="TE" className="w-full h-full object-cover" /></div><div><h4 className="font-bold text-sm">Twilight Support</h4><p className="text-xs text-slate-300">Online</p></div></div><button onClick={() => setIsOpen(false)}><X /></button></div>
          <div className="p-4 bg-slate-50 min-h-[300px]">
             {step === 'input' && <form onSubmit={handleSubmit} className="space-y-4"><p className="text-sm text-slate-600 bg-white p-3 rounded-lg shadow-sm border border-slate-100">Hello! Leave us a message below.</p><input required placeholder="Name" className="w-full p-3 rounded-lg border text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /><input required placeholder="Email" className="w-full p-3 rounded-lg border text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /><input placeholder="Phone (Optional)" className="w-full p-3 rounded-lg border text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /><textarea required placeholder="Message..." rows={3} className="w-full p-3 rounded-lg border text-sm" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea><button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send</button></form>}
             {step === 'sending' && <div className="text-center py-12"><p className="text-slate-500">Sending...</p></div>}
             {step === 'success' && <div className="text-center py-8"><h4 className="font-bold text-slate-900 mb-2">Sent!</h4><button onClick={() => setStep('input')} className="text-orange-600 font-bold">Send another</button></div>}
          </div>
          <div className="p-4 bg-white border-t border-slate-100"><a href={`https://wa.me/${settings.whatsappNumber?.replace(/[^0-9]/g, '') || settings.companyPhone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#20bd5a]"><MessageCircle className="w-5 h-5" /> Chat on WhatsApp</a></div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:bg-orange-700 transition transform hover:scale-110">{isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}</button>
    </div>
  );
};

const ContactContent = ({ settings }: { settings: AppSettings }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await sendMessage(formData, settings.contactFormUrl); alert("Message Sent!"); setFormData({ name: '', email: '', message: '' }); };
  return (
    <div className="bg-slate-900 text-white py-20 px-4 animate-fade-in min-h-[80vh]"><div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16"><div><h2 className="text-4xl font-bold mb-6">Get In Touch</h2><div className="space-y-8"><div className="flex items-start"><MapPin className="text-white w-6 h-6 mr-6" /><div><h4 className="font-bold text-xl mb-1">Visit Us</h4><p className="text-gray-400">P.O Box 145784, Kawempe GPO, Kampala</p></div></div><div className="flex items-start"><Phone className="text-white w-6 h-6 mr-6" /><div><h4 className="font-bold text-xl mb-1">Call Us</h4><p className="text-gray-400">+256 773 505 795</p></div></div></div></div><div className="bg-white rounded-2xl p-8 md:p-10 text-slate-800 shadow-2xl"><h3 className="text-2xl font-bold mb-6">Send a Message</h3><form className="space-y-5" onSubmit={handleSubmit}><div className="grid grid-cols-2 gap-4"><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="First Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Last Name" /></div><input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /><textarea required rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Your Message..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea><button className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg">Send Message</button></form></div></div></div>
  );
};

const HomeContent = ({ setActiveTab, logoUrl, slides, settings, services, partners, testimonials, projects }: any) => (
  <div className="animate-fade-in">
    <HeroSlider setActiveTab={setActiveTab} slides={slides} />
    <ServicesCarousel services={services} whatsappNumber={settings.whatsappNumber} companyPhone={settings.companyPhone} />
    <RecentProjects projects={projects} setActiveTab={setActiveTab} />
    <PartnersStrip partners={partners} />
    <TestimonialsSection testimonials={testimonials} />
    <div className="py-20 bg-slate-50 text-slate-800 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
        <div><h2 className="text-3xl font-bold mb-6 text-slate-900">Why Choose Twilight Engineering?</h2><p className="text-slate-600 mb-8 text-lg">We adhere to strict safety standards and are committed to ensuring skills development.</p><div className="space-y-6"><div className="flex items-start"><HardHat className="w-6 h-6 text-orange-500 mr-4 mt-1" /><div><h4 className="font-bold text-lg">Safety First</h4><p className="text-slate-500 text-sm">Environmental Health & Safety is our priority.</p></div></div><div className="flex items-start"><Award className="w-6 h-6 text-orange-500 mr-4 mt-1" /><div><h4 className="font-bold text-lg">Certified Quality</h4><p className="text-slate-500 text-sm">ERA Class B Permit holders.</p></div></div><div className="flex items-start"><Clock className="w-6 h-6 text-orange-500 mr-4 mt-1" /><div><h4 className="font-bold text-lg">Timely Delivery</h4><p className="text-slate-500 text-sm">We value your time and adhere to strict timelines.</p></div></div></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"><div className="text-4xl font-bold text-orange-500 mb-2">50+</div><div className="text-sm font-bold uppercase tracking-wide">Projects Done</div></div><div className="bg-white p-6 rounded-2xl mt-8 border border-slate-100 shadow-sm hover:shadow-md transition"><div className="text-4xl font-bold text-orange-500 mb-2">100%</div><div className="text-sm font-bold uppercase tracking-wide">Satisfaction</div></div><div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"><div className="text-4xl font-bold text-orange-500 mb-2">24/7</div><div className="text-sm font-bold uppercase tracking-wide">Support</div></div><div className="bg-white p-6 rounded-2xl mt-8 border border-slate-100 shadow-sm hover:shadow-md transition"><div className="text-4xl font-bold text-orange-500 mb-2">2019</div><div className="text-sm font-bold uppercase tracking-wide">Established</div></div></div>
      </div>
    </div>
    <ChatWidget settings={settings} />
  </div>
);

const AboutContent = () => (
  <div className="max-w-7xl mx-auto py-20 px-4 animate-fade-in">
    <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
      <div><h2 className="text-4xl font-bold text-slate-900 mb-6">Who We Are</h2><div className="w-24 h-1.5 bg-orange-600 mb-8 rounded-full"></div><div className="text-slate-600 text-lg leading-relaxed space-y-4"><p><strong>Twilight Engineering Company Limited (TECL)</strong> is a premier engineering firm incorporated in 2019.</p><p>Development and maintenance of low, medium, and high voltage power distribution/transmission lines is our most recognized technical business.</p></div></div>
      <div className="space-y-8"><div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-orange-600"><h3 className="text-2xl font-bold mb-4 text-slate-900 flex items-center gap-3"><Anchor className="text-orange-600" /> Our Mission</h3><p className="text-slate-600">To provide overall customer satisfaction.</p></div><div className="bg-slate-900 p-8 rounded-2xl shadow-xl border-l-4 border-orange-600 text-white"><h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Sun className="text-orange-500" /> Our Vision</h3><p className="text-gray-300">To be the leading engineering solution provider.</p></div></div>
    </div>
    <div className="mt-20"><h3 className="text-3xl font-bold text-center mb-12 text-slate-900">Our Core Values</h3><div className="grid md:grid-cols-3 gap-8">{[{ title: "Accountability", icon: Shield, desc: "We practice transparency in all our dealings." }, { title: "Quality", icon: Check, desc: "We ensure high standards and excellence." }, { title: "Timely Delivery", icon: Clock, desc: "We respect timelines." }, { title: "Integrity", icon: Lock, desc: "We uphold honesty and strong moral principles." }, { title: "Skill Development", icon: Award, desc: "We foster talent and skill growth." }, { title: "Safety (EHS)", icon: HardHat, desc: "Environmental Health & Safety is a priority." }].map((val, i) => (<div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:shadow-lg transition text-center group"><div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition"><val.icon className="w-7 h-7" /></div><h4 className="font-bold text-lg mb-2">{val.title}</h4><p className="text-slate-500 text-sm">{val.desc}</p></div>))}</div></div>
  </div>
);

const ServicesContent = ({ services, whatsappNumber, companyPhone }: { services: Service[], whatsappNumber: string, companyPhone: string }) => {
  const displayServices = services && services.length > 0 ? services : DEFAULT_SERVICES;
  const handleInquiry = (serviceName: string) => {
    const cleanPhone = (whatsappNumber || companyPhone || '256773505795').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=Hello! I am interested in your ${serviceName} services.`, '_blank');
  };
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4 animate-fade-in"><div className="max-w-7xl mx-auto"><div className="text-center mb-16"><h2 className="text-4xl font-bold text-slate-900 mb-4">Technical Services</h2></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{displayServices.map((service, idx) => { const Icon = ICON_MAP[service.icon] || Zap; return (<div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-slate-100 flex flex-col h-full"><div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600"><Icon className="w-7 h-7" /></div><h3 className="text-xl font-bold mb-3 text-slate-900">{service.title}</h3><p className="text-slate-600 leading-relaxed text-sm flex-grow">{service.desc}</p><button onClick={() => handleInquiry(service.title)} className="mt-6 w-full py-2 bg-slate-50 border border-slate-200 rounded text-slate-700 font-bold hover:bg-orange-600 hover:text-white hover:border-transparent transition">Get Quote</button></div>); })}</div></div></div>
  );
};

// --- NEW PROJECT MODAL COMPONENT ---
const ProjectModal = ({ project, onClose }: { project: Project, onClose: () => void }) => {
  const [activeImage, setActiveImage] = useState(0);
  const gallery = project.gallery && project.gallery.length > 0 ? project.gallery : [project.imageUrl];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
       <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-orange-500 z-50"><X className="w-8 h-8" /></button>
       <div className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row relative">
         <div className="md:w-2/3 bg-black relative h-64 md:h-auto">
            <img src={gallery[activeImage]} alt={project.title} className="w-full h-full object-contain" />
            {gallery.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {gallery.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-3 h-3 rounded-full ${i === activeImage ? 'bg-orange-600' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
         </div>
         <div className="md:w-1/3 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{project.title}</h2>
            <div className="flex gap-2 mb-2"><span className="text-orange-600 text-sm font-bold uppercase tracking-wider">{project.client}</span>{project.category && <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded font-medium self-start">{project.category}</span>}</div>
            <div className="flex flex-wrap gap-2 mb-6">{project.stats.map(s => <span key={s} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">{s}</span>)}</div>
            <p className="text-slate-600 leading-relaxed text-sm mb-6">{project.description}</p>
            {gallery.length > 1 && (
               <div className="grid grid-cols-3 gap-2">
                 {gallery.map((img, i) => (
                   <button key={i} onClick={() => setActiveImage(i)} className={`border-2 rounded-lg overflow-hidden ${i === activeImage ? 'border-orange-600' : 'border-transparent'}`}>
                     <img src={img} className="w-full h-16 object-cover" />
                   </button>
                 ))}
               </div>
            )}
         </div>
       </div>
    </div>
  );
};

const ProjectsContent = ({ projects }: { projects: Project[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  const categories = ['All', ...Array.from(new Set(displayProjects.map(p => p.category || 'General')))];
  
  const filteredProjects = displayProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || (p.category || 'General') === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white py-20 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-6">Our Track Record</h2>
        
        {/* Project Filter Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
             {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${category === cat ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>{cat}</button>)}
           </div>
           <div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" /><input className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </div>

        <div className="space-y-24">
          {filteredProjects.length === 0 ? <div className="text-center text-slate-400">No projects found.</div> : filteredProjects.map((p, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center group cursor-pointer`} onClick={() => setSelectedProject(p)}>
              <div className="lg:w-1/2 w-full"><div className="relative rounded-2xl overflow-hidden shadow-2xl h-80 lg:h-96 w-full bg-slate-100"><img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" /><div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition flex items-center justify-center"><p className="bg-white/90 px-4 py-2 rounded-full text-sm font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">View Details</p></div></div></div>
              <div className="lg:w-1/2 w-full"><h3 className="text-3xl font-bold mb-6 text-slate-900 group-hover:text-orange-600 transition">{p.title}</h3><p className="text-slate-600 text-lg border-l-4 border-slate-200 pl-4">{p.description}</p></div>
            </div>
          ))}
        </div>
      </div>
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
};

const StoreContent = ({ products, addToCart, setIsCartOpen, cartItemCount }: any) => {
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const displayProducts = useMemo(() => { const list = products.length > 0 ? products : DEFAULT_PRODUCTS; return [...list].sort((a: any, b: any) => (Number(b.inStock) - Number(a.inStock))); }, [products]);
  const categories = ['All', ...Array.from(new Set(displayProducts.map((p: any) => p.category)))];
  const filteredProducts = displayProducts.filter((p: any) => { const matchesCategory = category === 'All' || p.category === category; const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()); return matchesCategory && matchesSearch; });

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 animate-fade-in min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div><h2 className="text-3xl font-bold text-slate-900">Supply Catalog</h2><p className="text-slate-500 mt-1">Genuine electrical materials and equipment.</p></div>
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full"><ShoppingCart className="w-5 h-5" /> Quote ({cartItemCount})</button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">{categories.map(cat => <button key={cat as string} onClick={() => setCategory(cat as string)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${category === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat as string}</button>)}</div>
          <div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" /><input type="text" placeholder="Search items..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">{filteredProducts.length === 0 ? <div className="col-span-full text-center text-slate-400 py-12">No products found matching your criteria.</div> : filteredProducts.map((p: any, i: number) => (
        <div key={i} className={`bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition border border-slate-100 group ${!p.inStock ? 'opacity-75' : ''}`}>
          <div className="relative h-64 overflow-hidden"><img src={p.imageUrl} className="h-full w-full object-cover group-hover:scale-110 transition duration-500" /><div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${p.inStock ? 'bg-green-500' : 'bg-red-500'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</div><div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">{p.category}</div></div>
          <div className="p-6"><h3 className="font-bold text-lg mb-2 truncate">{p.name}</h3><div className="flex justify-between pt-4 border-t items-center"><span className="font-black text-slate-900">{p.price > 0 ? `$${p.price}` : 'Inquire'}</span><button onClick={() => p.inStock && addToCart(p)} disabled={!p.inStock} className={`p-3 rounded-xl transition ${p.inStock ? 'bg-orange-600 text-white hover:bg-slate-900' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>{p.inStock ? <Plus className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</button></div></div>
        </div>
      ))}</div>
    </div>
  );
};

const CartDrawer = ({ cart, removeFromCart, setIsCartOpen, whatsappNumber, companyPhone }: any) => {
  const total = useMemo(() => cart.reduce((a: number, b: any) => a + (b.price * b.quantity), 0).toFixed(2), [cart]);
  const handleCheckout = () => {
    const itemsList = cart.map((item: any) => `• ${item.name} (Qty: ${item.quantity})`).join('%0a');
    const message = `Hello! I would like to request a quote for the following items:%0a%0a${itemsList}%0a%0aTotal Estimated Value: $${total}`;
    const cleanPhone = (whatsappNumber || companyPhone || '256773505795').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl p-0 flex flex-col animate-slide-in-right">
        <div className="p-6 border-b flex justify-between"><h3>Quote Request</h3><button onClick={() => setIsCartOpen(false)}><X /></button></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">{cart.length === 0 ? <p className="text-slate-400 text-center mt-10">Your quote list is empty.</p> : cart.map((i: any) => (<div key={i.id} className="flex gap-4 p-4 border rounded-xl"><img src={i.imageUrl} className="w-16 h-16 rounded object-cover" /><div><h4>{i.name}</h4><p className="text-sm text-slate-500">Qty: {i.quantity}</p></div><button onClick={() => removeFromCart(i.id)}><X /></button></div>))}</div>
        {cart.length > 0 && <div className="p-6 border-t"><div className="flex justify-between font-bold text-xl mb-6"><span>Est. Total</span><span>${total}</span></div><button onClick={handleCheckout} className="w-full bg-green-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition"><MessageCircle className="w-5 h-5"/> Send via WhatsApp</button></div>}
      </div>
    </div>
  );
};

// --- ADMIN ---
const AdminContent = ({ products, projects, slides, services, partners, testimonials, messages, settings, addProduct, deleteProduct, updateProduct, addProject, deleteProject, addSlide, deleteSlide, updateSlide, addService, deleteService, addPartner, deletePartner, addTestimonial, deleteTestimonial, deleteMessage, updateSettings, loadDemoData, setIsAdmin }: any) => {
  const [adminTab, setAdminTab] = useState('store'); 
  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [saveStatus, setSaveStatus] = useState('Save Settings');
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', cta: '', imageUrl: '' });

  useEffect(() => { setFormSettings(prev => ({...settings, ...prev})); }, [settings]);
  const handleEditSlide = (slide: Slide) => { setEditingSlide(slide); setSlideForm({ title: slide.title, subtitle: slide.subtitle, cta: slide.cta, imageUrl: slide.imageUrl }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleCancelEdit = () => { setEditingSlide(null); setSlideForm({ title: '', subtitle: '', cta: '', imageUrl: '' }); };
  const handleSlideSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (editingSlide && editingSlide.id) { await updateSlide(editingSlide.id, slideForm); setEditingSlide(null); } else { await addSlide(e); } setSlideForm({ title: '', subtitle: '', cta: '', imageUrl: '' }); };
  const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSlideForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }
  const handleSaveSettings = async (e: React.FormEvent) => { e.preventDefault(); setSaveStatus('Saving...'); try { await updateSettings(formSettings); setSaveStatus('Saved!'); } catch (error) { setSaveStatus('Error!'); localStorage.setItem('localSettings', JSON.stringify(formSettings)); } setTimeout(() => setSaveStatus('Save Settings'), 2000); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setFormSettings(prev => ({ ...prev, [name]: value })); };
  
  // NEW: Project Submit Handler supporting Gallery
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const gallery = (fd.get('gallery') as string).split(',').map(s => s.trim()).filter(s => s);
    // Use existing addProject logic or call directly if refactored
    // Since addProject expects event, we can manually construct data or update addProject signature.
    // For now, let's call the original handler which uses FormData, but injecting 'gallery' requires updating addProject in main App.
    // Updated addProject in App component to read 'gallery' from FormData.
    addProject(e);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-fade-in">
      <div className="flex justify-between mb-8 pb-6 border-b"><h2>Admin Dashboard</h2><div className="flex gap-2 flex-wrap">{['Store', 'Projects', 'Slides', 'Services', 'Partners', 'Testimonials', 'Inbox', 'Settings'].map(t => <button key={t} onClick={() => setAdminTab(t.toLowerCase())} className={`px-4 py-2 rounded ${adminTab===t.toLowerCase()?'bg-orange-100':'bg-slate-50'}`}>{t}</button>)}<button onClick={() => setIsAdmin(false)} className="px-4 py-2 bg-red-50 text-red-600">Exit</button></div></div>
      
      {adminTab === 'store' && <div className="grid lg:grid-cols-3 gap-10"><div><h3><Plus className="inline w-5 h-5 mr-1"/> Add Product</h3><form onSubmit={addProduct} className="space-y-4"><input name="name" required placeholder="Name" className="w-full p-2 border" /><input name="price" required placeholder="Price" className="w-full p-2 border" /><input name="imageUrl" placeholder="Image URL" className="w-full p-2 border" /><select name="category" className="w-full p-2 border"><option>Supplies</option><option>Tools</option><option>Electronics</option></select><div className="flex items-center gap-2"><input type="checkbox" name="inStock" defaultChecked id="stock" /> <label htmlFor="stock">In Stock</label></div><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{products.map((p:any) => (<tr key={p.id} className={!p.inStock ? 'opacity-50' : ''}><td>{p.name} {p.inStock ? <span className="text-green-600 text-xs ml-2">● In Stock</span> : <span className="text-red-600 text-xs ml-2">● Out of Stock</span>}</td><td className="flex gap-2 justify-end"><button onClick={() => updateProduct(p.id, { inStock: !p.inStock })} className="text-blue-500 text-xs border px-2 rounded">Toggle Stock</button><button onClick={() => deleteProduct(p.id)}><Trash2 className="w-5 h-5 text-red-500" /></button></td></tr>))}</tbody></table></div></div>}
      
      {/* RESTORED GALLERY INPUT */}
      {adminTab === 'projects' && <div className="grid lg:grid-cols-3 gap-10"><div><h3><Plus className="inline w-5 h-5 mr-1"/> Add Project</h3><form onSubmit={addProject} className="space-y-4"><input name="title" required placeholder="Title" className="w-full p-2 border" /><input name="client" placeholder="Client" className="w-full p-2 border" /><input name="category" placeholder="Category (e.g. Solar, Power)" className="w-full p-2 border" /><input name="imageUrl" placeholder="Main Image URL" className="w-full p-2 border" /><textarea name="gallery" placeholder="Gallery URLs (comma separated)" rows={2} className="w-full p-2 border" /><input name="stats" placeholder="Stats (comma separated)" className="w-full p-2 border" /><textarea name="description" rows={2} placeholder="Description" className="w-full p-2 border" /><button className="w-full bg-slate-900 text-white py-2">Add Project</button></form></div><div className="lg:col-span-2"><table><tbody>{projects.map((p:any) => <tr key={p.id}><td>{p.title} <span className="text-xs text-gray-500">({p.category})</span></td><td><button onClick={() => deleteProject(p.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      
      {adminTab === 'slides' && <div className="grid lg:grid-cols-3 gap-10"><div><h3 className="flex items-center gap-2">{editingSlide ? 'Edit Slide' : 'Add Slide'}</h3><form onSubmit={handleSlideSubmit} className="space-y-4"><input name="title" value={slideForm.title} onChange={handleSlideChange} required placeholder="Title" className="w-full p-2 border" /><input name="subtitle" value={slideForm.subtitle} onChange={handleSlideChange} placeholder="Subtitle" className="w-full p-2 border" /><input name="cta" value={slideForm.cta} onChange={handleSlideChange} placeholder="Button Text" className="w-full p-2 border" /><input name="imageUrl" value={slideForm.imageUrl} onChange={handleSlideChange} placeholder="Image URL" className="w-full p-2 border" /><div className="flex gap-2"><button className={`flex-1 text-white py-2 ${editingSlide ? 'bg-orange-600' : 'bg-slate-900'}`}>{editingSlide ? 'Update' : 'Add'}</button>{editingSlide && <button type="button" onClick={handleCancelEdit} className="px-3 bg-gray-200"><RotateCcw className="w-4 h-4"/></button>}</div></form></div><div className="lg:col-span-2"><table><tbody>{slides.map((s:any) => <tr key={s.id}><td>{s.title}</td><td className="flex gap-2 justify-end"><button onClick={() => handleEditSlide(s)} className="text-slate-400 hover:text-orange-600"><Pencil className="w-5 h-5" /></button><button onClick={() => deleteSlide(s.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'services' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Service</h3><form onSubmit={addService} className="space-y-4"><input name="title" required placeholder="Service Title" className="w-full p-2 border" /><select name="icon" className="w-full p-2 border">{Object.keys(ICON_MAP).map(key => <option key={key} value={key}>{key}</option>)}</select><textarea name="desc" rows={3} placeholder="Description" className="w-full p-2 border" /><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{services?.map((s:any) => <tr key={s.id}><td>{s.title}</td><td><button onClick={() => deleteService(s.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'partners' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Partner</h3><form onSubmit={addPartner} className="space-y-4"><input name="name" required placeholder="Partner Name" className="w-full p-2 border" /><input name="logoUrl" placeholder="Logo URL (Optional)" className="w-full p-2 border" /><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{partners?.map((p:any) => <tr key={p.id}><td>{p.name}</td><td><button onClick={() => deletePartner(p.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'testimonials' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Testimonial</h3><form onSubmit={addTestimonial} className="space-y-4"><input name="client" required placeholder="Client Name" className="w-full p-2 border" /><input name="role" placeholder="Role / Company" className="w-full p-2 border" /><textarea name="text" required rows={3} placeholder="Feedback" className="w-full p-2 border" /><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{testimonials?.map((t:any) => <tr key={t.id}><td>{t.client}</td><td><button onClick={() => deleteTestimonial(t.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'inbox' && <div className="max-w-4xl mx-auto space-y-4">{messages.map((m:any) => <div key={m.id} className="p-4 border rounded"><div className="flex justify-between font-bold"><span><User className="inline w-4 h-4 mr-1"/> {m.name} ({m.email})</span><button onClick={() => deleteMessage(m.id)}><Trash2 className="w-4 h-4" /></button></div><p>{m.text}</p></div>)}</div>}
      {adminTab === 'settings' && <div className="max-w-xl mx-auto"><form onSubmit={handleSaveSettings} className="space-y-6 bg-white p-8 shadow-xl"><h3><SettingsIcon className="inline w-5 h-5 mr-1"/> Settings</h3><input name="siteTitle" value={formSettings.siteTitle || ''} onChange={handleChange} placeholder="Site Title" className="w-full p-3 border" /><input name="faviconUrl" value={formSettings.faviconUrl || ''} onChange={handleChange} placeholder="Favicon URL" className="w-full p-3 border" /><input name="logoUrl" value={formSettings.logoUrl || ''} onChange={handleChange} placeholder="Logo URL" className="w-full p-3 border" /><input name="footerLogoUrl" value={formSettings.footerLogoUrl || ''} onChange={handleChange} placeholder="Footer Logo URL" className="w-full p-3 border bg-slate-50" /><input name="whatsappNumber" value={formSettings.whatsappNumber || ''} onChange={handleChange} placeholder="WhatsApp Number" className="w-full p-3 border font-mono bg-green-50" /><input name="contactFormUrl" value={formSettings.contactFormUrl || ''} onChange={handleChange} placeholder="Contact Form Endpoint" className="w-full p-3 border font-mono" /><input name="adminPin" value={formSettings.adminPin || ''} onChange={handleChange} placeholder="Admin PIN" className="w-full p-3 border" /><button className={`w-full text-white py-3 font-bold ${saveStatus === 'Saved!' ? 'bg-green-600' : 'bg-orange-600'}`}>{saveStatus}</button></form><br/><button onClick={loadDemoData} className="w-full bg-slate-200 py-3"><Briefcase className="inline w-4 h-4 mr-1"/> Load Demo Data</button></div>}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [footerClickCount, setFooterClickCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [services, setServices] = useState<Service[]>([]); 
  const [partners, setPartners] = useState<Partner[]>([]); 
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({ 
    logoUrl: '/logo.svg', footerLogoUrl: '/footer.svg', adminPin: '1234', 
    companyPhone: '+256773505795', whatsappNumber: '', 
    companyEmail: 'info@twilighteng.com', siteTitle: 'Twilight Engineering', faviconUrl: '/favicon.png', 
    contactFormUrl: '', metaDescription: '', metaKeywords: '' 
  });

  const cartItemCount = useMemo(() => cart.reduce((a, b) => a + b.quantity, 0), [cart]);

  useEffect(() => { updateMetaTags(settings); const handleHashChange = () => { const hash = window.location.hash.replace('#', ''); if (hash && ['home', 'about', 'services', 'projects', 'store', 'contact'].includes(hash)) setActiveTab(hash); }; window.addEventListener('hashchange', handleHashChange); handleHashChange(); return () => window.removeEventListener('hashchange', handleHashChange); }, [settings]);
  useEffect(() => { const checkScroll = () => setShowScrollTop(window.scrollY > 400); window.addEventListener('scroll', checkScroll); return () => window.removeEventListener('scroll', checkScroll); }, []);
  const handleTabChange = (tab: string) => { setActiveTab(tab); if (tab !== 'admin') window.location.hash = tab; window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); };

  useEffect(() => { signInAnonymously(auth).catch(e => console.error("Auth", e)); onAuthStateChanged(auth, (u) => setUser(u)); }, []);

  useEffect(() => {
    if (!user) { const local = localStorage.getItem('localSettings'); if (local) setSettings(prev => ({...prev, ...JSON.parse(local)})); return; }
    const qProd = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'products'), orderBy('createdAt', 'desc'));
    const qProj = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'projects'), orderBy('createdAt', 'desc'));
    const qSlides = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'slides'), orderBy('createdAt', 'desc'));
    const qServ = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'services'), orderBy('createdAt', 'desc'));
    const qPart = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'partners'), orderBy('createdAt', 'desc'));
    const qTest = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'testimonials'), orderBy('createdAt', 'desc'));
    const qMsgs = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'messages'), orderBy('createdAt', 'desc'));

    const unsubProd = onSnapshot(qProd, (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product))));
    const unsubProj = onSnapshot(qProj, (s) => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() } as Project))));
    const unsubSlides = onSnapshot(qSlides, (s) => setSlides(s.docs.map(d => ({ id: d.id, ...d.data() } as Slide))));
    const unsubServ = onSnapshot(qServ, (s) => setServices(s.docs.map(d => ({ id: d.id, ...d.data() } as Service))));
    const unsubPart = onSnapshot(qPart, (s) => setPartners(s.docs.map(d => ({ id: d.id, ...d.data() } as Partner))));
    const unsubTest = onSnapshot(qTest, (s) => setTestimonials(s.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial))));
    const unsubMsgs = onSnapshot(qMsgs, (s) => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() } as Message))));
    const unsubSettings = onSnapshot(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'settings', 'config'), (doc) => { if (doc.exists()) { setSettings(prev => ({ ...prev, ...doc.data() })); } });

    return () => { unsubProd(); unsubProj(); unsubSlides(); unsubServ(); unsubPart(); unsubTest(); unsubMsgs(); unsubSettings(); };
  }, [user]);

  const handleFooterClick = () => { const n = footerClickCount + 1; setFooterClickCount(n); if (n >= 5) { setShowAdminLogin(true); setFooterClickCount(0); } };
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (adminPinInput === settings.adminPin) { setIsAdmin(true); setShowAdminLogin(false); setActiveTab('admin'); setAdminPinInput(''); } else { alert('Incorrect PIN'); setAdminPinInput(''); } };

  // CRUD Actions - FIXED: Added all missing functions
  const addProduct = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'products'), { name: fd.get('name'), category: fd.get('category'), price: Number(fd.get('price')), description: fd.get('description'), imageUrl: fd.get('imageUrl'), inStock: (fd.get('inStock') === 'on'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const updateProduct = async (id: string, data: any) => { try { await updateDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'products', id), data); } catch(e) { console.error(e); } };

  // FIX: Updated to include category
  const addProject = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'projects'), { title: fd.get('title'), client: fd.get('client'), category: fd.get('category') || 'General', description: fd.get('description'), imageUrl: fd.get('imageUrl'), stats: (fd.get('stats') as string).split(','), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const addSlide = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'slides'), { title: fd.get('title'), subtitle: fd.get('subtitle'), cta: fd.get('cta'), imageUrl: fd.get('imageUrl'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const updateSlide = async (id: string, data: any) => { try { await updateDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'slides', id), data); alert("Updated!"); } catch(e) { console.error(e); } };
  
  const addService = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'services'), { title: fd.get('title'), desc: fd.get('desc'), icon: fd.get('icon'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const deleteService = async (id: string) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'services', id)); };

  const addPartner = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'partners'), { name: fd.get('name'), logoUrl: fd.get('logoUrl'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const deletePartner = async (id: string) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'partners', id)); };

  const addTestimonial = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'testimonials'), { client: fd.get('client'), role: fd.get('role'), text: fd.get('text'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const deleteTestimonial = async (id: string) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'testimonials', id)); };

  const deleteItem = async (col: string, id: string) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', col, id)); };
  
  const updateSettings = async (newSettings: AppSettings) => { try { if (auth.currentUser) await setDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'settings', 'config'), newSettings, { merge: true }); else throw new Error("No user"); } catch (err) { localStorage.setItem('localSettings', JSON.stringify(newSettings)); setSettings(prev => ({...prev, ...newSettings})); } };

  const loadDemoData = async () => { if(!confirm("Load demo?")) return; await Promise.all([...DEFAULT_PRODUCTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'products'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_PROJECTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'projects'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_SLIDES.map(s => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'slides'), {...s, createdAt: serverTimestamp()})), ...DEFAULT_SERVICES.map(s => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'services'), {...s, createdAt: serverTimestamp()})), ...DEFAULT_PARTNERS.map(s => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'partners'), {...s, createdAt: serverTimestamp()})), ...DEFAULT_TESTIMONIALS.map(s => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'data', 'testimonials'), {...s, createdAt: serverTimestamp()}))]); alert("Loaded!"); };

  const addToCart = (p: Product) => { const pId = p.id || 't-'+Math.random(); setCart(prev => { const ex = prev.find(i => i.id === pId); return ex ? prev.map(i => i.id === pId ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...p, quantity: 1, id: pId}]; }); setIsCartOpen(true); };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const renderContent = () => {
    if (activeTab === 'admin' && !isAdmin) return <HomeContent setActiveTab={handleTabChange} logoUrl={settings.logoUrl} slides={slides} settings={settings} services={services} partners={partners} testimonials={testimonials} projects={projects} />;
    switch (activeTab) {
      case 'home': return <HomeContent setActiveTab={handleTabChange} logoUrl={settings.logoUrl} slides={slides} settings={settings} services={services} partners={partners} testimonials={testimonials} projects={projects} />;
      case 'about': return <AboutContent />;
      case 'services': return <ServicesContent services={services} whatsappNumber={settings.whatsappNumber} companyPhone={settings.companyPhone} />;
      case 'projects': return <ProjectsContent projects={projects} />;
      case 'store': return <StoreContent products={products} addToCart={addToCart} setIsCartOpen={setIsCartOpen} cartItemCount={cartItemCount} />;
      case 'contact': return <ContactContent settings={settings} />;
      case 'admin': return <AdminContent products={products} projects={projects} slides={slides} services={services} partners={partners} testimonials={testimonials} messages={messages} settings={settings} addProduct={addProduct} deleteProduct={(id: string) => deleteItem('products', id)} updateProduct={updateProduct} addProject={addProject} deleteProject={(id: string) => deleteItem('projects', id)} addSlide={addSlide} deleteSlide={(id: string) => deleteItem('slides', id)} updateSlide={updateSlide} addService={addService} deleteService={deleteService} addPartner={addPartner} deletePartner={deletePartner} addTestimonial={addTestimonial} deleteTestimonial={deleteTestimonial} deleteMessage={(id: string) => deleteItem('messages', id)} updateSettings={updateSettings} loadDemoData={loadDemoData} setIsAdmin={setIsAdmin} />;
      default: return <HomeContent setActiveTab={handleTabChange} logoUrl={settings.logoUrl} slides={slides} settings={settings} services={services} partners={partners} testimonials={testimonials} projects={projects} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabChange('home')}>
             <img src={resolveImagePath(settings.logoUrl)} alt="Logo" className="h-16 w-auto" onError={(e) => { e.currentTarget.src = '/logo.png'; }} /> 
          </div>
          <div className="hidden lg:flex items-center gap-8">{['Home', 'About', 'Services', 'Store', 'Projects', 'Contact'].map(item => (<button key={item} onClick={() => handleTabChange(item.toLowerCase())} className={`text-sm font-bold uppercase tracking-wider relative py-2 group ${activeTab === item.toLowerCase() ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>{item}<span className={`absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 transform transition-transform ${activeTab === item.toLowerCase() ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span></button>))}{isAdmin && <button onClick={() => handleTabChange('admin')} className="text-xs font-bold uppercase text-white bg-red-500 px-4 py-2 rounded-full hover:bg-red-600">Admin</button>}</div>
          <div className="lg:hidden flex items-center gap-4"><button onClick={() => setIsCartOpen(true)} className="p-2 relative"><ShoppingCart className="w-6 h-6" />{cartItemCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-orange-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">{cartItemCount}</span>}</button><button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button></div>
        </div>
        {isMenuOpen && <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-2xl z-50">{['Home', 'About', 'Services', 'Store', 'Projects', 'Contact'].map(item => (<button key={item} onClick={() => { handleTabChange(item.toLowerCase()); setIsMenuOpen(false); }} className="block w-full text-left px-6 py-4 font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 border-b border-slate-50">{item}</button>))}{isAdmin && <button onClick={() => {handleTabChange('admin'); setIsMenuOpen(false)}} className="block w-full text-left px-6 py-4 font-bold text-red-600 bg-red-50">Admin</button>}</div>}
      </nav>
      <main>{renderContent()}</main>
      <footer className="bg-slate-950 text-slate-400 py-16 px-4 mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6"><img src={resolveImagePath(settings.footerLogoUrl || settings.logoUrl)} alt="Logo" className="h-12 w-auto bg-white p-1 rounded" /></div>
            <p className="mb-8 max-w-md text-slate-500">Your trusted partner for electrical and civil engineering solutions in Uganda.</p><div className="flex gap-4"><Facebook className="w-5 h-5" /><Twitter className="w-5 h-5" /><Instagram className="w-5 h-5" /></div>
          </div>
          <div><h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-600" /> Location</h3><p className="text-sm">P.O Box 145784, Kawempe GPO,<br/>Kampala, Uganda<br/><br/><span className="text-orange-600 font-bold">Phone</span><br/>+256 773 505 795<br/>+256 754 913 092</p></div>
          <div><h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><Check className="w-4 h-4 text-orange-600" /> Certification</h3><div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><div className="font-bold text-white mb-2">ERA Class B</div><div className="text-xs text-slate-500 uppercase">Permit Number</div><div className="text-sm font-mono text-orange-500">ERA/EIP/CLX/022/5516</div></div></div>
        </div>
        <div className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 cursor-default" onClick={handleFooterClick}>&copy; 2025 Twilight Engineering Co. Ltd. All rights reserved.</div>
      </footer>
      {showScrollTop && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-6 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition z-40 animate-fade-in-up"><ArrowUp className="w-6 h-6" /></button>}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm relative"><button onClick={() => setShowAdminLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X /></button><div className="text-center mb-8"><Lock className="w-10 h-10 mx-auto text-slate-900 mb-4" /><h3 className="text-2xl font-black text-slate-900 uppercase">System Access</h3></div><form onSubmit={handleLogin} className="space-y-6"><input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} className="w-full bg-slate-100 p-4 rounded-xl text-center text-3xl tracking-[0.5em] font-black outline-none focus:ring-2 focus:ring-orange-500" maxLength={4} placeholder="••••" autoFocus /><button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg">Unlock Dashboard</button></form></div>
        </div>
      )}
      {/* FIX: Passed whatsappNumber to CartDrawer for WhatsApp */}
      {isCartOpen && <CartDrawer cart={cart} removeFromCart={removeFromCart} setIsCartOpen={setIsCartOpen} whatsappNumber={settings.whatsappNumber} companyPhone={settings.companyPhone} />}
    </div>
  );
}