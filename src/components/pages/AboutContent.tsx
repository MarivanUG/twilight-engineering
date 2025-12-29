import type { AppSettings } from '../../types';
import { Target, Eye } from 'lucide-react';
import { TeamSection } from '../sections/TeamSection'; // Import the new TeamSection
import { PartnersStrip } from '../sections/PartnersStrip'; // PartnersStrip is already refactored

interface AboutContentProps {
  settings: AppSettings;
}

export const AboutContent: React.FC<AboutContentProps> = ({ settings }) => {
  return (
    <div className="animate-fade-in">
      <div className="relative py-20 bg-slate-900 text-white text-center">
        <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=2070&q=80" className="w-full h-full object-cover" /></div>
        <div className="relative max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-6">Building Tomorrow, Today</h1>
          <p className="text-xl text-slate-300">TECL Engineering is a premier provider of integrated solutions across East Africa.</p>
        </div>
      </div>
      <div className="py-20 bg-white max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div className="bg-slate-50 p-10 rounded-3xl border">
          <Target className="w-8 h-8 text-orange-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-600">{settings.mission || "To provide world-class engineering and logistical support."}</p>
        </div>
        <div className="bg-slate-50 p-10 rounded-3xl border">
          <Eye className="w-8 h-8 text-blue-600 mb-4" /> {/* App.jsx uses text-blue-600 here */}
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
          <p className="text-slate-600">{settings.vision || "To be the leading partner for infrastructure solutions in Africa."}</p>
        </div>
      </div>
      <TeamSection />
      <PartnersStrip />
    </div>
  );
};