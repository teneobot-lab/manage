import React, { useState, useEffect, useRef } from 'react';
import { useAirdropStore } from '../store';
import { 
  Activity, ShieldAlert, Cpu, Heart, Database, ShieldCheck, Terminal, 
  Play, Pause, RefreshCw, Layers, Radio, Network, Trash2, Key, Users, AlertTriangle, Check
} from 'lucide-react';

interface TerminalMessage {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: string;
  text: string;
}

export default function AdminPanel() {
  const { activityLogs, suspendUser, density, theme } = useAirdropStore();
  const [managerState, setManagerState] = useState<'active' | 'suspended'>('active');
  const [isLiveDaemon, setIsLiveDaemon] = useState(true);
  const [telemetryPing, setTelemetryPing] = useState(24);
  const [activeSocketClients, setActiveSocketClients] = useState(12);
  const [processedJobsCount, setProcessedJobsCount] = useState(1420);
  const [activeQueueStatus, setActiveQueueStatus] = useState<'idle' | 'processing' | 'stalled'>('idle');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<TerminalMessage[]>([
    { id: '1', time: '14:20:01', type: 'info', module: 'GATEWAY', text: 'WebSocket connection handshake completed on address internal:3000' },
    { id: '2', time: '14:20:03', type: 'success', module: 'REDIS-DB', text: 'Shared cache keyspace sync complete. Connected using redis://localhost:6379' },
    { id: '3', time: '14:20:05', type: 'info', module: 'BULLMQ', text: 'Queue pool standard-job-scheduler initialized with currency limits: 10/sec' },
    { id: '4', time: '14:20:09', type: 'warning', module: 'PROXY', text: 'Tunnel US-Dallas-04 latency limit exceeded (850ms). Preparing rotation rule...' },
    { id: '5', time: '14:20:10', type: 'success', module: 'PROXY', text: 'Auto-swapped tunnel to SG-Changi-01. Rerouted successfully (42ms ping)' },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Trigger non-blocking visual Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulate ongoing live WebSockets and BullMQ Cron traffic
  useEffect(() => {
    if (!isLiveDaemon) return;

    const interval = setInterval(() => {
      // Randomly update ping and processed counts
      setTelemetryPing(prev => Math.max(12, Math.min(120, prev + (Math.random() > 0.5 ? 4 : -5))));
      setActiveQueueStatus('processing');

      // Spawn random diagnostic logs
      const modules = ['CRON', 'SCHEDULER', 'PROXY', 'METRIC', 'GEMINI-AI', 'WALLET-DETECTOR'];
      const textTemplates = [
        'Running zkSync balance synchronizer across 4 active groupings...',
        'Generated AI recommendation prompts for Scroll Airdrop multiplier.',
        'Ping sweep accomplished: all 15 active proxies online with 100% telemetry.',
        'BullMQ worker completed background verification on task ID tsk-scroll-retweet.',
        'Auto-gas safeguard check: Current average is 14 Gwei. Execution permitted.',
        'Optimized Prisma indices: cached 4,200 analytical table rows to state store.',
        'Risk audit sweep triggered: verified 100% Sybil isolated partitions.'
      ];
      
      const types: ('info' | 'success' | 'warning' | 'error')[] = ['info', 'success', 'warning'];
      const randomModule = modules[Math.floor(Math.random() * modules.length)];
      const randomText = textTemplates[Math.floor(Math.random() * textTemplates.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setTerminalLogs(prev => [
        ...prev.slice(-30), // Retain last 30 logs for memory safety
        {
          id: String(Date.now()),
          time: timeStr,
          type: randomType,
          module: randomModule,
          text: randomText
        }
      ]);

      setProcessedJobsCount(p => p + 1);
      setTimeout(() => setActiveQueueStatus('idle'), 800);

    }, 3800);

    return () => clearInterval(interval);
  }, [isLiveDaemon]);

  // Scroll to terminal bottom automatically
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const handleToggleManager = async () => {
    const nextState = managerState === 'active' ? 'suspended' : 'active';
    await suspendUser('usr-manager', nextState);
    setManagerState(nextState);
    triggerToast(`Farming account (farming_manager) status updated to: ${nextState.toUpperCase()}`);
  };

  const handleForceQueueClear = () => {
    setProcessedJobsCount(0);
    setTerminalLogs(prev => [
      ...prev,
      {
        id: String(Date.now()),
        time: new Date().toLocaleTimeString(),
        type: 'error',
        module: 'BULLMQ',
        text: 'Queue manually purged. Resetting Redis tracker database stats.'
      }
    ]);
    triggerToast('Redis cache cleared, Standard Queue purged successfully.');
  };

  const systems = [
    { name: 'Core Engine Scheduler', status: 'Online', desc: 'Syncing at 1s intervals', health: 'Healthy' },
    { name: 'Gemini AI Advisor Gateway', status: 'Online', desc: 'Prompt models warm', health: 'Healthy' },
    { name: 'SQLite File Persistent DB', status: 'Online', desc: 'JSON Engine loaded', health: 'Healthy' },
    { name: 'Proxy Router Latency', status: 'Healthy', desc: 'SG/US tunnels connected', health: 'Healthy' }
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Visual Toast Notification wrapper */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#2e2c29] dark:bg-zinc-100 text-[#fcfbfa] dark:text-neutral-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-[#eae6db] dark:border-zinc-800 animate-slide-in text-xs font-bold font-sans">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid of Realtime WebSockets Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Latency meter */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c857b] dark:text-[#a1998f] font-extrabold uppercase text-[9px]">
            <span>Socket Latency</span>
            <Radio className="h-4 w-4 text-emerald-600 animate-pulse shrink-0" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono tracking-tight">{telemetryPing}</span>
            <span className="text-[10px] text-[#8c857b] font-mono">ms</span>
          </div>
          <div className="h-1.5 w-full bg-[#f5f2eb] dark:bg-[#201d1a] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                telemetryPing < 45 ? 'bg-emerald-500 w-[90%]' : telemetryPing < 80 ? 'bg-amber-500 w-[60%]' : 'bg-rose-500 w-[30%]'
              }`} 
            />
          </div>
          <span className="text-[9px] text-[#8c857b] leading-tight">Secure real-time tunnel ping stats.</span>
        </div>

        {/* Live Clients */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c857b] dark:text-[#a1998f] font-extrabold uppercase text-[9px]">
            <span>Active Workers</span>
            <Network className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 animate-pulse">
            <span className="text-xl font-black font-mono tracking-tight">{activeSocketClients}</span>
            <span className="text-[10px] text-[#8c857b] font-mono">daemons</span>
          </div>
          <div className="text-[9px] text-[#8c857b] leading-tight mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Redis Pub/Sub channel listening.</span>
          </div>
        </div>

        {/* BullMQ processed counts */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c857b] dark:text-[#a1998f] font-extrabold uppercase text-[9px]">
            <span>Queue Processed</span>
            <Database className="h-4 w-4 text-blue-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono tracking-tight">{processedJobsCount}</span>
            <span className="text-[10px] text-[#8c857b] font-mono">jobs</span>
          </div>
          <div className="text-[9px] hover:underline text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer font-extrabold uppercase" onClick={handleForceQueueClear}>
            <Trash2 className="h-3.5 w-3.5" />
            <span>Force Clear Queue cache</span>
          </div>
        </div>

        {/* BullMQ status indicator */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c857b] dark:text-[#a1998f] font-extrabold uppercase text-[9px]">
            <span>Queue State</span>
            <Activity className="h-4 w-4 text-purple-600 shrink-0" />
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
              activeQueueStatus === 'processing' 
                ? 'bg-purple-100 border border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400' 
                : 'bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
            }`}>
              {activeQueueStatus === 'processing' ? 'Processing Payload' : 'Scheduler Latent'}
            </span>
          </div>
          <span className="text-[9px] text-[#8c857b] leading-tight">Redis cache polling active at 1s resolution.</span>
        </div>
      </div>

      {/* Main split control canvas: Terminals + RBAC controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Live Terminal Stream: 8 width columns */}
        <div className="lg:col-span-8 bg-[#151311] border border-[#272421] rounded-xl overflow-hidden flex flex-col h-[320px] shadow-lg">
          
          {/* Terminal headers */}
          <div className="px-4 py-2.5 bg-[#1b1916] border-b border-[#272421] flex items-center justify-between text-neutral-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-100">Live Client Synapse WebSockets Daemon Stream</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Play/pause ticker */}
              <button 
                onClick={() => setIsLiveDaemon(!isLiveDaemon)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors text-[9px] font-extrabold uppercase ${
                  isLiveDaemon 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/30' 
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {isLiveDaemon ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Streaming live</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 animate-pulse" />
                    <span>Latent paused</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => setTerminalLogs([])}
                className="p-1 rounded text-neutral-400 hover:bg-zinc-800 shrink-0 hover:text-white"
                title="Wipe diagnostics logs screen"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed text-[#c5bdaf] space-y-1.5 scrollbar-thin">
            {terminalLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 hover:bg-zinc-900/30 p-1 rounded transition-colors select-text">
                <span className="text-neutral-600 shrink-0">[{log.time}]</span>
                <span className={`px-1 rounded-sm text-[8px] font-bold shrink-0 uppercase tracking-widest ${
                  log.type === 'success' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' :
                  log.type === 'warning' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/30' :
                  log.type === 'error' ? 'bg-rose-950/50 text-rose-400 border border-rose-900/30' :
                  'bg-sky-950/50 text-sky-400 border border-sky-900/30'
                }`}>
                  {log.module}
                </span>
                <span className="text-zinc-300 leading-normal">{log.text}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Security and User management: 4 width columns */}
        <div className="lg:col-span-4 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl flex flex-col justify-between shadow-2xs">
          
          <div className="p-3 bg-[#f5f2eb] dark:bg-[#1b1916] border-b border-[#e4dfd5] dark:border-[#272421]">
            <span className="font-extrabold uppercase text-[#2e2c29] dark:text-[#f4f3f1] tracking-wider text-[10px] flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-600 dark:text-rose-500" />
              <span>Identity Governance controls (RBAC)</span>
            </span>
          </div>

          <div className="p-3.5 space-y-3.5 flex-1">
            <p className="text-[#8c857b] dark:text-[#a1998f] text-[11px] leading-relaxed">Limit personnel credentials on suspected data leak attempts. Role-Based Access controls (RBAC) isolate farming operator actions from master administrators.</p>

            {/* Operator accounts list */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-[#f5f2eb]/60 dark:bg-[#1c1a17]/50 border border-[#e4dfd5] dark:border-[#272421] p-2.5 rounded-lg">
                <div>
                  <span className="font-bold text-[#2e2c29] dark:text-[#f4f3f1] block text-[11px]">Primary Operator (farming_manager)</span>
                  <span className="text-[10px] text-[#8c857b] font-mono leading-none">manager@airdrop.io</span>
                </div>
                <button
                  onClick={handleToggleManager}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer border ${
                    managerState === 'active' 
                      ? 'bg-rose-50 border-rose-200 dark:border-rose-950 text-rose-800 dark:text-rose-400 hover:bg-rose-100'
                      : 'bg-emerald-50 border-emerald-200 dark:border-emerald-950 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100'
                  }`}
                >
                  {managerState === 'active' ? 'Suspend Node' : 'Activate Node'}
                </button>
              </div>

              {/* Readonly supervisor account */}
              <div className="flex justify-between items-center bg-[#f5f2eb]/30 dark:bg-[#1c1a17]/20 border border-dashed border-[#e4dfd5] dark:border-[#272421] p-2.5 rounded-lg">
                <div>
                  <span className="font-extrabold text-[#2e2c29] dark:text-[#f4f3f1] block text-[11px] opacity-75">Supervisor Auditor (supervisor_master)</span>
                  <span className="text-[10px] text-[#8c857b] font-mono leading-none">auditor@airdrop.io</span>
                </div>
                <span className="px-2 py-0.5 bg-neutral-200 dark:bg-[#1c1a17] text-neutral-700 dark:text-neutral-400 rounded text-[9px] font-bold uppercase tracking-wide border border-neutral-300 dark:border-neutral-800">
                  Read Only
                </span>
              </div>
            </div>

            {/* Simulated governance status notice */}
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/40 rounded-lg flex gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="text-[10px] text-[#5c564f] dark:text-[#a1998f] leading-normal">
                <span className="font-bold text-emerald-900 dark:text-emerald-400 block uppercase tracking-wide text-[9px] mb-0.5">TLS Cryptographic isolation checked</span>
                Keys are automatically encapsulated using local Web Workers to prevent exposure on state logs.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Trail Logs card */}
      <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17] border-b border-[#e4dfd5] dark:border-[#272421] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="h-4.5 w-4.5 text-[#8c857b] dark:text-[#a1998f]" />
            <span>Interactive Governance Audit Trail Trail</span>
          </h3>
          <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] font-mono uppercase font-bold">{activityLogs.length} security actions registered</span>
        </div>

        <div className="overflow-y-auto max-h-60 p-2.5 space-y-1 bg-white/40 dark:bg-zinc-950/20">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#f5f2eb]/30 hover:bg-[#fcfbfa] dark:hover:bg-[#161412] dark:hover:border-[#38332e] border border-transparent p-2 rounded-lg text-xs gap-1.5">
              <div className="space-y-0.5">
                <span className="font-extrabold text-[#2e2c29] dark:text-[#f4f3f1]">{log.action || 'System trigger'}</span>
                <p className="text-[#5c564f] dark:text-[#a1998f] text-[11px] leading-relaxed">{log.details}</p>
              </div>
              <div className="text-right font-mono text-[9px] text-[#8c857b] dark:text-[#a1998f] shrink-0">
                <div className="text-[#2e2c29] dark:text-[#f4f3f1] font-sans font-semibold">{log.userEmail}</div>
                <div>Hash: {log.ip} | Time: {new Date(log.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {activityLogs.length === 0 && (
            <div className="p-6 text-center text-[#8c857b] italic">No administration governance logs compiled yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
