import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ShoppingCart, 
  MessageCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Slide } from '../../types';
import { getSlides } from '../../lib/firestoreService';
import { DEFAULT_SLIDES } from '../../lib/constants';
import { cn } from '../../lib/utils';

export const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const fetchedSlides = await getSlides();
        if (fetchedSlides && fetchedSlides.length > 0) {
          const mappedSlides: Slide[] = (fetchedSlides as any[]).map((slide: any) => ({
            id: slide.id || String(Math.random()),
            imageUrl: slide.imageUrl || '',
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            cta: slide.cta || 'Learn More',
            order: slide.order || 0
          }));
          setSlides(mappedSlides.sort((a, b) => (a.order || 0) - (b.order || 0)));
        } else {
          setSlides(DEFAULT_SLIDES);
        }
      } catch (error) {
        console.error("Failed to fetch slides, using default:", error);
        setSlides(DEFAULT_SLIDES);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => setCurrentIndex((p) => (p + 1) % slides.length), 6000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleCtaClick = (link: string) => {
    if (link) {
        navigate(link);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (slides.length === 0) {
    return (
      <div className="relative h-[700px] w-full overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
            <Zap className="w-10 h-10 text-orange-500 mb-4" />
            <p className="text-gray-400 font-mono text-sm">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  // Helper to split title for styling if needed. 
  // If the title is specifically "TWILIGHT ENGINEERING", we split it.
  // Otherwise we try to split by space or just render as is.
  const titleParts = currentSlide.title.split(' ');
  const titleLine1 = titleParts.length > 1 ? titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(' ') : currentSlide.title;
  const titleLine2 = titleParts.length > 1 ? titleParts.slice(Math.ceil(titleParts.length / 2)).join(' ') : '';
  
  // Custom logic to force the branding specific look if the text matches the brand name
  const isBrandSlide = currentSlide.title.toUpperCase().includes('TWILIGHT');
  const displayLine1 = isBrandSlide ? "TWILIGHT" : titleLine1;
  const displayLine2 = isBrandSlide ? "ENGINEERING" : titleLine2;

  return (
    <div className="relative h-[700px] w-full overflow-hidden bg-gray-900 font-sans">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div key={slide.id} className={cn(
          "absolute inset-0 transition-opacity duration-1000 ease-in-out",
          index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
        )}>
           {/* Dark Overlay & Image */}
           <div className="absolute inset-0 bg-gray-900/80 z-10" />
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50 z-10" />
           <img
            src={slide.imageUrl}
            alt={slide.title}
            className={cn(
              "w-full h-full object-cover transform transition-transform duration-[10000ms] grayscale opacity-60",
              index === currentIndex ? 'scale-110' : 'scale-100'
            )}
          />
        </div>
      ))}

      {/* Content Container - Centered */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 max-w-7xl mx-auto text-center">
        
        {/* Top Badge */}
        <div className="animate-fade-in-down mb-8 opacity-0" style={{ animation: 'fadeInDown 0.8s ease-out forwards 0.2s' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-orange-500" fill="currentColor" />
                <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Creating New Ways</span>
            </div>
        </div>

        {/* Main Heading */}
        <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-6xl md:text-8xl font-heading font-extrabold uppercase tracking-tight leading-[0.9] text-white animate-fade-in-up opacity-0" style={{ animation: 'fadeInUp 0.8s ease-out forwards 0.4s' }}>
                {displayLine1}
            </h1>
            <h1 className="text-6xl md:text-8xl font-heading font-extrabold uppercase tracking-tight leading-[0.9] text-orange-500 animate-fade-in-up opacity-0" style={{ animation: 'fadeInUp 0.8s ease-out forwards 0.6s' }}>
                {displayLine2}
            </h1>
        </div>

        {/* Subtext */}
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-in-up opacity-0" style={{ animation: 'fadeInUp 0.8s ease-out forwards 0.8s' }}>
            {currentSlide.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up opacity-0" style={{ animation: 'fadeInUp 0.8s ease-out forwards 1s' }}>
            <button 
                onClick={() => handleCtaClick(currentSlide.cta)}
                className="group relative px-8 py-4 bg-orange-500 rounded-lg text-white font-bold text-lg flex items-center gap-2 overflow-hidden transition-all hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
                {currentSlide.cta}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button 
                onClick={() => navigate('/store')}
                className="group px-8 py-4 bg-transparent border border-gray-700 rounded-lg text-white font-medium text-lg flex items-center gap-2 transition-all hover:border-gray-500 hover:bg-white/5"
            >
                <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <span>Shop Now</span>
            </button>
        </div>
      </div>

      {/* Navigation - Left/Right Arrows */}
      <button 
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    index === currentIndex ? "bg-orange-500 w-8" : "bg-gray-600 hover:bg-gray-500"
                )}
            />
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-8 right-8 z-40 hidden md:block">
        <button className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all duration-300 hover:scale-105 group">
            <MessageCircle className="w-6 h-6 fill-current" />
            {/* Tooltip or label could go here */}
        </button>
      </div>

      {/* CSS for animations if not in global css */}
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};