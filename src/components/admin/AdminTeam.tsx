import React, { useState, useEffect } from 'react';
import type { TeamMember } from '../../types';
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember, uploadFile } from '../../lib/firestoreService';
import { Trash2, Edit, Save, XCircle } from 'lucide-react'; // Removed User, ArrowUpFromLine, PlusCircle

const AdminTeam: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMemberData, setNewMemberData] = useState<Partial<TeamMember> & { imageFile?: File | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedMembers = await getTeamMembers();
      setTeamMembers(fetchedMembers as TeamMember[]);
    } catch (err) {
      setError('Failed to fetch team members.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewMemberData({ ...newMemberData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewMemberData({ ...newMemberData, imageFile: e.target.files[0] });
    }
  };

  const handleSaveMember = async () => {
    setLoading(true);
    setError('');
    try {
      let imageUrl: string | undefined = (newMemberData as any).imageUrl; // Declare imageUrl here and initialize

      if (newMemberData.imageFile) {
        imageUrl = await uploadFile('team', newMemberData.imageFile);
      }

      const memberToSave: Partial<TeamMember> = { ...(newMemberData as Partial<TeamMember>), imageUrl: imageUrl as string };

      if (editingMember) {
        await updateTeamMember(editingMember.id as string, memberToSave as any);
      } else {
        await addTeamMember(memberToSave as any);
      }
      setNewMemberData({});
      setEditingMember(null);
      fetchTeamMembers();
    } catch (err) {
      setError('Failed to save team member.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setLoading(true);
      setError('');
      try {
        await deleteTeamMember(id);
        fetchTeamMembers();
      } catch (err) {
        setError('Failed to delete team member.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setNewMemberData(member);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Team Members</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add/Edit Form */}
      <div className="mb-8 border p-4 rounded-lg bg-slate-50">
        <h3 className="text-xl font-semibold mb-4">{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newMemberData.name || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={newMemberData.role || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md"
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={newMemberData.bio || ''}
            onChange={handleInputChange}
            className="p-2 border rounded-md col-span-2"
          />
          <div className="flex items-center space-x-2 col-span-2">
            <input
              type="file"
              name="imageFile"
              onChange={handleFileChange}
              className="p-2 border rounded-md w-full"
            />
            {newMemberData.imageUrl && <img src={newMemberData.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md" />}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSaveMember}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            disabled={loading}
          >
            <Save size={18} className="mr-2" /> {editingMember ? 'Update Member' : 'Add Member'}
          </button>
          {editingMember && (
            <button
              onClick={() => { setEditingMember(null); setNewMemberData({}); }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 flex items-center"
              disabled={loading}
            >
              <XCircle size={18} className="mr-2" /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Team Members List */}
      <h3 className="text-xl font-semibold mb-4">Existing Team Members</h3>
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
            <div className="flex items-center space-x-3">
              <img src={member.imageUrl} alt={member.name} className="w-16 h-16 object-cover rounded-md" />
              <div>
                <p className="font-semibold text-slate-800">{member.name}</p>
                <p className="text-sm text-slate-600">{member.role}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEditClick(member)} className="p-2 text-blue-500 hover:text-blue-700">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDeleteMember(member.id as string)} className="p-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTeam;