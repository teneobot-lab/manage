import { useState } from 'react';
import { useAirdropStore } from '../store';
import { Activity, ShieldAlert, Cpu, Heart, Database, ShieldCheck, Terminal } from 'lucide-react';

export default function AdminPanel() {
  const { activityLogs, suspendUser } = useAirdropStore();
  const [managerState, setManagerState] = useState<'active' | 'suspended'>('active');

  const handleToggleManager = async () => {
    const nextState = managerState === 'active' ? 'suspended' : 'active';
    await suspendUser('usr-manager', nextState);
    setManagerState(nextState);
    alert(`farming_manager account status set to: ${nextState.toUpperCase()}`);
  };

  const systems = [
    { name: 'Core Engine Scheduler', status: 'Online', desc: 'Syncing at 1s intervals', health: 'Healthy' },
    { name: 'Gemini AI Advisor Gateway', status: 'Online', desc: 'Prompt models warm', health: 'Healthy' },
    { name: 'SQLite File Persistent DB', status: 'Online', desc: 'JSON Engine loaded', health: 'Healthy' },
    { name: 'Proxy Router Latency', status: 'Healthy', desc: 'SG/US tunnels connected', health: 'Healthy' }
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* System Health metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Control Panel */}
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-600" />
            <span>Personnel & Access Administration Controls</span>
          </h3>
          <p className="text-[#8c857b] text-[11px]">Audit active personnel nodes. Use options below to restrict specific user keys on data leaks.</p>

          <div className="flex justify-between items-center bg-[#f5f2eb]/60 border border-[#e4dfd5] p-3 rounded-lg">
            <div>
              <span className="font-bold text-[#2e2c29] block">Manager Account (farming_manager)</span>
              <span className="text-[10px] text-[#8c857b] font-mono">manager@airdrop.io</span>
            </div>
            <button
              onClick={handleToggleManager}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                managerState === 'active' 
                  ? 'bg-rose-100 border border-rose-200 text-rose-800 hover:bg-rose-200'
                  : 'bg-emerald-100 border border-emerald-200 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              {managerState === 'active' ? 'Suspend Account' : 'Activate Account'}
            </button>
          </div>
        </div>

        {/* System Health list */}
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="h-4.5 w-4.5 text-emerald-700 animate-pulse" />
            <span>Infrastructure Health Status Monitor</span>
          </h3>

          <div className="space-y-2.5">
            {systems.map((sys, i) => (
              <div key={i} className="flex justify-between items-start text-xs border-b border-[#f5f2eb] pb-2">
                <div>
                  <span className="font-semibold text-zinc-800 block">{sys.name}</span>
                  <span className="text-[#8c857b] text-[10px]">{sys.desc}</span>
                </div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Audit Trail Logs */}
      <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f5f2eb] border-b border-[#e4dfd5] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="h-4.5 w-4.5 text-[#8c857b]" />
            <span>Security Governance Audit Trail Logs</span>
          </h3>
          <span className="text-[10px] text-[#8c857b] font-mono uppercase font-bold">{activityLogs.length} events compiled</span>
        </div>

        <div className="overflow-y-auto max-h-60 p-2 space-y-1">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#f5f2eb]/30 hover:bg-[#fcfbfa] hover:border-[#d3cbbe] border border-transparent p-2.5 rounded-lg text-xs gap-1.5">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">{log.action || 'System trigger'}</span>
                <p className="text-[#5c564f] text-[11px] leading-relaxed">{log.details}</p>
              </div>
              <div className="text-right sm:text-right font-mono text-[9px] text-[#8c857b]">
                <div className="text-[#2e2c29] font-sans font-semibold">{log.userEmail}</div>
                <div>{log.ip} | {new Date(log.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {activityLogs.length === 0 && (
            <div className="p-6 text-center text-[#8c857b] italic">No administration logs generated yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
