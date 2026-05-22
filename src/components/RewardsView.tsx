import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { Award, Plus, Coins, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RewardsView() {
  const { rewards, campaigns, wallets, fetchInitialData, density, theme } = useAirdropStore();
  const [showSimulate, setShowSimulate] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Form states
  const [campaignId, setCampaignId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('1000');
  const [tokenSymbol, setTokenSymbol] = useState('MONAD');
  const [usdValue, setUsdValue] = useState('2200');

  const handleSimulateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId || !walletId || !amount) return;

    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          walletId,
          amount: Number(amount),
          tokenSymbol,
          usdValue: Number(usdValue)
        })
      });

      if (res.ok) {
        // Trigger global refetch to synchronize total balances and claims statistics
        await fetchInitialData();
        setShowSimulate(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenSimulate = () => {
    if (campaigns.length === 0 || wallets.length === 0) {
      setShowWarningModal(true);
      return;
    }
    setShowSimulate(true);
  };

  const tablePadding = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2.5';
  const gridGap = density === 'compact' ? 'gap-2.5' : 'gap-4';

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Alert modal fallback for simulation validation */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl w-full max-w-sm shadow-xl p-5 space-y-4 font-sans text-xs">
            <div className="flex gap-2.5 items-start">
              <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wide">Prerequisites Required</h4>
                <p className="text-[#8c857b] dark:text-[#a1998f] leading-relaxed">Please ensure you have configured at least one active wallet on the ledger and one target campaign map before dispatching a simulated distributed event.</p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#e4dfd5] dark:border-[#272421]">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-1.5 bg-[#2e2c29] dark:bg-[#eae6db] text-white dark:text-neutral-900 rounded-lg font-bold cursor-pointer hover:opacity-90 transition-all text-xs"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-amber-700 dark:text-amber-500" />
            <span>Cryptographic Rewards Allocation Ledger</span>
          </h2>
          <p className="text-[11px] text-[#a1998f] dark:text-[#8c857b]">Log verified claims & simulate dynamic target asset distributions across node groups.</p>
        </div>
        <button
          onClick={handleOpenSimulate}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Simulate Distributed claim</span>
        </button>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 ${gridGap}`}>
        {/* Trend Area SVG chart */}
        <div className="lg:col-span-2 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f5f2eb] dark:border-[#201d1a] pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-500" />
              <span>Projected Claims Vs Realized Net Valuations</span>
            </div>
            <span className="text-[10px] font-mono text-[#8c857b] dark:text-[#a1998f]">{rewards.length} updates logged</span>
          </div>

          <div className="h-40 relative flex items-end bg-neutral-50/20 dark:bg-neutral-950/20 rounded-lg p-2 overflow-hidden border border-dashed border-neutral-200 dark:border-neutral-800">
            <svg className="w-full h-full absolute inset-0 text-emerald-600 dark:text-emerald-500" viewBox="0 0 400 100" preserveAspectRatio="none">
              {/* Reference Grid lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#f5f2eb" strokeWidth="1" className="opacity-15" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f5f2eb" strokeWidth="1" className="opacity-15" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#f5f2eb" strokeWidth="1" className="amber-15" />
              {/* Trend region fill */}
              <path d="M 0,90 Q 100,55 200,65 T 400,20 L 400,100 L 0,100 Z" fill="rgba(16, 185, 129, 0.08)" />
              {/* Primary plot line */}
              <path d="M 0,90 Q 100,55 200,65 T 400,20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="absolute left-2.5 top-2 text-[8px] font-mono text-[#8c857b] dark:text-[#a1998f]">$15,000</div>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[8px] font-mono text-[#8c857b] dark:text-[#a1998f]">$7,500</div>
            <div className="absolute left-2.5 bottom-2 text-[8px] font-mono text-[#8c857b] dark:text-[#a1998f]">$0</div>

            {/* Timelines row overlay */}
            <div className="w-full flex justify-between px-6 text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase mt-2 absolute bottom-2 left-0 right-0">
              <span>Q1 2026</span>
              <span>Q2 2026</span>
              <span>Q3 2026</span>
              <span>Q4 2026 (Est)</span>
            </div>
          </div>
        </div>

        {/* Claim side statistic summaries */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Airdrop Allocation Summary diagnostic</h3>
            <p className="text-[11px] text-[#a1998f] dark:text-[#8c857b] leading-tight font-medium">Consolidated multi-chain rewards parameters.</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[#f5f2eb] dark:border-[#201d1a]">
              <span className="text-[#5c564f] dark:text-[#a1998f] font-semibold">Realized Claim Value</span>
              <span className="font-bold font-mono text-emerald-800 dark:text-emerald-400 text-sm">${rewards.reduce((acc, cr) => acc + cr.usdValue, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f5f2eb] dark:border-[#201d1a]">
              <span className="text-[#5c564f] dark:text-[#a1998f] font-semibold">Multi-Chain Efficiency factor</span>
              <span className="font-bold font-mono text-[#2e2c29] dark:text-[#f4f3f1]">3.2x multiplier</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#5c564f] dark:text-[#a1998f] font-semibold">Consolidated Yield Growth</span>
              <span className="font-bold font-mono text-blue-700 dark:text-blue-400">+124.5% net target</span>
            </div>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/40 p-2.5 rounded-lg flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-500 shrink-0 mt-0.5" />
            <span className="text-[10px] text-amber-800 dark:text-amber-400/90 leading-tight">
              Simulation estimates assume token distributions occur at 25% initial token unlock limits. Unlocks beyond Cliff periods are excluded from ROI data logs.
            </span>
          </div>
        </div>
      </div>

      {/* Rewards Logs Table */}
      <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17] border-b border-[#e4dfd5] dark:border-[#272421] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="h-4.5 w-4.5 text-[#8c857b]" />
            <span>Distribution History Ledger</span>
          </h3>
          <span className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">{rewards.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-[#f5f2eb]/50 dark:bg-[#1b1916] border-b border-[#e4dfd5] dark:border-[#272421] text-[10px] font-strong text-[#8c857b] dark:text-[#a1998f] tracking-wide uppercase">
                <th className={tablePadding}>Airdrop Origin</th>
                <th className={tablePadding}>Beneficiary Wallet Node</th>
                <th className={`${tablePadding} text-right`}>Reward Tokens</th>
                <th className={`${tablePadding} text-right`}>Net Value USD</th>
                <th className={`${tablePadding} text-center`}>Verification Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4dfd5] dark:divide-[#272421] text-[#2e2c29] dark:text-[#f4f3f1] font-medium">
              {rewards.map((rew) => (
                <tr key={rew.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1c1a17] transition-colors">
                  <td className={`${tablePadding} font-bold text-amber-900 dark:text-amber-500`}>{rew.campaignName}</td>
                  <td className={`${tablePadding} font-mono text-[11px]`}>{rew.walletLabel}</td>
                  <td className={`${tablePadding} text-right font-mono font-extrabold`}>{rew.amount.toLocaleString()} {rew.tokenSymbol}</td>
                  <td className={`${tablePadding} text-right font-mono text-emerald-850 dark:text-emerald-400 font-extrabold`}>${rew.usdValue.toLocaleString()}</td>
                  <td className={`${tablePadding} text-center text-[10px] text-[#8c857b] font-mono`}>{new Date(rew.dateReceived).toLocaleDateString()}</td>
                </tr>
              ))}
              {rewards.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8c857b] italic text-xs">
                    No reward allocations verified yet. Simulate a claimed token trigger above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulate Claim Overlay Dialog */}
      {showSimulate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl w-full max-w-sm shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17]">
              <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-emerald-700" />
                <span>Simulate Distribution Intake</span>
              </h3>
              <button 
                onClick={() => setShowSimulate(false)}
                className="p-1 rounded hover:bg-[#e4dfd5] dark:hover:bg-[#1c1a17]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSimulateClaim} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] block uppercase">Intake Origin Campaign *</label>
                <select
                  required
                  className="w-full px-2.5 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                >
                  <option value="">-- Choose Campaign target --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] block uppercase">Target Beneficiary Wallet *</label>
                <select
                  required
                  className="w-full px-2.5 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                >
                  <option value="">-- Choose Wallet Node --</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] block uppercase">Reward Tokens count</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] block uppercase">Token Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONAD"
                    className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono uppercase"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] block uppercase">Calculated Valuation (USD)</label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                  value={usdValue}
                  onChange={(e) => setUsdValue(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] dark:border-[#272421] pt-3">
                <button
                  type="button"
                  onClick={() => setShowSimulate(false)}
                  className="px-4 py-2 border border-[#e4dfd5] dark:border-[#272421] text-xs font-semibold rounded-lg hover:bg-[#f5f2eb]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-850 cursor-pointer"
                >
                  Verify and Claim Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
