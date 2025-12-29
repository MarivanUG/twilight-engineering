import React, { useState, useEffect } from 'react';
import type { Partner } from '../../types';
import { getPartners, addPartner, updatePartner, deletePartner, uploadFile } from '../../lib/firestoreService';
import { Trash2, Edit, Save, XCircle } from 'lucide-react';

const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [newPartnerData, setNewPartnerData] = useState<Partial<Partner> & { logoFile?: File | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedPartners = await getPartners();
      setPartners(fetchedPartners as Partner[]);
    } catch (err) {
      setError('Failed to fetch partners.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewPartnerData({ ...newPartnerData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPartnerData({ ...newPartnerData, logoFile: e.target.files[0] });
    }
  };

  const handleSavePartner = async () => {
    setLoading(true);
          setError('');
        try {
          let logoUrl = (newPartnerData as any).logoUrl; // Use as any for logoUrl
      if (newPartnerData.logoFile) {
        logoUrl = await uploadFile('partners', newPartnerData.logoFile);
      }

      const partnerToSave: Partial<Partner> = { ...(newPartnerData as Partial<Partner>), logoUrl: logoUrl as string };

      if (editingPartner) {
        await updatePartner(editingPartner.id as string, partnerToSave as any);
      } else {
        await addPartner(partnerToSave as any);
      }
      setNewPartnerData({});
      setEditingPartner(null);
      fetchPartners();
    } catch (err) {
      setError('Failed to save partner.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      setLoading(true);
      setError('');
      try {
        await deletePartner(id);
        fetchPartners();
      } catch (err) {
        setError('Failed to delete partner.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (partner: Partner) => {
    setEditingPartner(partner);
    setNewPartnerData(partner);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Partners</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Form */}
      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Partner Name"
            value={newPartnerData.name || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            name="order"
            placeholder="Order (Optional)"
            value={(newPartnerData as any).order || 0} // Use as any for order
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <div className="flex items-center space-x-2 col-span-2">
            <input
              type="file"
              name="logoFile"
              onChange={handleFileChange}
              className="p-2 border rounded-md w-full"
            />
            {(newPartnerData as any).logoUrl && <img src={(newPartnerData as any).logoUrl} alt="Preview" className="h-10 w-10 object-contain rounded-md" />}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSavePartner}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> {editingPartner ? 'Update Partner' : 'Add Partner'}
          </button>
          {editingPartner && (
            <button
              onClick={() => { setEditingPartner(null); setNewPartnerData({}); }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              disabled={loading}
            >
              <XCircle size={18} className="mr-2" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Partners List */}
      <h3 className="text-xl font-semibold mb-4">Existing Partners</h3>
      <div className="space-y-4">
        {partners.map((partner) => (
          <div key={partner.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
            <div className="flex items-center space-x-3">
              <img src={partner.logoUrl} alt={partner.name} className="w-16 h-16 object-contain rounded-md" />
              <div>
                <p className="font-semibold text-slate-800">{partner.name}</p>
                <p className="text-sm text-slate-600">Order: {(partner as any).order}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEditClick(partner)} className="p-2 text-blue-500 hover:text-blue-700">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDeletePartner(partner.id as string)} className="p-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPartners;