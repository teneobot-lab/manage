import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { Award, Plus, Coins, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function RewardsView() {
  const { rewards, campaigns, wallets, fetchInitialData } = useAirdropStore();
  const [showSimulate, setShowSimulate] = useState(false);

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

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#8c857b] uppercase tracking-wider">Distributed Rewards Ledger & Estimator</h2>
          <p className="text-xs text-[#a1998f]">Log real claims & simulate reward valuations across multiple mainnet allocations.</p>
        </div>
        <button
          onClick={() => {
            if (campaigns.length === 0 || wallets.length === 0) {
              alert('Please create at least one active wallet and campaign first to simulate reward distributions!');
              return;
            }
            setShowSimulate(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Simulate Distributed Reward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph representation */}
        <div className="lg:col-span-2 bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f5f2eb] pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2e2c29] uppercase tracking-wider">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-700" />
              <span>Projected Claims VS Realized Valuations</span>
            </div>
            <span className="text-[10px] font-mono text-[#8c857b]">Updates dynamically</span>
          </div>

          {/* Simple custom SVG chart for high-quality dashboard vibe */}
          <div className="h-40 relative flex items-end">
            <svg className="w-full h-full absolute inset-0 text-emerald-600" viewBox="0 0 400 100" preserveAspectRatio="none">
              {/* Reference Grid lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#f5f2eb" strokeWidth="1" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f5f2eb" strokeWidth="1" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#f5f2eb" strokeWidth="1" />
              {/* Fill Trend area */}
              <path d="M 0,90 Q 100,55 200,65 T 400,20 L 400,100 L 0,100 Z" fill="rgba(16, 185, 129, 0.08)" />
              {/* Real path */}
              <path d="M 0,90 Q 100,55 200,65 T 400,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="absolute left-2 top-2 text-[8px] font-mono text-[#a1998f]">$15,000</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-[#a1998f]">$7,500</div>
            <div className="absolute left-2 bottom-2 text-[8px] font-mono text-[#a1998f]">$0</div>

            {/* Labels overlay */}
            <div className="w-full flex justify-between px-6 text-[9px] font-medium text-[#8c857b] uppercase mt-2">
              <span>Q1 2026</span>
              <span>Q2 2026</span>
              <span>Q3 2026</span>
              <span>Q4 2026 (Est)</span>
            </div>
          </div>
        </div>

        {/* Claim summary ledger */}
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[#8c857b] uppercase">Allocation statistics</h3>
            <p className="text-[11px] text-[#a1998f]">Consolidated multi-chain rewards tracker diagnostics.</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[#f5f2eb]">
              <span className="text-[#5c564f]">Realized Claim Value ({rewards.length} events)</span>
              <span className="font-bold font-mono text-emerald-800">${rewards.reduce((acc, cr) => acc + cr.usdValue, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#f5f2eb]">
              <span className="text-[#5c564f]">Projected Unbound Multiplier</span>
              <span className="font-bold font-mono text-[#2e2c29]">3.2x Gas efficiency</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#5c564f]">ROI Valuation Index</span>
              <span className="font-bold font-mono text-blue-700">+124.5% Net Target</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/50 p-2.5 rounded-lg flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span className="text-[10px] text-amber-800 leading-normal">
              Simulation estimates assume token distributions occur at 25% initial token unlock limits. Unlocks beyond Cliff periods are excluded from ROI data logs.
            </span>
          </div>
        </div>
      </div>

      {/* Reward Logs Table */}
      <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f5f2eb] border-b border-[#e4dfd5] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="h-4.5 w-4.5 text-[#8c857b]" />
            <span>Distribution History</span>
          </h3>
          <span className="text-[10px] font-bold text-[#8c857b] uppercase">{rewards.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-[#f5f2eb]/50 border-b border-[#e4dfd5] text-[10px] font-semibold text-[#8c857b] tracking-wider uppercase">
                <th className="px-4 py-2.5">Airdrop Origin</th>
                <th className="px-4 py-2.5">Beneficiary Wallet</th>
                <th className="px-4 py-2.5 text-right">Reward Tokens</th>
                <th className="px-4 py-2.5 text-right">Net Value USD</th>
                <th className="px-4 py-2.5 text-center">Verification Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4dfd5] text-[#2e2c29]">
              {rewards.map((rew) => (
                <tr key={rew.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-amber-900">{rew.campaignName}</td>
                  <td className="px-4 py-3 font-mono">{rew.walletLabel}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{rew.amount.toLocaleString()} {rew.tokenSymbol}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-800 font-bold">${rew.usdValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-[10px] text-[#8c857b] font-mono">{new Date(rew.dateReceived).toLocaleDateString()}</td>
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

      {/* Simulate Claim Modal */}
      {showSimulate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] px-4 py-3.5 bg-[#f5f2eb]">
              <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Coins className="h-4 w-4 text-emerald-700" />
                <span>Simulate Distribution Intake</span>
              </h3>
              <button 
                onClick={() => setShowSimulate(false)}
                className="p-1 rounded hover:bg-[#e4dfd5]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSimulateClaim} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Intake Origin Campaign *</label>
                <select
                  required
                  className="w-full px-2.5 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                >
                  <option value="">-- Choose Campaign Origin --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Target Beneficiary Wallet *</label>
                <select
                  required
                  className="w-full px-2.5 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
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
                  <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Reward Tokens amount</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Token Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONAD"
                    className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono uppercase"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Calculated Valuation (USD value)</label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
                  value={usdValue}
                  onChange={(e) => setUsdValue(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] pt-3">
                <button
                  type="button"
                  onClick={() => setShowSimulate(false)}
                  className="px-4 py-2 border border-[#e4dfd5] text-xs font-semibold rounded-lg hover:bg-[#f5f2eb]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-850"
                >
                  Verify and claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
