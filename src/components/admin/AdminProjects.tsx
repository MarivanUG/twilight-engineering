import React, { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { getProjects, addProject, updateProject, deleteProject, uploadFile } from '../../lib/firestoreService';
import { Trash2, Edit, Save, XCircle } from 'lucide-react'; // Removed ArrowUpFromLine, PlusCircle

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectData, setNewProjectData] = useState<Partial<Project> & { imageFile?: File | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects as Project[]);
    } catch (err) {
      setError('Failed to fetch projects.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProjectData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement; // Explicitly cast target
    if (target.files && target.files.length > 0) {
      // @ts-ignore
      setNewProjectData(prev => ({ ...prev, imageFile: target.files[0] }));
    }
  };

  const handleSaveProject = async () => {
    setLoading(true);
    setError('');
    try {
      let imageUrl = (newProjectData as any).imageUrl; // Use as any for imageUrl

      if (newProjectData.imageFile) {
        imageUrl = await uploadFile('projects', newProjectData.imageFile);
      }

      const projectToSave = { ...(newProjectData as Partial<Project>), imageUrl: imageUrl as string };

      if (editingProject) {
        await updateProject(editingProject.id as string, projectToSave as any);
      } else {
        await addProject(projectToSave as any);
      }
      setNewProjectData({});
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      setError('Failed to save project.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setLoading(true);
      setError('');
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (err) {
        setError('Failed to delete project.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setNewProjectData(project);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Projects</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Form */}
      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newProjectData.title || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="summary"
            placeholder="Summary"
            value={newProjectData.summary || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="client"
            placeholder="Client"
            value={newProjectData.client || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newProjectData.category || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={(newProjectData as any).location || ''} // Use as any for location
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="date"
            placeholder="Date (e.g., 2023)"
            value={newProjectData.date || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <div className="flex items-center space-x-2">
            <input
              type="file"
              name="imageFile"
              onChange={handleFileChange}
              className="p-2 border rounded-md w-full"
            />
            {(newProjectData as any).imageUrl && <img src={(newProjectData as any).imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md" />}
          </div>
          {/* Add fields for stats and gallery if needed */}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSaveProject}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> {editingProject ? 'Update Project' : 'Add Project'}
          </button>
          {editingProject && (
            <button
              onClick={() => { setEditingProject(null); setNewProjectData({}); }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              disabled={loading}
            >
              <XCircle size={18} className="mr-2" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      <h3 className="text-xl font-semibold mb-4">Existing Projects</h3>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
            <div className="flex items-center space-x-3">
              <img src={project.imageUrl} alt={project.title} className="w-16 h-16 object-cover rounded-md" />
              <div>
                <p className="font-semibold text-slate-800">{project.title}</p>
                <p className="text-sm text-slate-600">{project.summary}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEditClick(project)} className="p-2 text-blue-500 hover:text-blue-700">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDeleteProject(project.id as string)} className="p-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;