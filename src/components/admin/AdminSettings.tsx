import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../../types';
import { getSettings, updateSettings, uploadFile } from '../../lib/firestoreService';
import { Save } from 'lucide-react';

interface AdminSettingsProps {}

const AdminSettings: React.FC<AdminSettingsProps> = () => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>({});
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedSettings = await getSettings();
      setCurrentSettings(fetchedSettings);
    } catch (err) {
      setError('Failed to fetch settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setCurrentSettings(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }));
    } else {
      setCurrentSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewLogoFile(e.target.files[0]);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      let logoUrl = currentSettings.logoUrl || '';

      if (newLogoFile) {
        logoUrl = await uploadFile('settings/logo', newLogoFile); // Assuming a single logo file
      }

      await updateSettings({ ...currentSettings, logoUrl });
      setSuccess(true);
      setNewLogoFile(null); // Clear file input
      fetchSettings(); // Refresh settings after save
    } catch (err) {
      setError('Failed to save settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Site Settings</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">Settings saved successfully!</p>}

      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="siteName"
            placeholder="Site Name"
            value={currentSettings.siteName || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="tagline"
            placeholder="Tagline"
            value={currentSettings.tagline || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="email"
            name="supportEmail"
            placeholder="Support Email"
            value={currentSettings.supportEmail || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={currentSettings.phoneNumber || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <textarea
            name="address"
            placeholder="Address"
            value={currentSettings.address || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md col-span-2"
          />
          {/* Social Links */}
          <h4 className="font-semibold col-span-2 mt-4">Social Links</h4>
          <input
            type="url"
            name="socialLinks.facebook"
            placeholder="Facebook URL"
            value={currentSettings.socialLinks?.facebook || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="url"
            name="socialLinks.twitter"
            placeholder="Twitter URL"
            value={currentSettings.socialLinks?.twitter || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="url"
            name="socialLinks.instagram"
            placeholder="Instagram URL"
            value={currentSettings.socialLinks?.instagram || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="url"
            name="socialLinks.linkedin"
            placeholder="LinkedIn URL"
            value={currentSettings.socialLinks?.linkedin || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />

          {/* Site Logo */}
          <h4 className="font-semibold col-span-2 mt-4">Site Logo</h4>
          <div className="flex items-center space-x-2 col-span-2">
            <input
              type="file"
              name="logoFile"
              onChange={handleLogoFileChange}
              className="p-2 border rounded-md w-full"
            />
            {currentSettings.logoUrl && <img src={currentSettings.logoUrl} alt="Current Logo" className="h-10 w-auto object-contain rounded-md" />}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;