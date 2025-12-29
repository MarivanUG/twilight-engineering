import React, { useState, useEffect } from 'react';
import type { Slide } from '../../types';
import { getSlides, addSlide, updateSlide, deleteSlide, uploadFile } from '../../lib/firestoreService';
import { Trash2, Edit, Save, XCircle } from 'lucide-react'; // Removed ArrowUpFromLine, PlusCircle

const AdminSlides: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [newSlideData, setNewSlideData] = useState<Partial<Slide> & { imageFile?: File | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedSlides = await getSlides();
      setSlides(fetchedSlides as Slide[]);
    } catch (err) {
      setError('Failed to fetch slides.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewSlideData({ ...newSlideData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewSlideData({ ...newSlideData, imageFile: e.target.files[0] });
    }
  };

  const handleSaveSlide = async () => {
    setLoading(true);
    setError('');
    try {
      let imageUrl = (newSlideData as any).imageUrl; // Use as any for imageUrl

      if (newSlideData.imageFile) {
        imageUrl = await uploadFile('slides', newSlideData.imageFile);
      }

      const slideToSave: Partial<Slide> = { ...(newSlideData as Partial<Slide>), imageUrl: imageUrl as string };

      if (editingSlide) {
        await updateSlide(editingSlide.id, slideToSave as any);
      } else {
        await addSlide(slideToSave as any);
      }
      setNewSlideData({});
      setEditingSlide(null);
      fetchSlides();
    } catch (err) {
      setError('Failed to save slide.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      setLoading(true);
      setError('');
      try {
        await deleteSlide(id);
        fetchSlides();
      } catch (err) {
        setError('Failed to delete slide.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (slide: Slide) => {
    setEditingSlide(slide);
    setNewSlideData(slide);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Slides</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Form */}
      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newSlideData.title || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="subtitle"
            placeholder="Subtitle"
            value={newSlideData.subtitle || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            name="order"
            placeholder="Order"
            value={newSlideData.order || 0}
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
            {newSlideData.imageUrl && <img src={newSlideData.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md" />}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSaveSlide}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> {editingSlide ? 'Update Slide' : 'Add Slide'}
          </button>
          {editingSlide && (
            <button
              onClick={() => { setEditingSlide(null); setNewSlideData({}); }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              disabled={loading}
            >
              <XCircle size={18} className="mr-2" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Slides List */}
      <h3 className="text-xl font-semibold mb-4">Existing Slides</h3>
      <div className="space-y-4">
        {slides.map((slide) => (
          <div key={slide.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
            <div className="flex items-center space-x-3">
              <img src={slide.imageUrl} alt={slide.title} className="w-16 h-16 object-cover rounded-md" />
              <div>
                <p className="font-semibold text-slate-800">{slide.title}</p>
                <p className="text-sm text-slate-600">{slide.subtitle}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEditClick(slide)} className="p-2 text-blue-500 hover:text-blue-700">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDeleteSlide(slide.id)} className="p-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSlides;