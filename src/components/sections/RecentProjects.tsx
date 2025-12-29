import { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { getProjects } from '../../lib/firestoreService';
import { DEFAULT_PROJECTS } from '../../lib/constants';
import { ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        if (fetchedProjects && fetchedProjects.length > 0) {
          // Take the first 3 or 4 projects for recent display
          setProjects((fetchedProjects as Project[]).slice(0, 3)); // Only display 3 projects as per App.jsx
        } else {
          setProjects(DEFAULT_PROJECTS.slice(0, 3) as Project[]);
        }
      } catch (error) {
        console.error("Failed to fetch projects, using default:", error);
        setProjects(DEFAULT_PROJECTS.slice(0, 3) as Project[]);
      }
    };

    fetchProjects();
  }, []);

  if (projects.length === 0) {
    return (
      <section className="py-20 bg-white text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500">No recent projects to display.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-orange-600 font-bold uppercase text-sm mb-2">Featured Work</h2>
            <h3 className="text-3xl font-bold text-slate-900">Recent Projects</h3>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center font-bold hover:text-orange-600 text-slate-900 transition-colors"
          >
            View Portfolio <ArrowRight className="ml-2" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p: Project) => ( // Explicitly cast p to Project
            <div key={p.id} onClick={() => navigate(`/projects`)} className="group rounded-2xl overflow-hidden bg-slate-50 border hover:shadow-xl transition-all cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute top-4 left-4"><span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{p.category}</span></div>
                            </div>
                            <div className="p-6">
                              <h4 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-orange-600">{p.title}</h4>
                              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.summary}</p> {/* Use p.summary */}
                              {(p as any)?.location ? (
                                <div className="flex justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                                  <span className="flex items-center"><MapPin size={14} className="mr-1 text-orange-500" />{(p as any).location}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>      </div>
    </section>
  );
};
