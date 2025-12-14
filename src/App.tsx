import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Zap, Video, 
  Sun, ShoppingCart, Lock, Trash2, 
  Plus, Check, ChevronRight, ChevronLeft, Facebook, Twitter, Instagram,
  Anchor, Settings, Briefcase, 
  Clock, Award, HardHat, Battery, Monitor, MessageCircle, Send, Layout, User,
  // FIX: Added missing icons causing the crash
  Droplet, Wind, Wrench
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

const APP_COLLECTION_ID = 'twilight-production-v6'; 

// =================================================================
// 2. DEFAULT DATA 
// =================================================================

const DEFAULT_SLIDES = [
  {
    id: 'd1',
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1920&q=80",
    title: "POWERING THE NATION",
    subtitle: "Specialists in High Voltage Power Line Construction & Distribution.",
    cta: "Our Services"
  },
  {
    id: 'd2',
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80",
    title: "SUSTAINABLE ENERGY",
    subtitle: "Expert design and installation of Industrial & Domestic Solar Systems.",
    cta: "View Projects"
  },
  {
    id: 'd3',
    imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1920&q=80",
    title: "ADVANCED SECURITY",
    subtitle: "State-of-the-art CCTV, Access Control, and Surveillance Solutions.",
    cta: "Contact Us"
  }
];

const DEFAULT_PROJECTS = [
  {
    title: "MV & LV Network Construction",
    client: "EACPL / Kayunga",
    description: "Construction, testing, and commissioning of 33KV Line on concrete structures using 100sqmm ACSR Conductor. Included 1.2km of underground cabling.",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    stats: ["33KV Line", "Concrete Poles", "Commissioned"]
  },
  {
    title: "Katosi Water Treatment Plant",
    client: "Sogea Satom",
    description: "Installation of 33KV/500KVA Transformer, Bulk Metering Units, and complex underground cable works for the water treatment facility.",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-cd1361ddee2d?auto=format&fit=crop&w=800&q=80",
    stats: ["500KVA Tx", "Industrial", "Cabling"]
  },
  {
    title: "Network Rehabilitation",
    client: "Nile Heavy Engineering",
    description: "Power evacuation for 6.5 MW Bukinda Small Hydro Power Project. Installation of auto-reclosers and metering units.",
    imageUrl: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?auto=format&fit=crop&w=800&q=80",
    stats: ["Hydro Power", "Rehabilitation", "HV"]
  },
  {
    title: "Factory Power Supply",
    client: "Bwiza Furniture World",
    description: "Design and supply of materials. Installation of 400m Overhead network using AAAC 100 and 50KVA transformer.",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    stats: ["Factory", "50KVA", "3-Phase"]
  }
];

const DEFAULT_PRODUCTS = [
  {
    name: "50KVA Transformer",
    category: "Supplies",
    price: 0,
    description: "High quality distribution transformer for industrial use.",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "100sqmm ACSR Conductor",
    category: "Cables",
    price: 0,
    description: "Aluminum Conductor Steel Reinforced for overhead transmission.",
    imageUrl: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "Solar Street Light Kit",
    category: "Electronics",
    price: 0,
    description: "Complete automated solar lighting system for compounds and roads.",
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "Safety Helmet & Vest",
    category: "Safety",
    price: 0,
    description: "Standard PPE for site engineers and technicians.",
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=500&q=60"
  }
];

// =================================================================
// 3. TYPES
// =================================================================

interface Product { id?: string; name: string; category: string; price: number; description: string; imageUrl: string; }
interface Project { id?: string; title: string; client: string; description: string; imageUrl: string; stats: string[]; }
interface Slide { id?: string; title: string; subtitle: string; imageUrl: string; cta: string; }
interface CartItem extends Product { quantity: number; id: string; }
interface AppSettings { logoUrl: string; adminPin: string; companyPhone: string; companyEmail: string; }
interface Message { id: string; name: string; email: string; text: string; createdAt: any; read: boolean; }

