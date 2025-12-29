import React, { useState, useEffect } from 'react';
import type { Service } from '../../types';
import { getServices, addService, updateService, deleteService } from '../../lib/firestoreService';
import { Edit, Save, XCircle, Trash2 } from 'lucide-react'; // Removed PlusCircle, added Trash2
import { ICON_MAP } from '../../lib/constants'; // Assuming ICON_MAP is available

// Helper to get Lucide icon component by name
const getIconComponent = (iconName: string) => {
  const IconComponent = ICON_MAP[iconName];
  return IconComponent || null;
};

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newServiceData, setNewServiceData] = useState<Partial<Service>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedServices = await getServices();
      setServices(fetchedServices as Service[]);
    } catch (err) {
      setError('Failed to fetch services.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewServiceData({ ...newServiceData, [e.target.name]: e.target.value });
  };

  const handleSaveService = async () => {
    setLoading(true);
    setError('');
    try {
      if (editingService) {
        await updateService(editingService.id as string, newServiceData);
      } else {
        await addService({
          title: newServiceData.title || '',
          description: newServiceData.description || '',
          icon: newServiceData.icon || '',
        });
      }
      setNewServiceData({});
      setEditingService(null);
      fetchServices();
    } catch (err) {
      setError('Failed to save service.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setLoading(true);
      setError('');
      try {
        await deleteService(id as string);
        fetchServices();
      } catch (err) {
        setError('Failed to delete service.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setNewServiceData(service);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Services</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Form */}
      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newServiceData.title || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newServiceData.description || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <select
            name="icon"
            value={newServiceData.icon || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          >
            <option value="">Select Icon</option>
            {Object.keys(ICON_MAP).map(iconName => (
              <option key={iconName} value={iconName}>{iconName}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSaveService}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> {editingService ? 'Update Service' : 'Add Service'}
          </button>
          {editingService && (
            <button
              onClick={() => { setEditingService(null); setNewServiceData({}); }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              disabled={loading}
            >
              <XCircle size={18} className="mr-2" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Services List */}
      <h3 className="text-xl font-semibold mb-4">Existing Services</h3>
      <div className="space-y-4">
        {services.map((service) => {
          const Icon = service.icon ? getIconComponent(service.icon) : null;
          return (
            <div key={service.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
              <div className="flex items-center space-x-3">
                {Icon && <Icon size={24} className="text-orange-500" />}
                <div>
                  <p className="font-semibold text-slate-800">{service.title}</p>
                  <p className="text-sm text-slate-600">{service.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEditClick(service)} className="p-2 text-blue-500 hover:text-blue-700">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDeleteService(service.id)} className="p-2 text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminServices;