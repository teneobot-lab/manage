import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { Users, Plus, UserPlus, ShieldAlert, Check, HelpCircle } from 'lucide-react';

export default function TeamWorkspaceView() {
  const { inviteTeamMember, fetchInitialData } = useAirdropStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('contributor');
  const [copiedCode, setCopiedCode] = useState(false);

  // Invite member action
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await inviteTeamMember(email, role);
    setEmail('');
    alert('Team invitation dispatched successfully!');
  };

  const workspaceCode = 'ALPHA-9981-JOIN';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(workspaceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const members = [
    { name: 'sys_admin', email: 'teneobot@gmail.com', role: 'owner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
    { name: 'farming_manager', email: 'manager@airdrop.io', role: 'contributor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' }
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Joint workspace overview */}
        <div className="lg:col-span-2 bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5 border-b border-[#f5f2eb] pb-3">
            <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-[#8c857b]" />
              <span>Workspace Workspace Alpha Joint Force</span>
            </h3>
            <p className="text-[#8c857b] text-[11px]">Collaborative environment running multi-campaign bot nets cooperatively.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="p-3 bg-[#f5f2eb]/60 rounded-lg space-y-1 border border-[#e4dfd5]/80">
              <span className="text-[10px] uppercase font-bold text-[#8c857b] block">Workspace joining link</span>
              <div className="flex items-center justify-between gap-1 mt-1 bg-[#fcfbfa] px-2 py-1 rounded border border-[#e4dfd5]">
                <span className="font-mono text-zinc-700">{workspaceCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-0.5 bg-[#2e2c29] hover:bg-[#45423f] text-white text-[10px] rounded transition-colors"
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#f5f2eb]/60 rounded-lg space-y-1 border border-[#e4dfd5]/80">
              <span className="text-[10px] uppercase font-bold text-[#8c857b] block">Shared campaigns target list</span>
              <p className="text-[#5c564f] text-[11px] leading-relaxed pt-1">
                Both team managers and owners can update milestones, track reward logs, and view proxy status reports concurrently.
              </p>
            </div>
          </div>
        </div>

        {/* Invite collaborators form */}
        <form onSubmit={handleInvite} className="bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="h-4.5 w-4.5 text-emerald-700" />
            <span>Invite workspace collaborator</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Collaborator E-mail address</label>
              <input
                type="email"
                required
                className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
                placeholder="developer@airdrop.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Assigned Permission role</label>
              <select
                className="w-full px-2.5 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="contributor">Contributor (Can log rewards & tasks)</option>
                <option value="spectator">Spectator (Read-Only monitoring)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#2e2c29] text-white font-semibold rounded-lg hover:bg-[#45423f] transition-all"
          >
            Dispatch Invitation
          </button>
        </form>
      </div>

      {/* Active members matrix */}
      <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f5f2eb] border-b border-[#e4dfd5] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider">Active Workspace Personnel ({members.length} Members)</h3>
        </div>

        <div className="divide-y divide-[#e4dfd5] text-xs">
          {members.map((member, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50/50">
              <div className="flex items-center gap-2.5">
                <img src={member.avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover border border-[#e4dfd5]" />
                <div>
                  <span className="font-bold text-[#2e2c29] block">{member.name}</span>
                  <span className="text-[#8c857b] text-[10px] font-mono">{member.email}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${member.role === 'owner' ? 'bg-[#2e2c29] text-white' : 'bg-[#e4dfd5] text-[#5c564f]'}`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