// =================================================================
// 4. COMPONENTS
// =================================================================

// --- HERO SLIDER ---
const HeroSlider = ({ setActiveTab, logoUrl, slides }: { setActiveTab: (tab: string) => void, logoUrl: string, slides: Slide[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  return (
    <div className="relative bg-slate-900 text-white min-h-[90vh] flex items-center justify-center overflow-hidden">
      {activeSlides.map((slide, index) => (
        <div key={slide.id || index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-110" 
               style={{ backgroundImage: `url('${slide.imageUrl}')`, transform: index === currentSlide ? 'scale(100)' : 'scale(110)' }}></div>
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
      ))}

      <div className="relative z-20 max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="w-24 h-auto mb-8 drop-shadow-2xl animate-fade-in-up" />}
        <div className="mb-6 inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/50 px-4 py-2 rounded-full text-orange-400 text-sm font-bold uppercase tracking-wider backdrop-blur-sm animate-fade-in-up">
          <Zap className="w-4 h-4" /> Creating New Ways
        </div>

        <div className="h-48 md:h-64 flex flex-col items-center justify-center transition-all duration-500">
            <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none animate-slide-in-right uppercase">
              {activeSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300 font-light leading-relaxed animate-slide-in-left">
              {activeSlides[currentSlide].subtitle}
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
          <button onClick={() => setActiveTab('services')} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold transition flex items-center justify-center shadow-lg shadow-orange-900/30 transform hover:-translate-y-1">
            {activeSlides[currentSlide].cta || "Learn More"} <ChevronRight className="ml-2 w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('contact')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-lg font-bold transition transform hover:-translate-y-1">
            Contact Us
          </button>
        </div>
      </div>

      <button onClick={prevSlide} className="absolute left-4 z-30 p-3 bg-white/10 hover:bg-orange-600 rounded-full backdrop-blur-md transition group hidden md:block">
        <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 z-30 p-3 bg-white/10 hover:bg-orange-600 rounded-full backdrop-blur-md transition group hidden md:block">
        <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition" />
      </button>

      <div className="absolute bottom-8 z-30 flex gap-3">
        {activeSlides.map((_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-orange-600 w-8' : 'bg-white/50 hover:bg-white'}`} />
        ))}
      </div>
    </div>
  );
};

// --- CHAT WIDGET ---
const ChatWidget = ({ settings }: { settings: AppSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('input'); 
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('sending');
    try {
      await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'messages'), {
        ...formData, createdAt: serverTimestamp(), read: false
      });
      setStep('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error(error);
      alert("Error sending message. Please try again.");
      setStep('input');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl mb-4 w-80 sm:w-96 overflow-hidden border border-slate-100 animate-fade-in-up">
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold">TE</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <h4 className="font-bold text-sm">Twilight Support</h4>
                <p className="text-xs text-slate-300">We reply typically in minutes</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 bg-slate-50 min-h-[300px]">
             {step === 'input' && (
               <form onSubmit={handleSubmit} className="space-y-4">
                 <p className="text-sm text-slate-600 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                   Hello! How can we help you today? Leave us a message or chat on WhatsApp.
                 </p>
                 <input required type="text" placeholder="Your Name" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <input required type="email" placeholder="Your Email" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 <textarea required placeholder="How can we help?" rows={3} className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                 <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                   <Send className="w-4 h-4" /> Send Message
                 </button>
               </form>
             )}

             {step === 'sending' && (
               <div className="flex flex-col items-center justify-center h-full py-10">
                 <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-sm text-slate-500">Sending...</p>
               </div>
             )}

             {step === 'success' && (
               <div className="text-center py-8">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-6 h-6" /></div>
                 <h4 className="font-bold text-slate-900 mb-2">Message Sent!</h4>
                 <p className="text-sm text-slate-500 mb-6">We have received your message and will email you shortly.</p>
                 <button onClick={() => setStep('input')} className="text-orange-600 text-sm font-bold hover:underline">Send another</button>
               </div>
             )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <a 
              href={`https://wa.me/${settings.companyPhone?.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#20bd5a] transition"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:bg-orange-700 transition transform hover:scale-110">
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

// --- HOME CONTENT ---
const HomeContent = ({ setActiveTab, logoUrl, slides, settings }: any) => (
  <div className="animate-fade-in">
    <HeroSlider setActiveTab={setActiveTab} logoUrl={logoUrl} slides={slides} />
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Our Expertise</h2>
          <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Providing world-class engineering solutions across multiple disciplines.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Power & Transmission", desc: "Design and construction of MV/HV lines, substations, and transformer installations." },
            { icon: Sun, title: "Renewable Energy", desc: "Expert solar sizing, installation of solar water heaters, pumps, and automated street lighting." },
            { icon: Video, title: "Security Systems", desc: "Advanced CCTV IP camera installations, security alarms, and remote surveillance setup." }
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition group">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
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
        <p className="text-slate-600 text-lg leading-relaxed mb-4"><strong>Twilight Engineering Company Limited (TECL)</strong> is a premier engineering firm incorporated in 2019. We have grown our capacity to handle large-scale projects ranging from power line construction to advanced security system installations.</p>
        <p className="text-slate-600 text-lg leading-relaxed">Our success is attributed to the dedication of our highly skilled team—our main asset. We treasure all our stakeholders and strive to empower them everywhere we go.</p>
      </div>
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-orange-600"><h3 className="text-2xl font-bold mb-4 text-slate-900 flex items-center gap-3"><Anchor className="text-orange-600" /> Our Mission</h3><p className="text-slate-600">To provide overall customer satisfaction through provisioning of quality engineering solutions for all services we offer, adhering to safety and skills development.</p></div>
        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border-l-4 border-orange-600 text-white"><h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Sun className="text-orange-500" /> Our Vision</h3><p className="text-gray-300">To be the leading engineering solution provider, especially in power distribution and transmission networks in the whole region.</p></div>
      </div>
    </div>
  </div>
);

const ServicesContent = () => (
  <div className="bg-slate-50 min-h-screen py-20 px-4 animate-fade-in">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Technical Services</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">We offer comprehensive engineering solutions.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: Zap, title: "Power Line Construction", desc: "Surveying, designing, and construction of MV/HV networks." },
          { icon: Video, title: "CCTV & Security", desc: "Installation of IP Cameras, alarms, and surveillance systems." },
          { icon: Sun, title: "Solar Systems", desc: "Design and sizing of On-grid and Off-grid solar systems." },
          { icon: Droplet, title: "Civil & Water Works", desc: "General civil engineering, plumbing, and pump installations." },
          { icon: Wind, title: "AC Systems", desc: "Design, installation, and maintenance of Air Conditioning." },
          { icon: Wrench, title: "Underground Cabling", desc: "Specialized underground cable works for MV lines." },
          { icon: Battery, title: "Material Supply", desc: "Supply of all electrical materials and appliances for projects." },
          { icon: Monitor, title: "Electrical Wiring", desc: "Industrial, Commercial & Residential wiring services." },
        ].map((service, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-slate-100 group">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <service.icon className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{service.title}</h3>
            <p className="text-slate-600 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProjectsContent = ({ projects }: { projects: Project[] }) => {
  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;
  return (
    <div className="bg-white py-20 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Our Track Record</h2>
        <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">We have successfully completed numerous projects for major clients across Uganda.</p>
        <div className="space-y-24">
          {displayProjects.map((project, idx) => (
            <div key={idx} className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center group`}>
              <div className="lg:w-1/2 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl h-80 lg:h-96 w-full bg-slate-100">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition duration-500 z-10"></div>
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="text-orange-600 font-bold mb-2 tracking-widest text-sm uppercase">{project.client}</div>
                <h3 className="text-3xl font-bold mb-6 text-slate-900">{project.title}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.stats && project.stats.map((stat, s) => <span key={s} className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">{stat}</span>)}
                </div>
                <p className="text-slate-600 text-lg leading-relaxed border-l-4 border-slate-200 pl-4">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContactContent = () => (
  <div className="bg-slate-900 text-white py-20 px-4 animate-fade-in min-h-[80vh]">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
          <p className="text-gray-400 mb-10 text-lg">Ready to start your project or need a quote? Contact our engineering team today.</p>
          <div className="space-y-8">
            <div className="flex items-start"><div className="bg-slate-800 p-4 rounded-lg mr-6"><MapPin className="text-white w-6 h-6" /></div><div><h4 className="font-bold text-xl mb-1 text-white">Visit Us</h4><p className="text-gray-400">P.O Box 145784, Kawempe GPO,<br/>Kampala, Uganda</p></div></div>
            <div className="flex items-start"><div className="bg-slate-800 p-4 rounded-lg mr-6"><Phone className="text-white w-6 h-6" /></div><div><h4 className="font-bold text-xl mb-1 text-white">Call Us</h4><p className="text-gray-400">+256 773 505 795<br/>+256 754 913 092</p></div></div>
            <div className="flex items-start"><div className="bg-slate-800 p-4 rounded-lg mr-6"><Mail className="text-white w-6 h-6" /></div><div><h4 className="font-bold text-xl mb-1 text-white">Email Us</h4><p className="text-gray-400">info@twilighteng.com</p></div></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 md:p-10 text-slate-800 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Message Sent!"); }}>
            <div className="grid grid-cols-2 gap-4"><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="First Name" /><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Last Name" /></div>
            <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Email Address" />
            <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none" placeholder="Your Message..."></textarea>
            <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg hover:bg-orange-700 transition shadow-lg">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

const StoreContent = ({ products, addToCart, setIsCartOpen, cartItemCount }: any) => {
  const displayProducts = products.length > 0 ? products : DEFAULT_PRODUCTS;
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 animate-fade-in min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div><h2 className="text-3xl font-bold text-slate-900">Supply Catalog</h2><p className="text-slate-500 mt-2 text-lg">Genuine electrical materials and equipment.</p></div>
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full hover:bg-orange-600 transition shadow-xl"><ShoppingCart className="w-5 h-5" /><span className="font-bold">Request Quote ({cartItemCount})</span></button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayProducts.map((product: any, idx: number) => (
          <div key={product.id || idx} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition duration-300 group border border-slate-100">
            <div className="h-64 overflow-hidden bg-slate-100 relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white shadow-sm">{product.category}</div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2 text-slate-900 truncate">{product.name}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{product.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-2xl font-black text-slate-900">{product.price > 0 ? `$${product.price}` : 'Inquire'}</span>
                <button onClick={() => addToCart(product)} className="bg-orange-600 text-white p-3 rounded-xl hover:bg-slate-900 transition shadow-lg"><Plus className="w-6 h-6" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ADMIN / CMS ---
interface AdminProps {
  products: Product[]; projects: Project[]; slides: Slide[]; messages: Message[]; settings: AppSettings;
  addProduct: (e: React.FormEvent) => Promise<void>; deleteProduct: (id: string) => Promise<void>;
  addProject: (e: React.FormEvent) => Promise<void>; deleteProject: (id: string) => Promise<void>;
  addSlide: (e: React.FormEvent) => Promise<void>; deleteSlide: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  updateSettings: (e: React.FormEvent) => Promise<void>; loadDemoData: () => Promise<void>; setIsAdmin: (v: boolean) => void;
}

const AdminContent = ({ products, projects, slides, messages, settings, addProduct, deleteProduct, addProject, deleteProject, addSlide, deleteSlide, deleteMessage, updateSettings, loadDemoData, setIsAdmin }: AdminProps) => {
  const [adminTab, setAdminTab] = useState('store'); 

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-200 pb-6 gap-4">
        <div><h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3"><Lock className="text-orange-600" /> Admin Dashboard</h2><p className="text-slate-500 mt-1">Manage content and settings.</p></div>
        <div className="flex gap-2 flex-wrap">
          {['Store', 'Projects', 'Slides', 'Inbox', 'Settings'].map(t => (
            <button key={t} onClick={() => setAdminTab(t.toLowerCase())} className={`px-4 py-2 rounded-lg font-bold transition ${adminTab === t.toLowerCase() ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 hover:bg-slate-100'}`}>{t}</button>
          ))}
          <button onClick={() => setIsAdmin(false)} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-bold transition ml-4">Exit</button>
        </div>
      </div>

      {adminTab === 'store' && (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900"><Plus className="w-5 h-5 mr-2 text-orange-600" /> Add Product</h3>
              <form onSubmit={addProduct} className="space-y-5">
                <input name="name" required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Product Name" />
                <div className="grid grid-cols-2 gap-4">
                  <select name="category" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none"><option value="Supplies">Supplies</option><option value="Tools">Tools</option><option value="Safety">Safety</option><option value="Cables">Cables</option></select>
                  <input name="price" required type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Price $" />
                </div>
                <input name="imageUrl" type="url" placeholder="Image URL (Square rec.)" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" />
                <textarea name="description" rows={3} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Description"></textarea>
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">Add Product</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold"><tr><th className="p-5">Product</th><th className="p-5">Price</th><th className="p-5 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{products.map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="p-5 flex items-center gap-4"><img src={p.imageUrl} className="w-12 h-12 rounded object-cover" /><span className="font-bold text-slate-900">{p.name}</span></td><td className="p-5 font-bold">${p.price}</td><td className="p-5 text-right"><button onClick={() => deleteProduct(p.id!)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button></td></tr>))}</tbody></table>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'projects' && (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900"><Plus className="w-5 h-5 mr-2 text-orange-600" /> Add Project</h3>
              <form onSubmit={addProject} className="space-y-5">
                <input name="title" required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Project Title" />
                <input name="client" required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Client Name" />
                <input name="imageUrl" type="url" placeholder="Image URL (Landscape rec.)" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" />
                <input name="stats" type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Tags/Stats (comma separated)" />
                <textarea name="description" rows={3} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Project Description"></textarea>
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">Add Project</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
               <table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold"><tr><th className="p-5">Project</th><th className="p-5">Client</th><th className="p-5 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{projects.map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="p-5 flex items-center gap-4"><img src={p.imageUrl} className="w-16 h-10 rounded object-cover" /><span className="font-bold text-slate-900">{p.title}</span></td><td className="p-5 text-sm">{p.client}</td><td className="p-5 text-right"><button onClick={() => deleteProject(p.id!)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button></td></tr>))}</tbody></table>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'slides' && (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900"><Layout className="w-5 h-5 mr-2 text-orange-600" /> Add Slide</h3>
              <form onSubmit={addSlide} className="space-y-5">
                <input name="title" required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Main Title" />
                <textarea name="subtitle" required rows={2} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Subtitle / Tagline"></textarea>
                <input name="cta" type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="Button Text (e.g. Learn More)" />
                <div>
                  <input name="imageUrl" required type="url" placeholder="Image URL" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" />
                  <p className="text-xs text-slate-400 mt-1">Recommended: 1920x1080px (Landscape)</p>
                </div>
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">Add Slide</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
               {slides.length === 0 ? <p className="p-8 text-center text-slate-400">Using default demo slides.</p> : 
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold"><tr><th className="p-5">Slide</th><th className="p-5 text-right">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {slides.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-5 flex items-center gap-4"><img src={s.imageUrl} className="w-24 h-16 rounded object-cover" /><div><div className="font-bold text-slate-900">{s.title}</div><div className="text-xs text-slate-500">{s.subtitle}</div></div></td>
                        <td className="p-5 text-right"><button onClick={() => deleteSlide(s.id!)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               }
            </div>
          </div>
        </div>
      )}

      {adminTab === 'inbox' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-orange-600" /> Messages from Website</h3></div>
             {messages.length === 0 ? <p className="p-12 text-center text-slate-400">No messages yet.</p> :
              <div className="divide-y divide-slate-100">
                {messages.map(m => (
                  <div key={m.id} className="p-6 hover:bg-orange-50/20 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900"><User className="w-4 h-4 text-slate-400" /> {m.name} <span className="text-sm text-slate-400 font-normal">&lt;{m.email}&gt;</span></div>
                      <button onClick={() => deleteMessage(m.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-slate-600 mb-3">{m.text}</p>
                    <div className="text-xs text-slate-400">{m.createdAt?.toDate().toLocaleString()}</div>
                  </div>
                ))}
              </div>
             }
          </div>
        </div>
      )}

      {adminTab === 'settings' && (
        <div className="max-w-xl mx-auto space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900"><Settings className="w-5 h-5 mr-2 text-orange-600" /> General Settings</h3>
            <form onSubmit={updateSettings} className="space-y-6">
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Company Logo URL</label><input name="logoUrl" type="url" defaultValue={settings.logoUrl} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none" placeholder="https://..." /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Admin PIN</label><input name="adminPin" type="text" defaultValue={settings.adminPin} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none font-mono tracking-widest" maxLength={4} /></div>
              <button className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg">Save Settings</button>
            </form>
          </div>
          <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200">
             <h3 className="text-lg font-bold mb-4 text-slate-800">Data Management</h3>
             <button onClick={loadDemoData} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition flex items-center justify-center gap-2"><Briefcase className="w-4 h-4" /> Load Demo Data</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CART DRAWER ---
const CartDrawer = ({ cart, removeFromCart, setIsCartOpen }: any) => {
  const totalEstimate = useMemo(() => cart.reduce((a: number, b: any) => a + (b.price * b.quantity), 0).toFixed(2), [cart]);
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl p-0 flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><div><h3 className="text-2xl font-bold text-slate-900">Quote Request</h3></div><button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><X /></button></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? <p className="text-center text-slate-400 mt-10">List is empty.</p> : cart.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm"><img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover" /><div className="flex-1 min-w-0"><h4 className="font-bold truncate">{item.name}</h4><div className="text-orange-600 font-bold">${item.price} <span className="text-slate-400 text-xs font-normal">x{item.quantity}</span></div></div><button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button></div>
          ))}
        </div>
        {cart.length > 0 && <div className="p-6 border-t border-slate-100 bg-slate-50"><div className="flex justify-between font-bold text-xl mb-6"><span>Total Est.</span><span>${totalEstimate}</span></div><button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">Send Request</button></div>}
      </div>
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
  const [settings, setSettings] = useState<AppSettings>({ logoUrl: '', adminPin: '1234', companyPhone: '+256773505795', companyEmail: 'info@twilighteng.com' });

  const cartItemCount = useMemo(() => cart.reduce((a, b) => a + b.quantity, 0), [cart]);

  useEffect(() => { signInAnonymously(auth); onAuthStateChanged(auth, (u) => setUser(u)); }, []);

  useEffect(() => {
    if (!user) return;
    const qProd = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'products'), orderBy('createdAt', 'desc'));
    const qProj = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'projects'), orderBy('createdAt', 'desc'));
    const qSlides = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'slides'), orderBy('createdAt', 'desc'));
    const qMsgs = query(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'messages'), orderBy('createdAt', 'desc'));
    
    const unsubProd = onSnapshot(qProd, (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product))));
    const unsubProj = onSnapshot(qProj, (s) => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() } as Project))));
    const unsubSlides = onSnapshot(qSlides, (s) => setSlides(s.docs.map(d => ({ id: d.id, ...d.data() } as Slide))));
    const unsubMsgs = onSnapshot(qMsgs, (s) => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() } as Message))));

    const unsubSettings = onSnapshot(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'settings'), (doc) => { if (doc.exists()) setSettings(doc.data() as AppSettings); });

    return () => { unsubProd(); unsubProj(); unsubSlides(); unsubMsgs(); unsubSettings(); };
  }, [user]);

  const handleFooterClick = () => { const n = footerClickCount + 1; setFooterClickCount(n); if (n >= 5) { setShowAdminLogin(true); setFooterClickCount(0); } };
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (adminPinInput === settings.adminPin) { setIsAdmin(true); setShowAdminLogin(false); setActiveTab('admin'); setAdminPinInput(''); } else { alert('Incorrect PIN'); setAdminPinInput(''); } };

  const addProduct = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'products'), { name: fd.get('name'), category: fd.get('category'), price: Number(fd.get('price')), description: fd.get('description'), imageUrl: fd.get('imageUrl'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Product Added"); };
  const addProject = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'projects'), { title: fd.get('title'), client: fd.get('client'), description: fd.get('description'), imageUrl: fd.get('imageUrl'), stats: (fd.get('stats') as string).split(',').map(s => s.trim()), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Project Added"); };
  const addSlide = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'slides'), { title: fd.get('title'), subtitle: fd.get('subtitle'), cta: fd.get('cta'), imageUrl: fd.get('imageUrl'), createdAt: serverTimestamp() }); (e.target as HTMLFormElement).reset(); alert("Slide Added"); };
  
  const updateSettings = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await setDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'settings'), { logoUrl: fd.get('logoUrl'), adminPin: fd.get('adminPin'), companyPhone: '+256773505795' }, { merge: true }); alert("Settings Saved"); };
  const loadDemoData = async () => { if(!confirm("Load demo data?")) return; try { await Promise.all([...DEFAULT_PRODUCTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'products'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_PROJECTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'projects'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_SLIDES.map(s => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'slides'), {...s, createdAt: serverTimestamp()}))]); alert("Data loaded!"); } catch(e) { console.error(e); } };

  const deleteItem = async (col: string, id: string) => { if(confirm("Delete item?")) await deleteDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', col, id)); };
  const addToCart = (p: Product) => { const pId = p.id || 'temp-'+Math.random(); setCart(prev => { const ex = prev.find(i => i.id === pId); return ex ? prev.map(i => i.id === pId ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...p, quantity: 1, id: pId }]; }); setIsCartOpen(true); };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const renderContent = () => {
    if (activeTab === 'admin' && !isAdmin) return <HomeContent setActiveTab={setActiveTab} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
    switch (activeTab) {
      case 'home': return <HomeContent setActiveTab={setActiveTab} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
      case 'about': return <AboutContent />;
      case 'services': return <ServicesContent />;
      case 'projects': return <ProjectsContent projects={projects} />;
      case 'store': return <StoreContent products={products} addToCart={addToCart} setIsCartOpen={setIsCartOpen} cartItemCount={cartItemCount} />;
      case 'contact': return <ContactContent />;
      case 'admin': return <AdminContent products={products} projects={projects} slides={slides} messages={messages} settings={settings} addProduct={addProduct} deleteProduct={(id) => deleteItem('products', id)} addProject={addProject} deleteProject={(id) => deleteItem('projects', id)} addSlide={addSlide} deleteSlide={(id) => deleteItem('slides', id)} deleteMessage={(id) => deleteItem('messages', id)} updateSettings={updateSettings} loadDemoData={loadDemoData} setIsAdmin={setIsAdmin} />;
      default: return <HomeContent setActiveTab={setActiveTab} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('home')}>
             {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="h-12 w-auto" /> : <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-2xl">TE</div>}
            <div className="hidden sm:block"><div className="font-black text-xl text-slate-900 leading-none">TWILIGHT</div><div className="font-bold text-sm text-orange-600 tracking-widest uppercase">Engineering</div></div>
          </div>
          <div className="hidden lg:flex items-center gap-8">{['Home', 'About', 'Services', 'Store', 'Projects', 'Contact'].map(item => (<button key={item} onClick={() => setActiveTab(item.toLowerCase())} className={`text-sm font-bold uppercase tracking-wider relative py-2 group ${activeTab === item.toLowerCase() ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>{item}<span className={`absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 transform transition-transform ${activeTab === item.toLowerCase() ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span></button>))}{isAdmin && <button onClick={() => setActiveTab('admin')} className="text-xs font-bold uppercase text-white bg-red-500 px-4 py-2 rounded-full hover:bg-red-600">Admin</button>}</div>
          <div className="lg:hidden flex items-center gap-4"><button onClick={() => setIsCartOpen(true)} className="p-2 relative"><ShoppingCart className="w-6 h-6" />{cartItemCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-orange-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">{cartItemCount}</span>}</button><button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button></div>
        </div>
        {isMenuOpen && <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-2xl z-50">{['Home', 'About', 'Services', 'Store', 'Projects', 'Contact'].map(item => (<button key={item} onClick={() => { setActiveTab(item.toLowerCase()); setIsMenuOpen(false); }} className="block w-full text-left px-6 py-4 font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 border-b border-slate-50">{item}</button>))}{isAdmin && <button onClick={() => {setActiveTab('admin'); setIsMenuOpen(false)}} className="block w-full text-left px-6 py-4 font-bold text-red-600 bg-red-50">Admin</button>}</div>}
      </nav>

      <main>{renderContent()}</main>

      <footer className="bg-slate-950 text-slate-400 py-16 px-4 mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center text-white font-black text-xl">T</div><span className="text-2xl font-bold text-white">TWILIGHT</span></div><p className="mb-8 max-w-md text-slate-500">Your trusted partner for electrical and civil engineering solutions in Uganda.</p><div className="flex gap-4"><Facebook className="w-5 h-5" /><Twitter className="w-5 h-5" /><Instagram className="w-5 h-5" /></div></div>
          <div><h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-600" /> Location</h3><p className="text-sm">P.O Box 145784, Kawempe GPO,<br/>Kampala, Uganda<br/><br/><span className="text-orange-600 font-bold">Phone</span><br/>+256 773 505 795<br/>+256 754 913 092</p></div>
          <div><h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><Check className="w-4 h-4 text-orange-600" /> Certification</h3><div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><div className="font-bold text-white mb-2">ERA Class B</div><div className="text-xs text-slate-500 uppercase">Permit Number</div><div className="text-sm font-mono text-orange-500">ERA/EIP/CLX/022/5516</div></div></div>
        </div>
        <div className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 cursor-default" onClick={handleFooterClick}>&copy; 2025 Twilight Engineering Co. Ltd. All rights reserved.</div>
      </footer>

      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button onClick={() => setShowAdminLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X /></button>
            <div className="text-center mb-8"><Lock className="w-10 h-10 mx-auto text-slate-900 mb-4" /><h3 className="text-2xl font-black text-slate-900 uppercase">System Access</h3></div>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} className="w-full bg-slate-100 p-4 rounded-xl text-center text-3xl tracking-[0.5em] font-black outline-none focus:ring-2 focus:ring-orange-500" maxLength={4} placeholder="••••" autoFocus />
              <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg">Unlock Dashboard</button>
            </form>
          </div>
        </div>
      )}
      {isCartOpen && <CartDrawer cart={cart} removeFromCart={removeFromCart} setIsCartOpen={setIsCartOpen} />}
    </div>
  );
}