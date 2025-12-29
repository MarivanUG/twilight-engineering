import React, { useState, useEffect } from 'react';
import type { Testimonial } from '../../types';
import { getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial, uploadFile } from '../../lib/firestoreService';
import { Trash2, Edit, Save, XCircle } from 'lucide-react'; // Removed Quote, ArrowUpFromLine, PlusCircle

const AdminTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [newTestimonialData, setNewTestimonialData] = useState<Partial<Testimonial> & { imageFile?: File | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedTestimonials = await getTestimonials();
      setTestimonials(fetchedTestimonials as Testimonial[]);
    } catch (err) {
      setError('Failed to fetch testimonials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTestimonialData({ ...newTestimonialData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTestimonialData({ ...newTestimonialData, imageFile: e.target.files[0] });
    }
  };

  const handleSaveTestimonial = async () => {
    setLoading(true);
    setError('');
    try {
      let imageUrl = (newTestimonialData as any).imageUrl; // Use as any for imageUrl

      if (newTestimonialData.imageFile) {
        imageUrl = await uploadFile('testimonials', newTestimonialData.imageFile);
      }

      const testimonialToSave: Partial<Testimonial> = { ...(newTestimonialData as Partial<Testimonial>), imageUrl: imageUrl as string };

      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id as string, testimonialToSave as any);
      } else {
        await addTestimonial(testimonialToSave as any);
      }
      setNewTestimonialData({});
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (err) {
      setError('Failed to save testimonial.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setLoading(true);
      setError('');
      try {
        await deleteTestimonial(id);
        fetchTestimonials();
      } catch (err) {
        setError('Failed to delete testimonial.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setNewTestimonialData(testimonial);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Testimonials</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Form */}
      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="client"
            placeholder="Client Name"
            value={newTestimonialData.client || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={newTestimonialData.role || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <textarea
            name="text"
            placeholder="Testimonial Text"
            value={newTestimonialData.text || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md col-span-2"
          />
          <input
            type="text"
            name="company"
            placeholder="Company (Optional)"
            value={newTestimonialData.company || ''}
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
            {newTestimonialData.imageUrl && <img src={newTestimonialData.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md" />}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSaveTestimonial}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
          </button>
          {editingTestimonial && (
            <button
              onClick={() => { setEditingTestimonial(null); setNewTestimonialData({}); }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              disabled={loading}
            >
              <XCircle size={18} className="mr-2" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Testimonials List */}
      <h3 className="text-xl font-semibold mb-4">Existing Testimonials</h3>
      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
            <div className="flex items-center space-x-3">
              {testimonial.imageUrl && <img src={testimonial.imageUrl} alt={testimonial.client} className="w-16 h-16 object-cover rounded-full" />}
              <div>
                <p className="font-semibold text-slate-800">{testimonial.client}</p>
                <p className="text-sm text-slate-600">{testimonial.role}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{testimonial.text}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEditClick(testimonial)} className="p-2 text-blue-500 hover:text-blue-700">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDeleteTestimonial(testimonial.id as string)} className="p-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;