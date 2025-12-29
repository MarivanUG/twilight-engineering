import { useState, useEffect } from 'react';
import type { Testimonial } from '../../types';
import { getTestimonials } from '../../lib/firestoreService';
import { DEFAULT_TESTIMONIALS } from '../../lib/constants';
import { Quote, Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const fetchedTestimonials = await getTestimonials();
        if (fetchedTestimonials && fetchedTestimonials.length > 0) {
          setTestimonials(fetchedTestimonials as Testimonial[]);
        } else {
          // Ensure DEFAULT_TESTIMONIALS matches the Testimonial type
          const defaultMappedTestimonials: Testimonial[] = DEFAULT_TESTIMONIALS.map(t => ({
            id: String(Math.random()), // Assign a random string ID
            client: t.client,
            role: t.role,
            company: t.company,
            text: t.text,
            imageUrl: t.imageUrl,
          }));
          setTestimonials(defaultMappedTestimonials);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials, using default:", error);
        const defaultMappedTestimonials: Testimonial[] = DEFAULT_TESTIMONIALS.map(t => ({
          id: String(Math.random()),
          client: t.client,
          role: t.role,
          company: t.company,
          text: t.text,
          imageUrl: t.imageUrl,
        }));
        setTestimonials(defaultMappedTestimonials);
      }
    };

    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) {
    return (
      <section className="py-20 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500">No testimonials to display.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-orange-600 font-bold uppercase text-sm mb-3">Testimonials</h2>
        <h3 className="text-3xl font-bold text-slate-900 mb-16">What Our Partners Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-2xl shadow-sm border relative text-left">
              <Quote className="absolute top-8 right-8 text-orange-100 rotate-180" />
              <div className="flex text-orange-500 mb-6">
                {[...Array(5)].map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 mb-8">"{testimonial.text}"</p>
              <div className="flex items-center">
                {testimonial.imageUrl ? (
                  <img src={testimonial.imageUrl} alt={testimonial.client} className="w-10 h-10 bg-slate-200 rounded-full mr-3 object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-slate-200 rounded-full mr-3 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {testimonial.client.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{testimonial.client}</h4>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};