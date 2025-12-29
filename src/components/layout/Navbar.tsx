import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Phone, Mail, Clock, ChevronDown, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import type { AppSettings } from '../../types';
import { cn } from '../../lib/utils';

interface NavbarProps {
  settings: AppSettings;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services', hasDropdown: true },
    { name: 'Projects', path: '/projects' },
    { name: 'Store', path: '/store' },
    { name: 'About', path: '/about', hasDropdown: true },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed w-full z-50 shadow-sm bg-white font-heading">
      {/* Top Bar */}
      <div className="bg-slate-100 text-slate-600 py-2 border-b border-slate-200 text-xs md:text-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Social Icons */}
          <div className="flex items-center space-x-4">
             <a href="#" className="hover:text-orange-600 transition-colors"><Facebook size={16} /></a>
             <a href="#" className="hover:text-orange-600 transition-colors"><Twitter size={16} /></a>
             <a href="#" className="hover:text-orange-600 transition-colors"><Instagram size={16} /></a>
             <a href="#" className="hover:text-orange-600 transition-colors"><Linkedin size={16} /></a>
          </div>
          {/* Contact Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Phone size={14} className="mr-2 text-orange-600" />
              <span>011 987 65 43</span>
            </div>
             <div className="flex items-center">
              <Mail size={14} className="mr-2 text-orange-600" />
              <span>hello@twilight-engineering.com</span>
            </div>
             <div className="flex items-center">
              <Clock size={14} className="mr-2 text-orange-600" />
              <span>Mon - Fri 10 AM - 8 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="cursor-pointer flex items-center"
              onClick={() => handleNavClick('/')}
            >
              <img src="/logo.svg" alt="TECL Engineering" className="h-12 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                    <Link
                    to={link.path}
                    className={cn(
                        "flex items-center text-sm font-bold uppercase tracking-wide transition-colors pb-1 border-b-2 border-transparent",
                        "text-slate-900 hover:text-orange-600",
                        location.pathname === link.path ? 'border-orange-600 text-orange-600' : ''
                    )}
                    >
                    {link.name}
                    {link.hasDropdown && <ChevronDown size={14} className="ml-1" />}
                    </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
                {/* Search Icon */}
                 <button className="text-slate-900 hover:text-orange-600 transition-colors">
                    <Search size={24} />
                 </button>

              <button
                className="md:hidden text-slate-900 hover:text-orange-600"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-2xl md:hidden animate-in slide-in-from-top-5">
          <div className="flex flex-col p-4 space-y-4 text-slate-900">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={cn(
                  "flex items-center text-left text-lg font-bold uppercase py-2 px-4 rounded-lg",
                  location.pathname === link.path
                    ? 'bg-orange-50 text-orange-600'
                    : 'hover:bg-slate-100'
                )}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown size={16} className="ml-2" />}
              </Link>
            ))}
             <div className="pt-4 border-t border-slate-200 space-y-3 text-sm text-slate-600">
                <div className="flex items-center px-4"><Phone size={14} className="mr-2 text-orange-600"/> 011 987 65 43</div>
                <div className="flex items-center px-4"><Mail size={14} className="mr-2 text-orange-600"/> hello@twilight-engineering.com</div>
                 <div className="flex items-center px-4"><Clock size={14} className="mr-2 text-orange-600"/> Mon - Fri 10 AM - 8 PM</div>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};