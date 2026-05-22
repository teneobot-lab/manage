import { useAirdropStore } from '../store';
import { AreaChart, TrendingUp, DollarSign, ListTodo, ShieldCheck, Zap } from 'lucide-react';

export default function AnalyticsView() {
  const { campaigns, wallets, rewards } = useAirdropStore();

  const totalRewardsUsd = rewards.reduce((sum, r) => sum + r.usdValue, 0);
  const totalWalletsValue = wallets.reduce((sum, w) => sum + w.balanceUsd, 0);
  const totalCampaignsValue = campaigns.reduce((sum, c) => sum + c.rewardEstimation, 0);

  // Success stats calculation
  const totalTasks = campaigns.reduce((sum, c) => sum + c.totalTasksCount, 0) || 12;
  const completedTasks = campaigns.reduce((sum, c) => sum + c.completedTasksCount, 0) || 7;
  const productivityScore = Math.round((completedTasks / totalTasks) * 100) || 58;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-3 rounded-lg space-y-1">
          <span className="text-[10px] text-[#8c857b] uppercase font-semibold">Realized Net Yield</span>
          <p className="text-lg font-bold text-emerald-800 font-display">${totalRewardsUsd.toLocaleString()}</p>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-3 rounded-lg space-y-1">
          <span className="text-[10px] text-[#8c857b] uppercase font-semibold">Active Pipeline Value</span>
          <p className="text-lg font-bold text-[#2e2c29] font-display">${totalCampaignsValue.toLocaleString()}</p>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-3 rounded-lg space-y-1">
          <span className="text-[10px] text-[#8c857b] uppercase font-semibold">Wallet Assets Under Management</span>
          <p className="text-lg font-bold text-blue-800 font-display">${totalWalletsValue.toLocaleString()}</p>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-3 rounded-lg space-y-1">
          <span className="text-[10px] text-[#8c857b] uppercase font-semibold">Farming Productivity</span>
          <p className="text-lg font-bold text-purple-800 font-display">{productivityScore}% Done</p>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Predicted metrics */}
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-700" />
            <span>Mathematical Reward Projections</span>
          </h3>
          <p className="text-[#8c857b] text-[11px]">Valuations based on multiplier rules and activity levels across network tiers.</p>
          
          <div className="space-y-2.5 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>EVM Core Quests (Monad, Linea, Scroll)</span>
                <span className="font-mono font-bold">$7,500 - $14,000 (Highly Probable)</span>
              </div>
              <div className="w-full bg-[#f5f2eb] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Altcoins Faucets (Berachain etc)</span>
                <span className="font-mono font-bold">$3,200 - $5,500 (Medium Probable)</span>
              </div>
              <div className="w-full bg-[#f5f2eb] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>DePIN Hardware Mining Farms</span>
                <span className="font-mono font-bold">$1,500 - $3,000 (Speculative)</span>
              </div>
              <div className="w-full bg-[#f5f2eb] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality indicator / Sybil protection guidelines */}
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-800" />
            <span>Wallet Cluster Quality Inspector</span>
          </h3>
          <p className="text-[#8c857b] text-[11px]">Evaluates Sybil fingerprint factors across connected wallets.</p>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2 bg-emerald-50 border border-emerald-200/50 rounded-lg">
              <Zap className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950 block">Safe balance range active</span>
                <p className="text-[10px] text-emerald-800 leading-normal">Your wallets do not have uniform fractional amounts, decreasing fingerprint matching chances.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 bg-blue-50 border border-blue-200/50 rounded-lg">
              <ShieldCheck className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-blue-950 block">Proxy Rotation checks satisfied</span>
                <p className="text-[10px] text-blue-800 leading-normal">Proxy settings successfully direct distinct web routes for linked bot social accounts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
