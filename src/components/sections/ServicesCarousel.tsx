import { useState, useEffect } from 'react';
import type { Service } from '../../types';
import { getServices } from '../../lib/firestoreService';
import { DEFAULT_SERVICES, ICON_MAP } from '../../lib/constants';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper to get Lucide icon component by name
const getIconComponent = (iconName: string) => {
  const IconComponent = ICON_MAP[iconName];
  return IconComponent || null;
};

export const ServicesCarousel: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices();
        if (fetchedServices && fetchedServices.length > 0) {
          // Ensure fetched services match the Service type
          setServices(fetchedServices as Service[]);
        } else {
          // Ensure DEFAULT_SERVICES match the Service type
          const defaultMappedServices: Service[] = DEFAULT_SERVICES.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            icon: s.icon // Assuming icon is already string name
          }));
          setServices(defaultMappedServices);
        }
      } catch (error) {
        console.error("Failed to fetch services, using default:", error);
        const defaultMappedServices: Service[] = DEFAULT_SERVICES.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon
        }));
        setServices(defaultMappedServices);
      }
    };

    fetchServices();
  }, []);

  if (services.length === 0) {
    return (
      <section className="py-20 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500">Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="font-heading text-orange-600 font-bold uppercase text-sm tracking-widest mb-2">Our Expertise</h2>
            <h3 className="font-heading text-3xl font-bold text-slate-900">Professional Services</h3>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="hidden md:flex items-center font-bold hover:text-orange-600 text-slate-900 transition-colors"
          >
            View All <ArrowRight className="ml-2" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(s => {
            const Icon = s.icon ? getIconComponent(s.icon) : null;
            return (
              <div key={s.id} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-50">
                  {Icon && <Icon className="w-7 h-7 text-slate-700 group-hover:text-orange-600" />}
                </div>
                <h4 className="font-heading text-xl font-bold uppercase mb-3 text-slate-900 group-hover:text-orange-600">{s.title}</h4>
                <p className="text-slate-500 mb-6">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
