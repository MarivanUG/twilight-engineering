import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Zap, Video, 
  Sun, ShoppingCart, Lock, Trash2, 
  Plus, Check, ChevronRight, ChevronLeft, Facebook, Twitter, Instagram,
  Anchor, Settings, Briefcase, 
  Clock, Award, HardHat, Battery, Monitor, MessageCircle, Send, Layout, User,
  Droplet, Wind, Wrench, Building2, ExternalLink, Shield
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  deleteDoc, doc, query, serverTimestamp, orderBy, setDoc 
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

interface AppSettings { 
  logoUrl: string; 
  footerLogoUrl: string;
  adminPin: string; 
  companyPhone: string; 
  companyEmail: string;
  siteTitle: string;    
  faviconUrl: string;
  contactFormUrl: string;
  metaDescription: string;
  metaKeywords: string;
}

interface Product { id?: string; name: string; category: string; price: number; description: string; imageUrl: string; }
interface Project { id?: string; title: string; client: string; description: string; imageUrl: string; stats: string[]; }
interface Slide { id?: string; title: string; subtitle: string; imageUrl: string; cta: string; }
interface CartItem extends Product { quantity: number; id: string; }
interface Message { id: string; name: string; email: string; text: string; createdAt: any; read: boolean; }

const DEFAULT_SLIDES = [
  { id: 'd1', imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1920&auto=format&fit=crop", title: "POWERING THE NATION", subtitle: "Specialists in High Voltage Power Line Construction, Maintenance, and Distribution Network Rehabilitation.", cta: "Our Services" },
  { id: 'd2', imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920&auto=format&fit=crop", title: "SUSTAINABLE ENERGY", subtitle: "Expert design, sizing, and installation of On-Grid and Off-Grid Solar Systems for industrial and domestic use.", cta: "View Projects" },
  { id: 'd3', imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1920&auto=format&fit=crop", title: "ADVANCED SECURITY", subtitle: "State-of-the-art CCTV IP Camera installations, Security Alarms, and Remote Surveillance Solutions.", cta: "Contact Us" }
];

const SERVICES_LIST = [
  { icon: Zap, title: "Power Line Construction", desc: "Comprehensive surveying, designing, and construction of Low, Medium, and High Voltage networks. We handle commissioning, maintenance, and rehabilitation of distribution lines." },
  { icon: Sun, title: "Solar Systems", desc: "Professional design and sizing of solar energy systems. We install solar water heaters, pumps, and automated street lighting for compounds and highways." },
  { icon: Video, title: "CCTV & Security", desc: "Installation of advanced IP Cameras and security alarm systems. We offer offline and online viewing capabilities to secure homes and businesses." },
  { icon: Droplet, title: "Civil & Water Works", desc: "General civil engineering services including plumbing infrastructure, water pump installations, and structural support for utility projects." },
  { icon: Wind, title: "AC Systems", desc: "Complete HVAC solutions including design, installation, and maintenance of Air Conditioning systems for residential and commercial premises." },
  { icon: Wrench, title: "Underground Cabling", desc: "Specialized trenching and cable laying for Medium Voltage lines, solar plants, and substation interconnections with high safety standards." },
  { icon: Battery, title: "Material Supply", desc: "Procurement and supply of genuine electrical materials including Transformers, Conductors, Switchgear, and Safety Equipment." },
  { icon: Monitor, title: "Electrical Wiring", desc: "Certified industrial, commercial, and residential wiring services adhering to modern safety regulations and standards." },
];

const CLIENTS = [
  "EACPL / Kayunga", "Sogea Satom", "Nile Heavy Engineering", "Bwiza Furniture World", "NWSC Mokono", "Tian Tang Group"
];

const DEFAULT_PROJECTS = [
  { title: "MV & LV Network Construction", client: "EACPL / Kayunga", description: "Successful execution of 2.33km MV and 2.7km LV network construction. Scope included pole erection, dressing, stringing, and commissioning of a 200KVA Transformer.", imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80", stats: ["33KV Line", "Concrete Poles", "Commissioned"] },
  { title: "Katosi Water Treatment Plant", client: "Sogea Satom", description: "Replacement of 11KV/500KVA with 33KV/500KVA transformer. Included installation of Bulk Metering Units, 33KV Circuit Breakers, and complex underground cable works.", imageUrl: "https://images.unsplash.com/photo-1581094794329-cd1361ddee2d?auto=format&fit=crop&w=800&q=80", stats: ["500KVA Tx", "Industrial", "Cabling"] },
  { title: "Bukinda Hydro Power Project", client: "Nile Heavy Engineering", description: "Construction of 33kV Transmission Line for power evacuation of 6.5 MW Bukinda Small Hydro Power Project. Installation of auto-reclosers and metering units.", imageUrl: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?auto=format&fit=crop&w=800&q=80", stats: ["Hydro Power", "Rehabilitation", "HV"] }
];

const DEFAULT_PRODUCTS = [
  { name: "50KVA Transformer", category: "Supplies", price: 0, description: "High quality distribution transformer for industrial use.", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=60" },
  { name: "Solar Street Light Kit", category: "Electronics", price: 0, description: "Complete automated solar lighting system.", imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=60" }
];

// =================================================================
// 3. UTILS & HELPERS
// =================================================================

// Helper to ensure path is correct for local files and handles spaces
const resolveImagePath = (url: string) => {
  if (!url) return '/logo.svg'; // Default to the SVG requested
  if (url.startsWith('http') || url.startsWith('data:')) return url; // External or Base64
  
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  return cleanUrl;
};

const sendMessage = async (data: {name: string, email: string, message: string}, endpoint: string) => {
  try {
    await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'messages'), {
      name: data.name, email: data.email, text: data.message, createdAt: serverTimestamp(), read: false
    });
  } catch (err) { console.error("Firebase save failed", err); }

  if (endpoint && endpoint.startsWith('http')) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) return true;
    } catch (err) { console.error("Email send failed", err); }
  }
  return true;
};

const updateMetaTags = (settings: AppSettings) => {
  if (settings.siteTitle) document.title = settings.siteTitle;
  
  const iconHref = resolveImagePath(settings.faviconUrl || '/favicon.png');
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.href = iconHref;

  if (settings.metaDescription) {
    let meta = document.querySelector("meta[name='description']") as HTMLMetaElement;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = settings.metaDescription;
  }
  if (settings.metaKeywords) {
    let meta = document.querySelector("meta[name='keywords']") as HTMLMetaElement;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'keywords'; document.head.appendChild(meta); }
    meta.content = settings.metaKeywords;
  }
};

// =================================================================
// 4. COMPONENTS
// =================================================================

const HeroSlider = ({ setActiveTab, slides }: any) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

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
        <div className="flex flex-col items-center justify-center transition-all duration-500">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none animate-slide-in-right uppercase text-center">
              TWILIGHT<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ENGINEERING</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300 font-light leading-relaxed animate-slide-in-left">{activeSlides[currentSlide].subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
          <button onClick={() => setActiveTab('services')} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold transition flex items-center justify-center shadow-lg shadow-orange-900/30 transform hover:-translate-y-1">{activeSlides[currentSlide].cta || "Learn More"} <ChevronRight className="ml-2 w-5 h-5" /></button>
          <button onClick={() => setActiveTab('contact')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-lg font-bold transition transform hover:-translate-y-1">Contact Us</button>
        </div>
      </div>
      <button onClick={prevSlide} className="absolute left-4 z-30 p-3 bg-white/10 hover:bg-orange-600 rounded-full backdrop-blur-md transition group hidden md:block"><ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition" /></button>
      <button onClick={nextSlide} className="absolute right-4 z-30 p-3 bg-white/10 hover:bg-orange-600 rounded-full backdrop-blur-md transition group hidden md:block"><ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition" /></button>
      <div className="absolute bottom-8 z-30 flex gap-3">{activeSlides.map((_: any, index: number) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-orange-600 w-8' : 'bg-white/50 hover:bg-white'}`} />))}</div>
    </div>
  );
};

const ServicesCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroll = () => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        const newPos = isEnd ? 0 : scrollLeft + 320; 
        containerRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
      }
    };
    const timer = setInterval(scroll, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">What We Do</h2>
        <div className="w-20 h-1.5 bg-orange-600 mx-auto rounded-full"></div>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Comprehensive engineering solutions tailored to your needs.</p>
      </div>
      <div className="relative max-w-[1920px] mx-auto">
        <div ref={containerRef} className="flex gap-6 overflow-x-auto pb-12 px-4 md:px-12 snap-x snap-mandatory scrollbar-hide" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>
          {SERVICES_LIST.map((service, idx) => (
            <div key={idx} className="flex-none w-80 md:w-96 bg-slate-50 border border-slate-100 p-8 rounded-2xl snap-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-orange-600 shadow-md group-hover:bg-orange-600 group-hover:text-white transition-colors"><service.icon className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{service.desc}</p>
            </div>
          ))}
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-12 md:w-32 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-12 md:w-32 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

const PartnersStrip = () => (
  <div className="bg-slate-50 py-12 border-y border-slate-100 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trusted by Industry Leaders</p>
    </div>
    <div className="relative flex overflow-x-hidden group">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
          <div key={i} className="mx-8 flex items-center gap-2 text-xl font-black text-slate-300 uppercase select-none hover:text-orange-500 transition-colors cursor-default">
            <Building2 className="w-6 h-6" /> {client}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ChatWidget = ({ settings }: { settings: AppSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('input'); 
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('sending');
    await sendMessage(formData, settings.contactFormUrl);
    setStep('success');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl mb-4 w-80 sm:w-96 overflow-hidden border border-slate-100 animate-fade-in-up">
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 overflow-hidden">
                <img src={resolveImagePath(settings.logoUrl)} alt="TE" className="w-full h-full object-cover" />
              </div>
              <div><h4 className="font-bold text-sm">Twilight Support</h4><p className="text-xs text-slate-300">Online</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 bg-slate-50 min-h-[300px]">
             {step === 'input' && (
               <form onSubmit={handleSubmit} className="space-y-4">
                 <p className="text-sm text-slate-600 bg-white p-3 rounded-lg shadow-sm border border-slate-100">Hello! Leave us a message below.</p>
                 <input required type="text" placeholder="Name" className="w-full p-3 rounded-lg border text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <input required type="email" placeholder="Email" className="w-full p-3 rounded-lg border text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 <textarea required placeholder="Message..." rows={3} className="w-full p-3 rounded-lg border text-sm" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                 <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send</button>
               </form>
             )}
             {step === 'sending' && <div className="flex flex-col items-center justify-center h-full py-10"><div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-sm text-slate-500">Sending...</p></div>}
             {step === 'success' && <div className="text-center py-8"><div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-6 h-6" /></div><h4 className="font-bold text-slate-900 mb-2">Sent!</h4><p className="text-sm text-slate-500 mb-6">We will contact you shortly.</p><button onClick={() => setStep('input')} className="text-orange-600 text-sm font-bold hover:underline">Send another</button></div>}
          </div>
          <div className="p-4 bg-white border-t border-slate-100"><a href={`https://wa.me/${settings.companyPhone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#20bd5a] transition"><MessageCircle className="w-5 h-5" /> Chat on WhatsApp</a></div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:bg-orange-700 transition transform hover:scale-110">{isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}</button>
    </div>
  );
};

const ContactContent = ({ settings }: { settings: AppSettings }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(formData, settings.contactFormUrl);
    alert("Message Sent! We will get back to you soon.");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-slate-900 text-white py-20 px-4 animate-fade-in min-h-[80vh]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
          <p className="text-gray-400 mb-10 text-lg">Ready to start your project? Contact our engineering team today.</p>
          <div className="space-y-8">
            <div className="flex items-start"><div className="bg-slate-800 p-4 rounded-lg mr-6"><MapPin className="text-white w-6 h-6" /></div><div><h4 className="font-bold text-xl mb-1 text-white">Visit Us</h4><p className="text-gray-400">P.O Box 145784, Kawempe GPO,<br/>Kampala, Uganda</p></div></div>
            <div className="flex items-start"><div className="bg-slate-800 p-4 rounded-lg mr-6"><Phone className="text-white w-6 h-6" /></div><div><h4 className="font-bold text-xl mb-1 text-white">Call Us</h4><p className="text-gray-400">+256 773 505 795<br/>+256 754 913 092</p></div></div>
            <div className="flex items-start"><div className="bg-slate-800 p-4 rounded-lg mr-6"><Mail className="text-white w-6 h-6" /></div><div><h4 className="font-bold text-xl mb-1 text-white">Email Us</h4><p className="text-gray-400">info@twilighteng.com</p></div></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 md:p-10 text-slate-800 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="First Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Last Name" />
            </div>
            <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <textarea required rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Your Message..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
            <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg hover:bg-orange-700 transition shadow-lg">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const HomeContent = ({ setActiveTab, logoUrl, slides, settings }: any) => (
  <div className="animate-fade-in">
    <HeroSlider setActiveTab={setActiveTab} logoUrl={logoUrl} slides={slides} />
    <ServicesCarousel />
    <PartnersStrip />
    <div className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Why Choose Twilight Engineering?</h2>
          <p className="text-slate-400 mb-8 text-lg">We adhere to strict safety standards and are committed to ensuring skills development and quality delivery.</p>
          <div className="space-y-6">
            <div className="flex items-start"><HardHat className="w-6 h-6 text-orange-500 mr-4 mt-1" /><div><h4 className="font-bold text-lg">Safety First</h4><p className="text-slate-500 text-sm">Environmental Health & Safety is our priority.</p></div></div>
            <div className="flex items-start"><Award className="w-6 h-6 text-orange-500 mr-4 mt-1" /><div><h4 className="font-bold text-lg">Certified Quality</h4><p className="text-slate-500 text-sm">ERA Class B Permit holders.</p></div></div>
            <div className="flex items-start"><Clock className="w-6 h-6 text-orange-500 mr-4 mt-1" /><div><h4 className="font-bold text-lg">Timely Delivery</h4><p className="text-slate-500 text-sm">We value your time and adhere to strict timelines.</p></div></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition"><div className="text-4xl font-bold text-orange-500 mb-2">50+</div><div className="text-sm font-bold uppercase tracking-wide">Projects Done</div></div>
          <div className="bg-slate-800 p-6 rounded-2xl mt-8 border border-slate-700 hover:border-orange-500 transition"><div className="text-4xl font-bold text-orange-500 mb-2">100%</div><div className="text-sm font-bold uppercase tracking-wide">Satisfaction</div></div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition"><div className="text-4xl font-bold text-orange-500 mb-2">24/7</div><div className="text-sm font-bold uppercase tracking-wide">Support</div></div>
          <div className="bg-slate-800 p-6 rounded-2xl mt-8 border border-slate-700 hover:border-orange-500 transition"><div className="text-4xl font-bold text-orange-500 mb-2">2019</div><div className="text-sm font-bold uppercase tracking-wide">Established</div></div>
        </div>
      </div>
    </div>
    <ChatWidget settings={settings} />
  </div>
);

const AboutContent = () => (
  <div className="max-w-7xl mx-auto py-20 px-4 animate-fade-in">
    <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
      <div>
        <h2 className="text-4xl font-bold text-slate-900 mb-6">Who We Are</h2>
        <div className="w-24 h-1.5 bg-orange-600 mb-8 rounded-full"></div>
        <div className="text-slate-600 text-lg leading-relaxed space-y-4">
          <p><strong>Twilight Engineering Company Limited (TECL)</strong> is a premier engineering firm incorporated in 2019. We have grown our capacity to handle large-scale projects ranging from power line construction to advanced security system installations.</p>
          <p>Development and maintenance of low, medium, and high voltage power distribution/transmission lines is our most recognized technical business. Our success is attributed to the dedication of our highly skilled team, which is our main asset.</p>
        </div>
      </div>
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-orange-600">
          <h3 className="text-2xl font-bold mb-4 text-slate-900 flex items-center gap-3"><Anchor className="text-orange-600" /> Our Mission</h3>
          <p className="text-slate-600">To provide overall customer satisfaction through provisioning of quality engineering solutions for all the services we offer. We adhere to and are committed to ensuring our employees' and all stakeholders' safety, ensuring the development of skills and talent for all parties.</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border-l-4 border-orange-600 text-white">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Sun className="text-orange-500" /> Our Vision</h3>
          <p className="text-gray-300">To be the leading engineering solution provider most especially in power distribution and transmission networks in the whole region. We have developed a quality management program to assist in achieving our quality of service to our clients.</p>
        </div>
      </div>
    </div>

    {/* Core Values Section */}
    <div className="mt-20">
      <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">Our Core Values</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: "Accountability", icon: Shield, desc: "We practice transparency in all our dealings." },
          { title: "Quality", icon: Check, desc: "We ensure high standards and excellence in every project." },
          { title: "Timely Delivery", icon: Clock, desc: "We respect timelines and deliver projects on schedule." },
          { title: "Integrity", icon: Lock, desc: "We uphold honesty and strong moral principles." },
          { title: "Skill Development", icon: Award, desc: "We foster talent and skill growth for our team." },
          { title: "Safety (EHS)", icon: HardHat, desc: "Environmental Health & Safety is a priority for all stakeholders." }
        ].map((val, i) => (
           <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:shadow-lg transition text-center group">
             <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition"><val.icon className="w-7 h-7" /></div>
             <h4 className="font-bold text-lg mb-2">{val.title}</h4>
             <p className="text-slate-500 text-sm">{val.desc}</p>
           </div>
        ))}
      </div>
    </div>
  </div>
);

const ServicesContent = () => (
  <div className="bg-slate-50 min-h-screen py-20 px-4 animate-fade-in">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16"><h2 className="text-4xl font-bold text-slate-900 mb-4">Technical Services</h2><p className="text-slate-600">Comprehensive Engineering Solutions</p></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SERVICES_LIST.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-slate-100"><div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600"><s.icon className="w-7 h-7" /></div><h3 className="text-xl font-bold mb-3 text-slate-900">{s.title}</h3><p className="text-slate-600 leading-relaxed text-sm">{s.desc}</p></div>
        ))}
      </div>
    </div>
  </div>
);

const ProjectsContent = ({ projects }: { projects: Project[] }) => {
  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;
  return (
    <div className="bg-white py-20 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto"><h2 className="text-4xl font-bold text-center text-slate-900 mb-16">Our Track Record</h2>
        <div className="space-y-24">{displayProjects.map((p, i) => (
          <div key={i} className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}><div className="lg:w-1/2 w-full"><img src={p.imageUrl} className="rounded-2xl shadow-2xl w-full h-80 object-cover" /></div><div className="lg:w-1/2 w-full"><h3 className="text-3xl font-bold mb-6 text-slate-900">{p.title}</h3><p className="text-slate-600 text-lg border-l-4 border-slate-200 pl-4">{p.description}</p></div></div>
        ))}</div>
      </div>
    </div>
  );
};

const StoreContent = ({ products, addToCart, setIsCartOpen, cartItemCount }: any) => {
  const displayProducts = products.length > 0 ? products : DEFAULT_PRODUCTS;
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 animate-fade-in min-h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-12"><h2 className="text-3xl font-bold text-slate-900">Supply Catalog</h2><button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full"><ShoppingCart className="w-5 h-5" /> Quote ({cartItemCount})</button></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">{displayProducts.map((p: any, i: number) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition border border-slate-100"><img src={p.imageUrl} className="h-64 w-full object-cover" /><div className="p-6"><h3 className="font-bold text-lg mb-2 truncate">{p.name}</h3><div className="flex justify-between pt-4 border-t"><span className="font-black text-slate-900">{p.price > 0 ? `$${p.price}` : 'Inquire'}</span><button onClick={() => addToCart(p)} className="bg-orange-600 text-white p-3 rounded-xl"><Plus className="w-6 h-6" /></button></div></div></div>
      ))}</div>
    </div>
  );
};

const CartDrawer = ({ cart, removeFromCart, setIsCartOpen }: any) => {
  const total = useMemo(() => cart.reduce((a: number, b: any) => a + (b.price * b.quantity), 0).toFixed(2), [cart]);
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl p-0 flex flex-col">
        <div className="p-6 border-b flex justify-between"><h3>Quote Request</h3><button onClick={() => setIsCartOpen(false)}><X /></button></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">{cart.map((i: any) => (<div key={i.id} className="flex gap-4 p-4 border rounded-xl"><img src={i.imageUrl} className="w-16 h-16 rounded object-cover" /><div><h4>{i.name}</h4></div><button onClick={() => removeFromCart(i.id)}><X /></button></div>))}</div>
        {cart.length > 0 && <div className="p-6 border-t"><div className="flex justify-between font-bold text-xl mb-6"><span>Total</span><span>${total}</span></div><button className="w-full bg-slate-900 text-white py-4 rounded-xl">Send Request</button></div>}
      </div>
    </div>
  );
};

// --- ADMIN ---
const AdminContent = ({ products, projects, slides, messages, settings, addProduct, deleteProduct, addProject, deleteProject, addSlide, deleteSlide, deleteMessage, updateSettings, loadDemoData, setIsAdmin }: any) => {
  const [adminTab, setAdminTab] = useState('store'); 
  // FIX: Using local state for the form so typing works immediately without waiting for DB sync
  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [saveStatus, setSaveStatus] = useState('Save Settings');

  // Sync if settings change externally
  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    await updateSettings(formSettings);
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus('Save Settings'), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-fade-in">
      <div className="flex justify-between mb-8 pb-6 border-b"><h2>Admin Dashboard</h2><div className="flex gap-2">{['Store', 'Projects', 'Slides', 'Inbox', 'Settings'].map(t => <button key={t} onClick={() => setAdminTab(t.toLowerCase())} className={`px-4 py-2 rounded ${adminTab===t.toLowerCase()?'bg-orange-100':'bg-slate-50'}`}>{t}</button>)}<button onClick={() => setIsAdmin(false)} className="px-4 py-2 bg-red-50 text-red-600">Exit</button></div></div>
      {adminTab === 'store' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Product</h3><form onSubmit={addProduct} className="space-y-4"><input name="name" required placeholder="Name" className="w-full p-2 border" /><input name="price" required placeholder="Price" className="w-full p-2 border" /><div className="relative"><input name="imageUrl" placeholder="Image URL" className="w-full p-2 border pr-8" /><a href="https://postimages.org/" target="_blank" className="absolute right-2 top-2 text-orange-600 hover:underline"><ExternalLink className="w-4 h-4"/></a></div><p className="text-xs text-slate-400">Click icon to upload image & copy 'Direct Link'</p><select name="category" className="w-full p-2 border"><option>Supplies</option><option>Tools</option></select><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{products.map((p:any) => <tr key={p.id}><td>{p.name}</td><td><button onClick={() => deleteProduct(p.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'projects' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Project</h3><form onSubmit={addProject} className="space-y-4"><input name="title" required placeholder="Title" className="w-full p-2 border" /><input name="client" placeholder="Client" className="w-full p-2 border" /><div className="relative"><input name="imageUrl" placeholder="Image URL" className="w-full p-2 border pr-8" /><a href="https://postimages.org/" target="_blank" className="absolute right-2 top-2 text-orange-600 hover:underline"><ExternalLink className="w-4 h-4"/></a></div><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{projects.map((p:any) => <tr key={p.id}><td>{p.title}</td><td><button onClick={() => deleteProject(p.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'slides' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Slide</h3><form onSubmit={addSlide} className="space-y-4"><input name="title" required placeholder="Title" className="w-full p-2 border" /><input name="subtitle" placeholder="Subtitle" className="w-full p-2 border" /><div className="relative"><input name="imageUrl" placeholder="Image URL" className="w-full p-2 border pr-8" /><a href="https://postimages.org/" target="_blank" className="absolute right-2 top-2 text-orange-600 hover:underline"><ExternalLink className="w-4 h-4"/></a></div><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{slides.map((s:any) => <tr key={s.id}><td>{s.title}</td><td><button onClick={() => deleteSlide(s.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'inbox' && <div className="max-w-4xl mx-auto space-y-4">{messages.map((m:any) => <div key={m.id} className="p-4 border rounded"><div className="flex justify-between font-bold"><span>{m.name} ({m.email})</span><button onClick={() => deleteMessage(m.id)}><Trash2 className="w-4 h-4" /></button></div><p>{m.text}</p></div>)}</div>}
      {adminTab === 'settings' && <div className="max-w-xl mx-auto"><form onSubmit={handleSave} className="space-y-6 bg-white p-8 shadow-xl"><h3>Settings</h3><input name="siteTitle" value={formSettings.siteTitle} onChange={handleChange} placeholder="Site Title" className="w-full p-3 border" /><input name="faviconUrl" value={formSettings.faviconUrl} onChange={handleChange} placeholder="/favicon.png or https://..." className="w-full p-3 border" /><input name="logoUrl" value={formSettings.logoUrl} onChange={handleChange} placeholder="/logo.png or https://..." className="w-full p-3 border" /><input name="footerLogoUrl" value={formSettings.footerLogoUrl} onChange={handleChange} placeholder="Footer Logo URL" className="w-full p-3 border bg-slate-50" /><input name="contactFormUrl" value={formSettings.contactFormUrl} onChange={handleChange} placeholder="Contact Form Endpoint (Formspree URL)" className="w-full p-3 border font-mono bg-slate-50" /><p className="text-xs text-slate-500">Sign up at formspree.io to get a URL for email notifications.</p><input name="adminPin" value={formSettings.adminPin} onChange={handleChange} placeholder="Admin PIN" className="w-full p-3 border" /><button className={`w-full text-white py-3 font-bold ${saveStatus === 'Saved!' ? 'bg-green-600' : 'bg-orange-600'}`}>{saveStatus}</button></form><br/><button onClick={loadDemoData} className="w-full bg-slate-200 py-3">Load Demo Data</button></div>}
    </div>
  );
};

// =================================================================
// 5. MAIN APP
// =================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [footerClickCount, setFooterClickCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // FIX: Default settings now include footerLogoUrl
  const [settings, setSettings] = useState<AppSettings>({ 
    logoUrl: '/logo.svg', 
    footerLogoUrl: '/footer.svg', // Default empty, will fallback to logoUrl
    adminPin: '1234', 
    companyPhone: '+256773505795', 
    companyEmail: 'info@twilighteng.com', 
    siteTitle: 'Twilight Engineering', 
    faviconUrl: '/favicon.png', 
    contactFormUrl: '', 
    metaDescription: '', 
    metaKeywords: '' 
  });

  const cartItemCount = useMemo(() => cart.reduce((a, b) => a + b.quantity, 0), [cart]);

  // --- HASH NAVIGATION & SEO ---
  useEffect(() => {
    // 1. Meta Tags & Favicon
    if (settings.siteTitle) document.title = settings.siteTitle;
    
    // Fallback logic: Use /favicon.png if settings field is empty
    const iconHref = resolveImagePath(settings.faviconUrl);
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = iconHref;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['home', 'about', 'services', 'projects', 'store', 'contact'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [settings]);

  // Update URL hash when tab changes (unless admin)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'admin') window.location.hash = tab;
  };

  useEffect(() => { signInAnonymously(auth); onAuthStateChanged(auth, (u) => setUser(u)); }, []);

  useEffect(() => {
    if (!user) return;
    const unsubProd = onSnapshot(query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'products'), orderBy('createdAt', 'desc')), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product))));
    const unsubProj = onSnapshot(query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'projects'), orderBy('createdAt', 'desc')), (s) => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() } as Project))));
    const unsubSlides = onSnapshot(query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'slides'), orderBy('createdAt', 'desc')), (s) => setSlides(s.docs.map(d => ({ id: d.id, ...d.data() } as Slide))));
    const unsubMsgs = onSnapshot(query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'messages'), orderBy('createdAt', 'desc')), (s) => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() } as Message))));
    const unsubSettings = onSnapshot(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'settings'), (doc) => { if (doc.exists()) setSettings(doc.data() as AppSettings); });
    return () => { unsubProd(); unsubProj(); unsubSlides(); unsubMsgs(); unsubSettings(); };
  }, [user]);

  const handleFooterClick = () => { const n = footerClickCount + 1; setFooterClickCount(n); if (n >= 5) { setShowAdminLogin(true); setFooterClickCount(0); } };
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (adminPinInput === settings.adminPin) { setIsAdmin(true); setShowAdminLogin(false); setActiveTab('admin'); setAdminPinInput(''); } else { alert('Incorrect PIN'); setAdminPinInput(''); } };

  // CRUD Actions
  const addProduct = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'products'), { name: fd.get('name'), category: fd.get('category'), price: Number(fd.get('price')), description: fd.get('description'), imageUrl: fd.get('imageUrl'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const addProject = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'projects'), { title: fd.get('title'), client: fd.get('client'), description: fd.get('description'), imageUrl: fd.get('imageUrl'), stats: (fd.get('stats') as string).split(','), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const addSlide = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'slides'), { title: fd.get('title'), subtitle: fd.get('subtitle'), cta: fd.get('cta'), imageUrl: fd.get('imageUrl'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Added"); };
  const deleteItem = async (col: string, id: string) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', col, id)); };
  
  // FIX: Updated updateSettings to accept the settings object directly from state
  const updateSettings = async (newSettings: AppSettings) => { 
    await setDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'settings'), newSettings, { merge: true });
  };

  const loadDemoData = async () => { if(!confirm("Load demo?")) return; await Promise.all([...DEFAULT_PRODUCTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'products'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_PROJECTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'projects'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_SLIDES.map(s => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'slides'), {...s, createdAt: serverTimestamp()}))]); alert("Loaded!"); };

  const addToCart = (p: Product) => { const pId = p.id || 't-'+Math.random(); setCart(prev => { const ex = prev.find(i => i.id === pId); return ex ? prev.map(i => i.id === pId ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...p, quantity: 1, id: pId}]; }); setIsCartOpen(true); };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const renderContent = () => {
    if (activeTab === 'admin' && !isAdmin) return <HomeContent setActiveTab={handleTabChange} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
    switch (activeTab) {
      case 'home': return <HomeContent setActiveTab={handleTabChange} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
      case 'about': return <AboutContent />;
      case 'services': return <ServicesContent />;
      case 'projects': return <ProjectsContent projects={projects} />;
      case 'store': return <StoreContent products={products} addToCart={addToCart} setIsCartOpen={setIsCartOpen} cartItemCount={cartItemCount} />;
      case 'contact': return <ContactContent settings={settings} />;
      case 'admin': return <AdminContent products={products} projects={projects} slides={slides} messages={messages} settings={settings} addProduct={addProduct} deleteProduct={(id: string) => deleteItem('products', id)} addProject={addProject} deleteProject={(id: string) => deleteItem('projects', id)} addSlide={addSlide} deleteSlide={(id: string) => deleteItem('slides', id)} deleteMessage={(id: string) => deleteItem('messages', id)} updateSettings={updateSettings} loadDemoData={loadDemoData} setIsAdmin={setIsAdmin} />;
      default: return <HomeContent setActiveTab={handleTabChange} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabChange('home')}>
             {/* FIX: Smart path resolution ensures 'logo.svg' works */}
             <img src={resolveImagePath(settings.logoUrl)} alt="Logo" className="h-16 w-auto" /> 
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
            {/* FIX: Footer logo uses dedicated footerLogoUrl, falls back to main logo, then local file */}
            <div className="flex items-center gap-3 mb-6">
               <img src={resolveImagePath(settings.footerLogoUrl || settings.logoUrl)} alt="Logo" className="h-12 w-auto bg-white p-1 rounded" />
            </div>
            <p className="mb-8 max-w-md text-slate-500">Your trusted partner for electrical and civil engineering solutions in Uganda.</p><div className="flex gap-4"><Facebook className="w-5 h-5" /><Twitter className="w-5 h-5" /><Instagram className="w-5 h-5" /></div>
          </div>
          <div><h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-600" /> Location</h3><p className="text-sm">P.O Box 145784, Kawempe GPO,<br/>Kampala, Uganda<br/><br/><span className="text-orange-600 font-bold">Phone</span><br/>+256 773 505 795<br/>+256 754 913 092</p></div>
          <div><h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><Check className="w-4 h-4 text-orange-600" /> Certification</h3><div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><div className="font-bold text-white mb-2">ERA Class B</div><div className="text-xs text-slate-500 uppercase">Permit Number</div><div className="text-sm font-mono text-orange-500">ERA/EIP/CLX/022/5516</div></div></div>
        </div>
        <div className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 cursor-default" onClick={handleFooterClick}>&copy; 2025 Twilight Engineering Co. Ltd. All rights reserved.</div>
      </footer>
      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm relative"><button onClick={() => setShowAdminLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X /></button><div className="text-center mb-8"><Lock className="w-10 h-10 mx-auto text-slate-900 mb-4" /><h3 className="text-2xl font-black text-slate-900 uppercase">System Access</h3></div><form onSubmit={handleLogin} className="space-y-6"><input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} className="w-full bg-slate-100 p-4 rounded-xl text-center text-3xl tracking-[0.5em] font-black outline-none focus:ring-2 focus:ring-orange-500" maxLength={4} placeholder="••••" autoFocus /><button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg">Unlock Dashboard</button></form></div>
        </div>
      )}
      {isCartOpen && <CartDrawer cart={cart} removeFromCart={removeFromCart} setIsCartOpen={setIsCartOpen} />}
    </div>
  );
}