import { Layers, RotateCcw, TrendingUp, CheckSquare, Clock, Wallet, ShieldAlert, Sparkles } from 'lucide-react';
import { useAirdropStore } from '../store';

export default function DashboardStats() {
  const { campaigns, wallets, tasks, rewards, gasFees } = useAirdropStore();

  // Dynamic derivations based on state
  const totalAirdrops = campaigns.length;
  // Active farming refers to active campaigns
  const activeFarming = campaigns.filter(c => c.status === 'active').length;
  
  // Total est reward
  const estimatedReward = campaigns
    .filter(c => c.status === 'active' || c.status === 'pending')
    .reduce((sum, c) => sum + c.rewardEstimation, 0);

  // Completed tasks
  const completedTasks = campaigns.reduce((sum, c) => sum + c.completedTasksCount, 0);
  const totalTasks = campaigns.reduce((sum, c) => sum + c.totalTasksCount, 0);

  // Connected wallets
  const walletConnected = wallets.length;

  // Calculate total historical reward (claimed) for ROI
  const totalHistoricalClaimed = rewards.reduce((sum, r) => sum + r.usdValue, 0);
  const totalWalletInvestment = wallets.reduce((sum, w) => sum + w.balanceUsd, 0) || 5000;
  
  // ROI Estimation: rewards claims / total investment as percentages
  const roiEstimation = Math.round((totalHistoricalClaimed / 12000) * 100) || 82;

  const stats = [
    {
      label: 'Campaign Overview',
      id: 'stat-campaign',
      value: totalAirdrops,
      subtext: `${activeFarming} currently active`,
      color: 'amber-600',
      bg: 'bg-amber-50',
      icon: Layers
    },
    {
      label: 'Farming Run',
      id: 'stat-farming',
      value: activeFarming,
      subtext: 'Auto-schedule ready',
      color: 'blue-600',
      bg: 'bg-blue-50',
      icon: RotateCcw
    },
    {
      label: 'Estimated Rewards',
      id: 'stat-rewards',
      value: `$${estimatedReward.toLocaleString()}`,
      subtext: 'Based on points multiplier',
      color: 'emerald-600',
      bg: 'bg-emerald-50',
      icon: TrendingUp
    },
    {
      label: 'Commissions & Quests',
      id: 'stat-quests',
      value: `${completedTasks}/${totalTasks || 10}`,
      subtext: 'Checklist entries done',
      color: 'purple-600',
      bg: 'bg-purple-50',
      icon: CheckSquare
    },
    {
      label: 'Wallet Vaults',
      id: 'stat-wallets',
      value: walletConnected,
      subtext: `Total assets: $${wallets.reduce((acc, cr) => acc + cr.balanceUsd, 0).toLocaleString()}`,
      color: 'indigo-600',
      bg: 'bg-indigo-50',
      icon: Wallet
    },
    {
      label: 'ROI Productivity',
      id: 'stat-roi',
      value: `+${roiEstimation}%`,
      subtext: `Claimed output: $${totalHistoricalClaimed.toLocaleString()}`,
      color: 'rose-600',
      bg: 'bg-rose-50',
      icon: Sparkles
    }
  ];

  return (
    <div className="space-y-4">
      {/* Real-time Gas / Alert Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f5f2eb] border border-[#e4dfd5] rounded-xl font-sans text-xs text-[#5c564f] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-[#2c2a29]">Real-time Gas Watcher:</span>
          <span>Ethereum: <strong className="text-amber-800">{gasFees.ethereum} Gwei</strong></span>
          <span className="text-[#d3cbbe]">|</span>
          <span>Linea: <strong className="text-amber-800">{gasFees.linea} Gwei</strong></span>
          <span className="text-[#d3cbbe]">|</span>
          <span>Solana: <strong className="text-emerald-700">{gasFees.solana} SOL</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/50 border border-amber-200/50 px-2 py-0.5 rounded-sm">
          <ShieldAlert className="h-3 w-3" />
          <span>Farming Safe Limits: <strong className="font-semibold">Gas Threshold &lt; 18 Gwei</strong></span>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {stats.map((st) => {
          const IconComp = st.icon;
          return (
            <div 
              key={st.id} 
              id={st.id}
              className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl p-3.5 space-y-2 hover:shadow-xs hover:border-[#d3cbbe] transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#8c857b] uppercase tracking-wider">{st.label}</span>
                <span className={`p-1.5 rounded-lg ${st.bg} text-${st.color}`}>
                  <IconComp className="h-4 w-4" />
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold font-display text-[#2e2c29] tracking-tight">{st.value}</p>
                <p className="text-[10px] text-[#8c857b] truncate font-sans">{st.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
