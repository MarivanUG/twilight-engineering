// Common interface for application settings
export interface AppSettings {
  contactFormUrl?: string;
  siteName?: string;
  supportEmail?: string;
  enableStore?: boolean;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  tagline?: string; // Added from App.jsx
  mission?: string; // Added from App.jsx
  vision?: string; // Added from App.jsx
  phoneNumber?: string; // Added from App.jsx
  address?: string; // Added from App.jsx
  [key: string]: any; // Allowing for other dynamic settings
}

// Interface for Projects
export interface Project {
  id: string;
  title: string;
  category: string;
  imageUrl: string; // Renamed from 'image'
  summary: string; // Renamed from 'description'
  client?: string;
  date?: string; // Kept as it might be used in display
  stats?: string[];
  gallery?: string[];
  createdAt?: number;
}

// Interface for Store Products
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string; // Renamed from 'image'
  description: string;
  inStock?: boolean;
  featured?: boolean; // Added based on DEFAULT_PRODUCTS
  createdAt?: number;
}

// Interface for Cart Items
export interface CartItem extends Product {
  quantity: number;
}

// Interface for Hero Slides
export interface Slide {
  id: string; // Changed to string based on Firestore and DEFAULT_SLIDES
  title: string; // Renamed from 'heading'
  subtitle: string; // Renamed from 'subheading'
  imageUrl: string; // Renamed from 'image'
  cta: string; // Renamed from 'buttonText'
  order?: number; // Added based on firestoreService
}

// Interface for Services
export interface Service {
  id: string | number;
  title: string;
  description: string;
  icon?: string; // Changed to icon, assuming it's a string name for lucide-react
}

// Interface for Partners
export interface Partner {
  id: string | number;
  name: string;
  logoUrl: string; // Renamed from 'logo'
}

// Interface for Testimonials
export interface Testimonial {
  id: string | number;
  client: string; // Added based on DEFAULT_TESTIMONIALS
  role: string;
  company?: string;
  text: string; // Renamed from 'content'
  imageUrl?: string; // Renamed from 'image' if it's a URL
}

// Interface for Team Members
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string; // Renamed from 'image'
  bio?: string;
  createdAt?: number; // Added based on firestoreService
}

// Interface for Messages (new)
export interface Message {
  id: string;
  from: string;
  text: string;
  createdAt: number;
}

// Interface for Notifications (new)
export interface Notification {
  id: string;
  type: string;
  refId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}