import { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { getProjects } from '../../lib/firestoreService';
import { DEFAULT_PROJECTS } from '../../lib/constants';
import { MapPin, X } from 'lucide-react'; // X is used in modal, MapPin is used

export const ProjectsContent: React.FC = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  // @ts-expect-error
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetched = await getProjects();
        const projectsData = (fetched && fetched.length > 0) ? (fetched as Project[]) : (DEFAULT_PROJECTS as Project[]);
        setAllProjects(projectsData);
        setFilteredProjects(projectsData);

        const uniqueCategories = Array.from(new Set(projectsData.map(p => p.category)));
        setCategories(['All', ...uniqueCategories]);

      } catch (error) {
        console.error("Failed to fetch projects, using default:", error);
        setAllProjects(DEFAULT_PROJECTS as Project[]);
        setFilteredProjects(DEFAULT_PROJECTS as Project[]);
        const uniqueCategories = Array.from(new Set(DEFAULT_PROJECTS.map(p => p.category)));
        setCategories(['All', ...uniqueCategories]);
      }
    };
    fetchProjects();
  }, []);

  const [categories, setCategories] = useState<string[]>(['All']); // Initialize with 'All'


  useEffect(() => {
    let results = allProjects;

    // Filter by category
    if (selectedCategory !== 'All') {
      results = results.filter(project => project.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      results = results.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.summary && project.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProjects(results);
  }, [searchTerm, selectedCategory, allProjects]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-fade-in">
      <div className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold">Our Portfolio</h1>
      </div>
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-4 flex gap-2 justify-center flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((p: Project) => ( // Explicitly cast p to Project
          <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group">
            <div className="relative h-56 overflow-hidden">
              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4"><span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{p.category}</span></div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2 text-slate-900">{p.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2">{p.summary}</p>
              {/* @ts-ignore */}
              {p.location ? (
                <div className="flex justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                  <span className="flex items-center"><MapPin size={14} className="mr-1 text-orange-500" />{(p as any)['location']}</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full"><X size={20} /></button>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{selectedProject.title}</h2>
            <img src={selectedProject.imageUrl} className="w-full h-64 object-cover rounded-xl mb-4" />
            <p className="text-slate-600">{selectedProject.summary}</p>
            {(selectedProject as any)?.location && <p className="text-slate-600">Location: {(selectedProject as any).location}</p>}
          </div>
        </div>
      )}
    </div>
  );
};