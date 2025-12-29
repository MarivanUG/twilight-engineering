import { useState, useEffect } from 'react';
import type { TeamMember } from '../../types';
import { getTeamMembers } from '../../lib/firestoreService';
import { DEFAULT_TEAM } from '../../lib/constants';

export const TeamSection: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const fetchedTeam = await getTeamMembers();
        if (fetchedTeam && fetchedTeam.length > 0) {
          setTeam(fetchedTeam as TeamMember[]);
        } else {
          // Ensure DEFAULT_TEAM matches the TeamMember type
          const defaultMappedTeam: TeamMember[] = DEFAULT_TEAM.map(member => ({
            id: member.id,
            name: member.name,
            role: member.role,
            imageUrl: member.imageUrl,
            bio: member.bio,
            createdAt: member.createdAt,
          }));
          setTeam(defaultMappedTeam);
        }
      } catch (error) {
        console.error("Failed to fetch team members, using default:", error);
        const defaultMappedTeam: TeamMember[] = DEFAULT_TEAM.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          imageUrl: member.imageUrl,
          bio: member.bio,
          createdAt: member.createdAt,
        }));
        setTeam(defaultMappedTeam);
      }
    };

    fetchTeam();
  }, []);

  if (team.length === 0) {
    return (
      <section className="py-20 bg-white border-t border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500">Loading team members...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-orange-600 font-bold uppercase text-sm mb-3">Our Team</h2>
        <h3 className="text-3xl font-bold text-slate-900 mb-16">Meet the Experts</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {team.map(m => (
            <div key={m.id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <div className="p-4 border border-t-0 rounded-b-2xl">
                <h4 className="font-bold text-slate-900">{m.name}</h4>
                <p className="text-orange-600 text-sm">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};