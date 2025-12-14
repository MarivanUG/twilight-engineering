import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Zap, Video, 
  Sun, ShoppingCart, Lock, Trash2, 
  Plus, Check, ChevronRight, ChevronLeft, Facebook, Twitter, Instagram,
  Anchor, Settings, Briefcase, 
  Clock, Award, HardHat, Battery, Monitor, MessageCircle, Send, Layout, User,
  Droplet, Wind, Wrench // FIX: Removed unused 'Globe' import
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
// 2. TYPES & DATA
// =================================================================

interface AppSettings { 
  logoUrl: string; 
  adminPin: string; 
  companyPhone: string; 
  companyEmail: string;
  siteTitle: string;    
  faviconUrl: string;
  contactFormUrl: string; // New field for Formspree/Email endpoint
}

// ... keeping other interfaces same
interface Product { id?: string; name: string; category: string; price: number; description: string; imageUrl: string; }
interface Project { id?: string; title: string; client: string; description: string; imageUrl: string; stats: string[]; }
interface Slide { id?: string; title: string; subtitle: string; imageUrl: string; cta: string; }
interface CartItem extends Product { quantity: number; id: string; }
interface Message { id: string; name: string; email: string; text: string; createdAt: any; read: boolean; }

const DEFAULT_SLIDES = [
  { id: 'd1', imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1920&auto=format&fit=crop", title: "POWERING THE NATION", subtitle: "Specialists in High Voltage Power Line Construction & Distribution.", cta: "Our Services" },
  { id: 'd2', imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920&auto=format&fit=crop", title: "SUSTAINABLE ENERGY", subtitle: "Expert design and installation of Industrial & Domestic Solar Systems.", cta: "View Projects" },
  { id: 'd3', imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1920&auto=format&fit=crop", title: "ADVANCED SECURITY", subtitle: "State-of-the-art CCTV, Access Control, and Surveillance Solutions.", cta: "Contact Us" }
];

const DEFAULT_PROJECTS = [
  { title: "MV & LV Network Construction", client: "EACPL / Kayunga", description: "Construction, testing, and commissioning of 33KV Line on concrete structures.", imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80", stats: ["33KV Line", "Concrete Poles"] },
  { title: "Katosi Water Treatment Plant", client: "Sogea Satom", description: "Installation of 33KV/500KVA Transformer and Bulk Metering Units.", imageUrl: "https://images.unsplash.com/photo-1581094794329-cd1361ddee2d?auto=format&fit=crop&w=800&q=80", stats: ["500KVA Tx", "Industrial"] }
];

const DEFAULT_PRODUCTS = [
  { name: "50KVA Transformer", category: "Supplies", price: 0, description: "High quality distribution transformer.", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=60" },
  { name: "Solar Street Light Kit", category: "Electronics", price: 0, description: "Complete automated solar lighting system.", imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=60" }
];

// =================================================================
// 3. UTILS
// =================================================================

// Function to handle email sending (Formspree) + Database Backup
const sendMessage = async (data: {name: string, email: string, message: string}, endpoint: string) => {
  // 1. Save to Firebase (Backup)
  try {
    await addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'messages'), {
      name: data.name, email: data.email, text: data.message, createdAt: serverTimestamp(), read: false
    });
  } catch (err) { console.error("Firebase save failed", err); }

  // 2. Send to Email via Formspree (if configured)
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

// =================================================================
// 4. COMPONENTS
// =================================================================

const HeroSlider = ({ setActiveTab, logoUrl, slides }: any) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev: number) => (prev + 1) % activeSlides.length), 6000); 
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  return (
    <div className="relative bg-slate-900 text-white min-h-[90vh] flex items-center justify-center overflow-hidden">
      {activeSlides.map((slide: any, index: number) => (
        <div key={slide.id || index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-110" style={{ backgroundImage: `url('${slide.imageUrl}')`, transform: index === currentSlide ? 'scale(100)' : 'scale(110)' }}></div>
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
      ))}
      <div className="relative z-20 max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="w-24 h-auto mb-8 drop-shadow-2xl animate-fade-in-up" />}
        <div className="mb-6 inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/50 px-4 py-2 rounded-full text-orange-400 text-sm font-bold uppercase tracking-wider backdrop-blur-sm animate-fade-in-up"><Zap className="w-4 h-4" /> Creating New Ways</div>
        <div className="h-48 md:h-64 flex flex-col items-center justify-center transition-all duration-500">
            <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none animate-slide-in-right uppercase">{activeSlides[currentSlide].title}</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300 font-light leading-relaxed animate-slide-in-left">{activeSlides[currentSlide].subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
          <button onClick={() => setActiveTab('services')} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold transition flex items-center justify-center shadow-lg shadow-orange-900/30 transform hover:-translate-y-1">{activeSlides[currentSlide].cta || "Learn More"} <ChevronRight className="ml-2 w-5 h-5" /></button>
          <button onClick={() => setActiveTab('contact')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-lg font-bold transition transform hover:-translate-y-1">Contact Us</button>
        </div>
      </div>
      <div className="absolute bottom-8 z-30 flex gap-3">{activeSlides.map((_: any, index: number) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-orange-600 w-8' : 'bg-white/50 hover:bg-white'}`} />))}</div>
    </div>
  );
};

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
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold">TE</div>
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

// ... (HomeContent, AboutContent, ServicesContent, ProjectsContent, StoreContent, CartDrawer components remain largely the same, included below for completeness)

const HomeContent = ({ setActiveTab, logoUrl, slides, settings }: any) => (
  <div className="animate-fade-in">
    <HeroSlider setActiveTab={setActiveTab} logoUrl={logoUrl} slides={slides} />
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16"><h2 className="text-3xl font-bold text-slate-900">Our Expertise</h2><div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div></div>
        <div className="grid md:grid-cols-3 gap-8">
          {[{ icon: Zap, title: "Power & Transmission", desc: "Design and construction of MV/HV lines." }, { icon: Sun, title: "Renewable Energy", desc: "Expert solar sizing and installation." }, { icon: Video, title: "Security Systems", desc: "Advanced CCTV and surveillance setup." }].map((item, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition group">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition"><item.icon className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3><p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <ChatWidget settings={settings} />
  </div>
);

const AboutContent = () => (
  <div className="max-w-7xl mx-auto py-20 px-4 animate-fade-in">
    <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
      <div><h2 className="text-4xl font-bold text-slate-900 mb-6">Who We Are</h2><div className="w-24 h-1.5 bg-orange-600 mb-8 rounded-full"></div><p className="text-slate-600 text-lg leading-relaxed"><strong>Twilight Engineering Company Limited (TECL)</strong> is a premier engineering firm incorporated in 2019.</p></div>
      <div className="space-y-8"><div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-orange-600"><h3 className="text-2xl font-bold mb-4 text-slate-900 flex items-center gap-3"><Anchor className="text-orange-600" /> Mission</h3><p className="text-slate-600">To provide overall customer satisfaction.</p></div></div>
    </div>
  </div>
);

const ServicesContent = () => (
  <div className="bg-slate-50 min-h-screen py-20 px-4 animate-fade-in">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16"><h2 className="text-4xl font-bold text-slate-900 mb-4">Technical Services</h2></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[{ icon: Zap, title: "Power Line Construction", desc: "Surveying, designing, and construction." }, { icon: Video, title: "CCTV & Security", desc: "Installation of IP Cameras." }, { icon: Sun, title: "Solar Systems", desc: "Design and sizing of On-grid and Off-grid." }, { icon: Droplet, title: "Civil & Water Works", desc: "General civil engineering." }, { icon: Wind, title: "AC Systems", desc: "HVAC Installation." }, { icon: Wrench, title: "Underground Cabling", desc: "Specialized cable works." }].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-slate-100"><div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600"><s.icon className="w-7 h-7" /></div><h3 className="text-xl font-bold mb-3 text-slate-900">{s.title}</h3><p className="text-slate-600">{s.desc}</p></div>
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
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-fade-in">
      <div className="flex justify-between mb-8 pb-6 border-b"><h2>Admin Dashboard</h2><div className="flex gap-2">{['Store', 'Projects', 'Slides', 'Inbox', 'Settings'].map(t => <button key={t} onClick={() => setAdminTab(t.toLowerCase())} className={`px-4 py-2 rounded ${adminTab===t.toLowerCase()?'bg-orange-100':'bg-slate-50'}`}>{t}</button>)}<button onClick={() => setIsAdmin(false)} className="px-4 py-2 bg-red-50 text-red-600">Exit</button></div></div>
      {adminTab === 'store' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Product</h3><form onSubmit={addProduct} className="space-y-4"><input name="name" required placeholder="Name" className="w-full p-2 border" /><input name="price" required placeholder="Price" className="w-full p-2 border" /><input name="imageUrl" placeholder="Image URL" className="w-full p-2 border" /><select name="category" className="w-full p-2 border"><option>Supplies</option><option>Tools</option></select><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{products.map((p:any) => <tr key={p.id}><td>{p.name}</td><td><button onClick={() => deleteProduct(p.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'projects' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Project</h3><form onSubmit={addProject} className="space-y-4"><input name="title" required placeholder="Title" className="w-full p-2 border" /><input name="client" placeholder="Client" className="w-full p-2 border" /><input name="imageUrl" placeholder="Image URL" className="w-full p-2 border" /><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{projects.map((p:any) => <tr key={p.id}><td>{p.title}</td><td><button onClick={() => deleteProject(p.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'slides' && <div className="grid lg:grid-cols-3 gap-10"><div><h3>Add Slide</h3><form onSubmit={addSlide} className="space-y-4"><input name="title" required placeholder="Title" className="w-full p-2 border" /><input name="subtitle" placeholder="Subtitle" className="w-full p-2 border" /><input name="imageUrl" placeholder="Image URL" className="w-full p-2 border" /><button className="w-full bg-slate-900 text-white py-2">Add</button></form></div><div className="lg:col-span-2"><table><tbody>{slides.map((s:any) => <tr key={s.id}><td>{s.title}</td><td><button onClick={() => deleteSlide(s.id)}><Trash2 /></button></td></tr>)}</tbody></table></div></div>}
      {adminTab === 'inbox' && <div className="max-w-4xl mx-auto space-y-4">{messages.map((m:any) => <div key={m.id} className="p-4 border rounded"><div className="flex justify-between font-bold"><span>{m.name} ({m.email})</span><button onClick={() => deleteMessage(m.id)}><Trash2 className="w-4 h-4" /></button></div><p>{m.text}</p></div>)}</div>}
      {adminTab === 'settings' && <div className="max-w-xl mx-auto"><form onSubmit={updateSettings} className="space-y-6 bg-white p-8 shadow-xl"><h3>Settings</h3><input name="siteTitle" defaultValue={settings.siteTitle} placeholder="Site Title" className="w-full p-3 border" /><input name="faviconUrl" defaultValue={settings.faviconUrl} placeholder="Favicon URL" className="w-full p-3 border" /><input name="logoUrl" defaultValue={settings.logoUrl} placeholder="Logo URL" className="w-full p-3 border" /><input name="contactFormUrl" defaultValue={settings.contactFormUrl} placeholder="Contact Form Endpoint (Formspree URL)" className="w-full p-3 border font-mono bg-slate-50" /><p className="text-xs text-slate-500">Sign up at formspree.io to get a URL for email notifications.</p><input name="adminPin" defaultValue={settings.adminPin} placeholder="Admin PIN" className="w-full p-3 border" /><button className="w-full bg-orange-600 text-white py-3 font-bold">Save Settings</button></form><br/><button onClick={loadDemoData} className="w-full bg-slate-200 py-3">Load Demo Data</button></div>}
    </div>
  );
};

// =================================================================
// 5. MAIN APP
// =================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
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
  const [settings, setSettings] = useState<AppSettings>({ logoUrl: '', adminPin: '1234', companyPhone: '+256773505795', companyEmail: 'info@twilighteng.com', siteTitle: 'Twilight Engineering', faviconUrl: '', contactFormUrl: '' });

  const cartItemCount = useMemo(() => cart.reduce((a, b) => a + b.quantity, 0), [cart]);

  useEffect(() => {
    if (settings.siteTitle) document.title = settings.siteTitle;
    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = settings.faviconUrl;
    }
  }, [settings]);

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
  const updateSettings = async (e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await setDoc(doc(db, 'artifacts', APP_COLLECTION_ID, 'public', 'settings'), { logoUrl: fd.get('logoUrl'), adminPin: fd.get('adminPin'), companyPhone: '+256773505795', siteTitle: fd.get('siteTitle'), faviconUrl: fd.get('faviconUrl'), contactFormUrl: fd.get('contactFormUrl') }, { merge: true }); alert("Saved"); };
  const loadDemoData = async () => { if(!confirm("Load demo?")) return; await Promise.all([...DEFAULT_PRODUCTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'products'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_PROJECTS.map(p => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'projects'), {...p, createdAt: serverTimestamp()})), ...DEFAULT_SLIDES.map(s => addDoc(collection(db, 'artifacts', APP_COLLECTION_ID, 'public', 'slides'), {...s, createdAt: serverTimestamp()}))]); alert("Loaded!"); };

  const addToCart = (p: Product) => { const pId = p.id || 't-'+Math.random(); setCart(prev => { const ex = prev.find(i => i.id === pId); return ex ? prev.map(i => i.id === pId ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...p, quantity: 1, id: pId}]; }); setIsCartOpen(true); };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const renderContent = () => {
    if (activeTab === 'admin' && !isAdmin) return <HomeContent setActiveTab={setActiveTab} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
    switch (activeTab) {
      case 'home': return <HomeContent setActiveTab={setActiveTab} logoUrl={settings.logoUrl} slides={slides} settings={settings} />;
      case 'about': return <AboutContent />;
      case 'services': return <ServicesContent />;
      case 'projects': return <ProjectsContent projects={projects} />;
      case 'store': return <StoreContent products={products} addToCart={addToCart} setIsCartOpen={setIsCartOpen} cartItemCount={cartItemCount} />;
      case 'contact': return <ContactContent settings={settings} />;
      case 'admin': return <AdminContent products={products} projects={projects} slides={slides} messages={messages} settings={settings} addProduct={addProduct} deleteProduct={(id: string) => deleteItem('products', id)} addProject={addProject} deleteProject={(id: string) => deleteItem('projects', id)} addSlide={addSlide} deleteSlide={(id: string) => deleteItem('slides', id)} deleteMessage={(id: string) => deleteItem('messages', id)} updateSettings={updateSettings} loadDemoData={loadDemoData} setIsAdmin={setIsAdmin} />;
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
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm relative"><button onClick={() => setShowAdminLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X /></button><div className="text-center mb-8"><Lock className="w-10 h-10 mx-auto text-slate-900 mb-4" /><h3 className="text-2xl font-black text-slate-900 uppercase">System Access</h3></div><form onSubmit={handleLogin} className="space-y-6"><input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} className="w-full bg-slate-100 p-4 rounded-xl text-center text-3xl tracking-[0.5em] font-black outline-none focus:ring-2 focus:ring-orange-500" maxLength={4} placeholder="••••" autoFocus /><button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg">Unlock Dashboard</button></form></div>
        </div>
      )}
      {isCartOpen && <CartDrawer cart={cart} removeFromCart={(id: string) => setCart(prev => prev.filter(i => i.id !== id))} setIsCartOpen={setIsCartOpen} />}
    </div>
  );
}