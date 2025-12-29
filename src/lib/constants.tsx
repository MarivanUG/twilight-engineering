import {
  Menu, X, ShoppingCart, Phone, Facebook, Twitter, Instagram, Linkedin,
  Mail, MapPin, MessageSquare, Send, User, Bot, Loader2, Trash2, Plus,
  Minus, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Truck, Shield,
  Wrench, BarChart3, Users, Clock, Quote, Star, Search, Filter, Calendar,
  Tag, ExternalLink, Check, Package, Target, Eye, Award, CheckCircle, Globe,
  LayoutDashboard, Settings, Save, LogOut, Bell, Zap, Sun, Video, Droplet, Wind, Battery, Monitor, HardHat
} from 'lucide-react';
import type { Slide, Service, Partner, Testimonial, TeamMember, Project, Product } from '../types'; // Import all necessary types

export const APP_COLLECTION_ID = 'twilight-production-v8';

export const ICON_MAP: { [key: string]: React.ForwardRefExoticComponent<any> } = {
  Menu, X, ShoppingCart, Phone, Facebook, Twitter, Instagram, Linkedin,
  Mail, MapPin, MessageSquare, Send, User, Bot, Loader2, Trash2, Plus,
  Minus, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Truck, Shield,
  Wrench, BarChart3, Users, Clock, Quote, Star, Search, Filter, Calendar,
  Tag, ExternalLink, Check, Package, Target, Eye, Award, CheckCircle, Globe,
  LayoutDashboard, Settings, Save, LogOut, Bell, Zap, Sun, Video, Droplet, Wind, Battery, Monitor, HardHat
};

export const DEFAULT_SLIDES: Slide[] = [
  { id: 'd1', imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1920&auto=format&fit=crop", title: "POWERING THE NATION", subtitle: "Specialists in High Voltage Power Line Construction.", cta: "Our Services" },
  { id: 'd2', imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920&auto=format&fit=crop", title: "SUSTAINABLE ENERGY", subtitle: "Expert design and installation of Industrial & Domestic Solar Systems.", cta: "View Projects" },
  { id: 'd3', imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1920&auto=format&fit=crop", title: "ADVANCED SECURITY", subtitle: "State-of-the-art CCTV IP Camera installations and Security Alarms.", cta: "Contact Us" }
];

export const DEFAULT_SERVICES: Service[] = [
  { id: 'ds1', icon: 'Truck', title: "Logistics", description: "Efficient supply chain solutions." },
  { id: 'ds2', icon: 'Shield', title: "Security", description: "State-of-the-art surveillance." },
  { id: 'ds3', icon: 'Wrench', title: "Maintenance", description: "Proactive infrastructure care." },
  { id: 'ds4', icon: 'BarChart3', title: "Strategy", description: "Data-driven consultancy." },
  { id: 'ds5', icon: 'Users', title: "HR Solutions", description: "Talent acquisition & training." },
  { id: 'ds6', icon: 'Clock', title: "24/7 Support", description: "Round-the-clock operations." },
];

export const DEFAULT_PARTNERS: Partner[] = [
  { id: 'dp1', name: "Construction Co.", logoUrl: "https://via.placeholder.com/150x50/F3F4F6/000000?text=Construction+Co." },
  { id: 'dp2', name: "Secure Logistics", logoUrl: "https://via.placeholder.com/150x50/F3F4F6/000000?text=Secure+Logistics" },
  { id: 'dp3', name: "Tech Solutions", logoUrl: "https://via.placeholder.com/150x50/F3F4F6/000000?text=Tech+Solutions" },
  { id: 'dp4', name: "Global Trade", logoUrl: "https://via.placeholder.com/150x50/F3F4F6/000000?text=Global+Trade" },
  { id: 'dp5', name: "Safety First", logoUrl: "https://via.placeholder.com/150x50/F3F4F6/000000?text=Safety+First" },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 'dt1', client: "John Doe", role: "Project Manager", text: "Exceptional service and attention to detail. TECL delivered exactly what we needed.", company: "Acme Corp", imageUrl: "https://randomuser.me/api/portraits/men/32.jpg", createdAt: Date.now() } as Testimonial,
  { id: 'dt2', client: "Sarah N.", role: "Director", text: "We rely on TECL for all our substation maintenance. Their team is responsive.", company: "Nile Heavy Engineering", imageUrl: "https://randomuser.me/api/portraits/women/44.jpg", createdAt: Date.now() } as Testimonial,
  { id: 'dt3', client: "Michael O.", role: "Security Lead", text: "Excellent work on the solar installation at our factory.", company: "Bwiza Furniture", imageUrl: "https://randomuser.me/api/portraits/men/4.jpg", createdAt: Date.now() } as Testimonial,
];

export const DEFAULT_TEAM: TeamMember[] = [
  { id: 'dtm1', name: "Eng. Robert K.", role: "Managing Director", imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80", bio: "Over 15 years experience in engineering management.", createdAt: Date.now() } as TeamMember,
  { id: 'dtm2', name: "Sarah N.", role: "Head of Logistics", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80", bio: "Expert in supply chain optimization.", createdAt: Date.now() } as TeamMember,
  { id: 'dtm3', name: "Michael O.", role: "Security Lead", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80", bio: "Specializes in advanced security systems.", createdAt: Date.now() } as TeamMember,
  { id: 'dtm4', name: "Grace A.", role: "Project Manager", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80", bio: "Manages complex projects from conception to completion.", createdAt: Date.now() } as TeamMember,
];

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'dp1', title: "Kampala Industrial Park", client: "Namanve Dev.", category: "Civil Eng.", summary: "Internal road networks.", imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=2070&q=80", location: "Namanve", date: "2023" } as Project,
  { id: 'dp2', title: "Secure Fleet", client: "Regional Logistics", category: "Logistics", summary: "GPS Tracking fleet.", imageUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=2075&q=80", location: "East Africa", date: "Ongoing" } as Project,
  { id: 'dp3', title: "Mall Security", client: "City Mall Mgmt.", category: "Security", summary: "AI CCTV.", imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=2070&q=80", location: "Kampala", date: "2022" } as Project,
  { id: 'dp4', title: "Solar Grid", client: "Gulu Power", category: "Engineering", summary: "Commercial solar.", imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2072&q=80", location: "Gulu", date: "2022" } as Project,
];

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'dprod1', name: "Industrial Helmet", category: "Safety", price: 45000, imageUrl: "https://images.unsplash.com/photo-1534234828569-1235c40cf396?auto=format&fit=crop&w=2070&q=80", description: "High-impact helmet.", inStock: true, featured: true },
  { id: 'dprod2', name: "Work Boots", category: "Safety", price: 120000, imageUrl: "https://images.unsplash.com/photo-1542280756-74c2f5d32bfd?auto=format&fit=crop&w=2070&q=80", description: "Steel-toed.", inStock: true, featured: false },
  { id: 'dprod3', name: "Security Camera", category: "Electronics", price: 250000, imageUrl: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=2070&q=80", description: "HD outdoor camera.", inStock: true, featured: true },
  { id: 'dprod4', name: "Hydraulic Jack", category: "Tools", price: 180000, imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1932&q=80", description: "5-ton jack.", inStock: false, featured: false },
  { id: 'dprod5', name: "Power Drill", category: "Tools", price: 350000, imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=2078&q=80", description: "Cordless drill.", inStock: true, featured: true }
];