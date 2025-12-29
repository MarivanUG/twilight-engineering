import { useState, useEffect } from 'react';
import type { Service } from '../../types';
import { getServices } from '../../lib/firestoreService';
import { DEFAULT_SERVICES, ICON_MAP } from '../../lib/constants';

// Helper to get Lucide icon component by name
const getIconComponent = (iconName: string) => {
  const IconComponent = ICON_MAP[iconName]; // ICON_MAP should now contain all necessary icons
  return IconComponent || null;
};

export const ServicesContent: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices();
        if (fetchedServices && fetchedServices.length > 0) {
          setServices(fetchedServices as Service[]);
        } else {
          // Map DEFAULT_SERVICES to ensure consistency in type and icon names
          const defaultMappedServices: Service[] = DEFAULT_SERVICES.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            icon: s.icon, // icon is already a string in DEFAULT_SERVICES
          }));
          setServices(defaultMappedServices);
        }
      } catch (error) {
        console.error("Failed to fetch services, using default:", error);
        const defaultMappedServices: Service[] = DEFAULT_SERVICES.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon,
        }));
        setServices(defaultMappedServices);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="bg-slate-900 text-white py-20 px-4 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Comprehensive Solutions</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">We provide professional services designed to scale with your needs.</p>
        </div>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s) => {
              const Icon = s.icon ? getIconComponent(s.icon) : null;
              return (
                <div key={s.id} className="bg-slate-800 p-8 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700">
                  {Icon && <Icon className="w-10 h-10 text-orange-500 mb-4" />}
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-gray-400">{s.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading services...</p>
        )}
      </div>
    </div>
  );
};