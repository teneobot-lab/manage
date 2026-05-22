import { Layers, RotateCcw, TrendingUp, CheckSquare, Clock, Wallet, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { useAirdropStore } from '../store';
import { motion, animate } from 'motion/react';
import { useEffect, useState } from 'react';

interface AnimatedValueProps {
  value: number;
  secondaryValue?: number;
  type: 'number' | 'currency' | 'fraction' | 'percentage';
}

function AnimatedValue({ value, secondaryValue, type }: AnimatedValueProps) {
  const [current, setCurrent] = useState(value);
  const [currentSecondary, setCurrentSecondary] = useState(secondaryValue || 0);

  useEffect(() => {
    const controls = animate(current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => setCurrent(latest)
    });
    return () => controls.stop();
  }, [value]);

  useEffect(() => {
    if (secondaryValue === undefined) return;
    const controls = animate(currentSecondary, secondaryValue, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setCurrentSecondary(latest)
    });
    return () => controls.stop();
  }, [secondaryValue]);

  if (type === 'currency') {
    return <span>${Math.round(current).toLocaleString()}</span>;
  }
  if (type === 'percentage') {
    return <span>+{Math.round(current)}%</span>;
  }
  if (type === 'fraction') {
    return <span>{Math.round(current)}/{Math.round(currentSecondary)}</span>;
  }
  return <span>{Math.round(current).toLocaleString()}</span>;
}

export default function DashboardStats() {
  const { campaigns, wallets, tasks, rewards, gasFees, density } = useAirdropStore();

  // Dynamic derivations based on state
  const totalAirdrops = campaigns.length;
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
  
  // ROI Estimation
  const roiEstimation = Math.round((totalHistoricalClaimed / 12000) * 100) || 82;

  const stats = [
    {
      label: 'Campaign Overview',
      id: 'stat-campaign',
      numericValue: totalAirdrops,
      displayType: 'number' as const,
      subtext: `${activeFarming} currently active`,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      icon: Layers
    },
    {
      label: 'Farming Run',
      id: 'stat-farming',
      numericValue: activeFarming,
      displayType: 'number' as const,
      subtext: 'Auto-schedule ready',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      icon: RotateCcw
    },
    {
      label: 'Estimated Rewards',
      id: 'stat-rewards',
      numericValue: estimatedReward,
      displayType: 'currency' as const,
      subtext: 'Points multiplier sync',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      icon: TrendingUp
    },
    {
      label: 'Commissions & Quests',
      id: 'stat-quests',
      numericValue: completedTasks,
      secondaryNumericValue: totalTasks || 10,
      displayType: 'fraction' as const,
      subtext: 'Checklist entries done',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      icon: CheckSquare
    },
    {
      label: 'Wallet Vaults',
      id: 'stat-wallets',
      numericValue: walletConnected,
      displayType: 'number' as const,
      subtext: `Assets: $${wallets.reduce((acc, cr) => acc + cr.balanceUsd, 0).toLocaleString()}`,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/20',
      icon: Wallet
    },
    {
      label: 'ROI Productivity',
      id: 'stat-roi',
      numericValue: roiEstimation,
      displayType: 'percentage' as const,
      subtext: `Claimed: $${totalHistoricalClaimed.toLocaleString()}`,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      icon: Sparkles
    }
  ];

  const pClass = density === 'compact' ? 'p-2 rounded-lg' : 'p-3 rounded-xl';
  const gridGapClass = density === 'compact' ? 'gap-2' : 'gap-3';

  // Framer motion container variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  // Variants for individual statistic cards
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 260, 
        damping: 20 
      } 
    }
  };

  return (
    <div className={density === 'compact' ? 'space-y-2' : 'space-y-4'}>
      {/* Real-time Gas / Alert Strip */}
      <div className={`flex flex-wrap items-center justify-between gap-3 bg-[#f5f2eb] dark:bg-[#1a1816] border border-[#e4dfd5] dark:border-[#272421] text-[#5c564f] dark:text-[#a1998f] shadow-2xs font-sans text-xs ${pClass}`}>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-[#2c2a29] dark:text-[#f4f3f1] uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" />
            <span>Real-time Gas Watcher:</span>
          </span>
          <span className="font-mono text-[11px]">Ethereum: <strong className="text-amber-800 dark:text-amber-400 font-bold">{gasFees.ethereum} Gwei</strong></span>
          <span className="text-[#d3cbbe] dark:text-[#3c3732]">|</span>
          <span className="font-mono text-[11px]">Linea: <strong className="text-amber-800 dark:text-amber-400 font-bold">{gasFees.linea} Gwei</strong></span>
          <span className="text-[#d3cbbe] dark:text-[#3c3732]">|</span>
          <span className="font-mono text-[11px]">Solana: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{gasFees.solana} SOL</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 px-2 py-0.5 rounded-sm text-[10px] font-semibold">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Farming Safe Limits: <strong className="font-bold uppercase">Gas Threshold &lt; 18 Gwei</strong></span>
        </div>
      </div>

      {/* Grid of Stats Cards with Staggered Framer Motion layout */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`grid grid-cols-2 lg:grid-cols-6 ${gridGapClass}`}
      >
        {stats.map((st) => {
          const IconComp = st.icon;
          return (
            <motion.div 
              key={st.id} 
              id={st.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.035, 
                y: -3,
                boxShadow: "0 8px 16px -4px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)"
              }}
              whileTap={{ scale: 0.98 }}
              className={`bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl hover:border-[#cbc6bb] dark:hover:border-[#3c3732] hover:shadow-xs transition-colors duration-200 cursor-pointer ${density === 'compact' ? 'p-2.5 space-y-1.5' : 'p-3.5 space-y-2'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider">{st.label}</span>
                <span className={`p-1.5 rounded-lg ${st.bg} ${st.color}`}>
                  <IconComp className="h-4 w-4" />
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-bold font-mono text-[#2e2c29] dark:text-[#f4f3f1] tracking-tight">
                  <AnimatedValue value={st.numericValue} secondaryValue={st.secondaryNumericValue} type={st.displayType} />
                </p>
                <p className="text-[9px] text-[#8c857b] dark:text-[#a1998f] truncate font-sans leading-none">{st.subtext}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
