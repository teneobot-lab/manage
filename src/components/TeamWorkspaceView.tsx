import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { Users, Plus, UserPlus, ShieldAlert, Check, HelpCircle, Copy, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TeamWorkspaceView() {
  const { inviteTeamMember, density, theme } = useAirdropStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('contributor');
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await inviteTeamMember(email, role);
    setEmail('');
    triggerToast(`Team invitation dispatched successfully to: ${email}`);
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

  const gridGap = density === 'compact' ? 'gap-2.5' : 'gap-4';

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Toast box notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-[#2e2c29] dark:bg-zinc-100 border border-[#e4dfd5]/20 dark:border-zinc-800 text-white dark:text-neutral-900 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold font-sans"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`grid grid-cols-1 lg:grid-cols-3 ${gridGap}`}>
        {/* Joint workspace overview */}
        <div className="lg:col-span-2 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-4 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5 border-b border-[#f5f2eb] dark:border-[#201d1a] pb-3">
            <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-[#8c857b]" />
              <span>Workspace Alpha Joint Force Operation Suite</span>
            </h3>
            <p className="text-[#8c857b] dark:text-[#a1998f] text-[11px]">Collaborative environment running multi-campaign bot nets cooperatively.</p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridGap} py-2`}>
            <div className="p-3 bg-[#f5f2eb]/60 dark:bg-[#1b1916]/50 rounded-lg space-y-1 border border-[#e4dfd5]/80 dark:border-[#272421]">
              <span className="text-[10px] uppercase font-bold text-[#8c857b] dark:text-[#a1998f] block">Workspace join credential code</span>
              <div className="flex items-center justify-between gap-1 mt-1 bg-[#fcfbfa] dark:bg-[#110f0e] px-2 py-1 rounded border border-[#e4dfd5] dark:border-[#272421]">
                <span className="font-mono text-zinc-700 dark:text-zinc-300 block">{workspaceCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-0.5 bg-[#2e2c29] dark:bg-[#eae6db] hover:opacity-90 text-white dark:text-neutral-900 text-[10px] rounded transition-colors flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Copy className="h-2.5 w-2.5" />
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#f5f2eb]/60 dark:bg-[#1b1916]/50 rounded-lg space-y-1 border border-[#e4dfd5]/80 dark:border-[#272421]">
              <span className="text-[10px] uppercase font-bold text-[#8c857b] dark:text-[#a1998f] block">Shared campaigns monitoring</span>
              <p className="text-[#5c564f] dark:text-[#a1998f] text-[11px] leading-relaxed pt-1 font-medium">
                Both team managers and owners can update milestones, track reward logs, and view proxy status reports concurrently.
              </p>
            </div>
          </div>
        </div>

        {/* Invite collaborators form */}
        <form onSubmit={handleInvite} className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-500" />
            <span>Invite workspace collaborator</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Collaborator E-mail address</label>
              <input
                type="email"
                required
                className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
                placeholder="developer@airdrop.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Permission role role</label>
              <select
                className="w-full px-2.5 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
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
            className="w-full py-2 bg-[#2e2c29] dark:bg-[#eae6db] text-white dark:text-neutral-900 font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer text-xs"
          >
            Dispatch Invitation Link
          </button>
        </form>
      </div>

      {/* Active members matrix */}
      <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17] border-b border-[#e4dfd5] dark:border-[#272421] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider">Active Workspace Personnel ({members.length} Members)</h3>
        </div>

        <div className="divide-y divide-[#e4dfd5] dark:divide-[#272421] text-xs">
          {members.map((member, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-[#neutral-50] dark:hover:bg-[#1c1916]">
              <div className="flex items-center gap-2.5">
                <img src={member.avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover border border-[#e4dfd5] dark:border-[#272421]" />
                <div>
                  <span className="font-extrabold text-[#2e2c29] dark:text-[#f4f3f1] block">{member.name}</span>
                  <span className="text-[#8c857b] dark:text-[#a1998f] text-[10px] font-mono">{member.email}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${member.role === 'owner' ? 'bg-[#2e2c29] dark:bg-[#eae6db] text-[#fcfbfa] dark:text-neutral-950' : 'bg-[#e4dfd5] dark:bg-[#201d1aa]/45 text-[#5c564f] dark:text-[#a1998f]'}`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
