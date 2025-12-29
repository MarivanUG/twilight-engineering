import { useState, useEffect } from 'react';
import type { Partner } from '../../types';
import { getPartners } from '../../lib/firestoreService';
import { DEFAULT_PARTNERS } from '../../lib/constants';

export const PartnersStrip: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const fetchedPartners = await getPartners();
        if (fetchedPartners && fetchedPartners.length > 0) {
          setPartners(fetchedPartners as Partner[]);
        } else {
          // Ensure DEFAULT_PARTNERS matches the Partner type
          const defaultMappedPartners: Partner[] = DEFAULT_PARTNERS.map(p => ({
            id: String(Math.random()), // Assign a random string ID
            name: p.name,
            logoUrl: p.logoUrl
          }));
          setPartners(defaultMappedPartners);
        }
      } catch (error) {
        console.error("Failed to fetch partners, using default:", error);
        const defaultMappedPartners: Partner[] = DEFAULT_PARTNERS.map(p => ({
          id: String(Math.random()),
          name: p.name,
          logoUrl: p.logoUrl
        }));
        setPartners(defaultMappedPartners);
      }
    };

    fetchPartners();
  }, []);

  if (partners.length === 0) {
    return (
      <section className="py-12 bg-slate-900 border-y border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500">No partners to display.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-slate-900 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-slate-500 text-sm font-semibold uppercase tracking-widest mb-8">Trusted by Industry Leaders</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-70">
          {partners.map((partner) => (
            <div key={partner.id} className="flex justify-center grayscale hover:grayscale-0 transition-all hover:opacity-100">
              <div className="h-12 flex items-center justify-center bg-white/5 rounded px-4 w-full border border-white/10">
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};