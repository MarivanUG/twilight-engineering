import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import type { AppSettings } from '../../types';
import { useAdmin } from '../../contexts/AdminContext'; // Import useAdmin

interface FooterProps {
  settings: AppSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();
  const { showLoginModal } = useAdmin(); // Use showLoginModal
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleCopyrightClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) { // 500ms window for clicks
      setClickCount(prev => prev + 1);
    } else {
      setClickCount(1); // Reset if clicks are too slow
    }
    setLastClickTime(now);

    if (clickCount >= 4) { // 5th click (0-indexed count)
      showLoginModal(); // Trigger login modal
      setClickCount(0); // Reset count after triggering
    }
  };


  const primaryNav = [
    { name: 'About Us', path: '/about' },
    { name: 'Our Services', path: '/services' },
    { name: 'Projects Portfolio', path: '/projects' },
    { name: 'Store', path: '/store' },
    { name: 'Contact Us', path: '/contact' },
  ];

  // These are hardcoded as per provided App.jsx, not dynamically from settings.
  const servicesNav = [
    'Logistics & Supply',
    'Security Systems',
    'Civil Engineering',
    'Maintenance',
    'Consultancy',
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 font-light">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              <img src="/footer.svg" alt="TECL Engineering" className="h-12 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              {settings.tagline || "Delivering excellence in engineering, logistics, and security solutions across East Africa. Committed to quality, safety, and innovation."}
            </p>
            <div className="flex space-x-4">
              {settings.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors"><Facebook size={20} /></a>}
              {settings.socialLinks?.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors"><Twitter size={20} /></a>}
              {settings.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors"><Instagram size={20} /></a>}
              {settings.socialLinks?.linkedin && <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors"><Linkedin size={20} /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-white font-bold text-lg uppercase tracking-wide mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {primaryNav.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-orange-500 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading text-white font-bold text-lg uppercase tracking-wide mb-6">Services</h3>
            <ul className="space-y-3 text-sm">
              {servicesNav.map((service, index) => (
                <li key={index} className="hover:text-orange-500 cursor-pointer transition-colors">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-heading text-white font-bold text-lg uppercase tracking-wide mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-orange-500 mr-3 shrink-0" />
                <span>{settings.address || "P.O Box 145784, Kawempe GPO, Kampala, Uganda"}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-orange-500 mr-3 shrink-0" />
                <span>{settings.phoneNumber || "+256 773 505 795"}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-orange-500 mr-3 shrink-0" />
                <span>{settings.supportEmail || "contact@example.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-16 pt-8 text-center text-sm text-slate-500">
          <p onClick={handleCopyrightClick} className="cursor-pointer">
            &copy; {currentYear} {settings.siteName || 'TECL Engineering'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};