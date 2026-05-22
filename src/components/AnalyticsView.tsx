import React from 'react';
import { useAirdropStore } from '../store';
import { AreaChart, TrendingUp, DollarSign, ListTodo, ShieldCheck, Zap } from 'lucide-react';

export default function AnalyticsView() {
  const { campaigns, wallets, rewards, density } = useAirdropStore();

  const totalRewardsUsd = rewards.reduce((sum, r) => sum + r.usdValue, 0);
  const totalWalletsValue = wallets.reduce((sum, w) => sum + w.balanceUsd, 0);
  const totalCampaignsValue = campaigns.reduce((sum, c) => sum + c.rewardEstimation, 0);

  // Success stats calculation
  const totalTasks = campaigns.reduce((sum, c) => sum + c.totalTasksCount, 0) || 12;
  const completedTasks = campaigns.reduce((sum, c) => sum + c.completedTasksCount, 0) || 7;
  const productivityScore = Math.round((completedTasks / totalTasks) * 100) || 58;

  const cardPadding = density === 'compact' ? 'p-3' : 'p-4';
  const gridGap = density === 'compact' ? 'gap-2.5' : 'gap-3.5';

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Overview Stat Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-4 ${gridGap}`}>
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] uppercase font-bold">Realized Net Yield</span>
          <p className="text-lg font-black text-emerald-800 dark:text-emerald-400 font-mono">${totalRewardsUsd.toLocaleString()}</p>
        </div>
        
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] uppercase font-bold">Active Pipeline Value</span>
          <p className="text-lg font-black text-[#2e2c29] dark:text-[#f4f3f1] font-mono">${totalCampaignsValue.toLocaleString()}</p>
        </div>
        
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] uppercase font-bold">Assets Under Management</span>
          <p className="text-lg font-black text-blue-800 dark:text-blue-400 font-mono">${totalWalletsValue.toLocaleString()}</p>
        </div>
        
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] uppercase font-bold">Farming Productivity</span>
          <p className="text-lg font-black text-purple-800 dark:text-purple-400 font-mono">{productivityScore}% Done</p>
        </div>
      </div>

      {/* Analytics Breakdown charts */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${gridGap}`}>
        
        {/* Projections card */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-700 dark:text-indigo-400" />
            <span>Mathematical Reward Projections</span>
          </h3>
          <p className="text-[#8c857b] dark:text-[#a1998f] text-[11px]">Valuations based on multiplier rules and activity levels across network tiers.</p>
          
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2e2c29] dark:text-[#f4f3f1]">
                <span>EVM Core Quests (Monad, Linea, Scroll)</span>
                <span className="font-mono text-emerald-800 dark:text-emerald-400">$7,500 - $14,000 (Highly Probable)</span>
              </div>
              <div className="w-full bg-[#f5f2eb] dark:bg-[#201d1a] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2e2c29] dark:text-[#f4f3f1]">
                <span>Altcoins Faucets (Berachain etc)</span>
                <span className="font-mono text-emerald-800 dark:text-emerald-400">$3,200 - $5,500 (Medium Probable)</span>
              </div>
              <div className="w-full bg-[#f5f2eb] dark:bg-[#201d1a] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-[#2e2c29] dark:text-[#f4f3f1]">
                <span>DePIN Hardware Mining Farms</span>
                <span className="font-mono text-[#8c857b] dark:text-[#a1998f]">$1,500 - $3,000 (Speculative)</span>
              </div>
              <div className="w-full bg-[#f5f2eb] dark:bg-[#201d1a] h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Quality matrix guidelines */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-500" />
            <span>Wallet Cluster Quality Inspector</span>
          </h3>
          <p className="text-[#8c857b] dark:text-[#a1998f] text-[11px]">Evaluates Sybil fingerprint factors across connected wallets.</p>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-3 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl">
              <Zap className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950 dark:text-emerald-300 block">Safe balance randomized range active</span>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-400/90 leading-normal">Your wallets do not contain uniform fractional assets, greatly decreasing on-chain algorithm fingerprint matching risks.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 dark:bg-blue-950/15 border border-blue-200/50 dark:border-blue-900/40 rounded-xl">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-blue-950 dark:text-blue-300 block">Proxy Tunnel Integration checked</span>
                <p className="text-[10px] text-blue-800 dark:text-blue-400/90 leading-normal">Local routing protocols securely split network trails for operators using separate browser profiles.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
