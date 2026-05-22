import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { 
  Wallet as WalletIcon, Plus, Trash2, Import, Clipboard, 
  Check, Shield, AlertTriangle, HelpCircle, Activity, Globe, Info 
} from 'lucide-react';

export default function WalletsView() {
  const { wallets, addWallet, deleteWallet } = useAirdropStore();
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Form states
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [chain, setChain] = useState<'EVM' | 'Solana' | 'Bitcoin' | 'Cosmos'>('EVM');
  const [groupName, setGroupName] = useState<'Farming Main' | 'Sybil Bot' | 'Testnet Roll' | 'General'>('General');
  const [balance, setBalance] = useState('1500');

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !label) return;

    await addWallet({
      address,
      label,
      chain,
      groupName,
      balanceUsd: Number(balance) || 0
    });

    // Reset Form
    setAddress('');
    setLabel('');
    setChain('EVM');
    setGroupName('General');
    setBalance('1500');
    setShowAdd(false);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
            <Shield className="h-3 w-3 text-emerald-600" />
            Clear / Safe
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            Warning status
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase animate-pulse">
            <Shield className="h-3 w-3 text-rose-600" />
            High Sybil Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#8c857b] uppercase tracking-wider">Multi-Chain Wallet Matrix ({wallets.length} Keys loaded)</h2>
          <p className="text-xs text-[#a1998f]">Sync addresses below with corresponding farming groups to avoid mutual clustering.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Import className="h-4 w-4" />
          <span>Import Ledger Key</span>
        </button>
      </div>

      {/* Main Table Matrix */}
      <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f2eb] border-b border-[#e4dfd5] text-[10px] uppercase font-bold text-[#8c857b] tracking-wider">
                <th className="px-4 py-3">Wallet / Labeled Node</th>
                <th className="px-4 py-3">Public Hash Address</th>
                <th className="px-4 py-3 text-center">Chain</th>
                <th className="px-4 py-3">Cluster Group</th>
                <th className="px-4 py-3 text-right">Balance USD</th>
                <th className="px-4 py-3 text-center">Txs Index</th>
                <th className="px-4 py-3 text-center">Sybil Risk Audit</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4dfd5] text-xs text-[#2e2c29]">
              {wallets.map((wallet) => (
                <tr key={wallet.id} className="hover:bg-[#fcfbfa]/50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-1.5 rounded-sm bg-[#f5f2eb] text-[#8c857b]">
                        <WalletIcon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#2e2c29]">{wallet.label}</div>
                        <div className="text-[10px] text-[#8c857b]">{wallet.groupName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#4d4a45] bg-[#f5f2eb]/50 px-2 py-0.5 rounded text-[11px]">
                        {wallet.address.substring(0, 10)}...{wallet.address.substring(wallet.address.length - 8)}
                      </span>
                      <button
                        onClick={() => handleCopy(wallet.address)}
                        className="p-1 hover:bg-[#e4dfd5] rounded transition-colors text-[#8c857b]"
                        title="Copy Public address"
                      >
                        {copied === wallet.address ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clipboard className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 bg-neutral-900 text-[#fcfbfa] rounded-sm font-mono text-[10px] font-semibold">{wallet.chain}</span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="bg-amber-100/55 border border-amber-200/50 text-amber-800 px-2 py-0.5 rounded-sm text-[10px] font-bold">
                      {wallet.groupName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                    ${wallet.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono text-slate-600 font-semibold">{wallet.transactionCount} txs</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getRiskBadge(wallet.riskIndicator)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteWallet(wallet.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                      title="Delete Key entry"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {wallets.length === 0 && (
          <div className="p-8 text-center bg-[#fcfbfa] space-y-2">
            <Activity className="h-8 w-8 text-[#a1998f] mx-auto animate-pulse" />
            <p className="text-xs text-[#8c857b] font-semibold">No Wallets Registered</p>
            <p className="text-[10px] text-[#a1998f]">Add EVM, Solana or Cosmos keys to start analyzing balances and tracking transactions.</p>
          </div>
        )}
      </div>

      {/* Info Notice Strip */}
      <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl space-y-1 text-xs text-[#2e2c29] flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0" />
        <div>
          <strong className="font-semibold text-blue-900 block mb-0.5">Automated Multi-address Protection active</strong>
          <span>Airdrop Manager monitors linked transactions across Layer-2 platforms to generate sybil metrics. Always secure wallets inside isolated groups, and assign unique proxy server locations to guard them from multi-wallet links.</span>
        </div>
      </div>

      {/* Add New Wallet Key Overlay Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] px-4 py-3.5 bg-[#f5f2eb]">
              <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
                <WalletIcon className="h-4 w-4 text-emerald-700" />
                <span>Import Public Wallet Ledger</span>
              </h3>
              <button 
                onClick={() => setShowAdd(false)}
                className="p-1 rounded hover:bg-[#e4dfd5]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Wallet Label / Alias *</label>
                <input
                  type="text"
                  placeholder="e.g. Ledger Main Node-01"
                  required
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Public Wallet Address *</label>
                <input
                  type="text"
                  placeholder="0x... or Solana pubkey"
                  required
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Blockchain Network</label>
                  <select
                    className="w-full px-2.5 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
                    value={chain}
                    onChange={(e: any) => setChain(e.target.value)}
                  >
                    <option value="EVM">EVM (Ethereum, Layer2, zkSync)</option>
                    <option value="Solana">Solana</option>
                    <option value="Bitcoin">Bitcoin (BRC-20)</option>
                    <option value="Cosmos">Cosmos Hub</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Farming Group</label>
                  <select
                    className="w-full px-2.5 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
                    value={groupName}
                    onChange={(e: any) => setGroupName(e.target.value)}
                  >
                    <option value="Farming Main">Farming Main</option>
                    <option value="Sybil Bot">Sybil Bot Bundle</option>
                    <option value="Testnet Roll">Testnet Roll Wallets</option>
                    <option value="General">General Isolation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Initial Verified USD Balance</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-[#e4dfd5] text-xs font-semibold rounded-lg hover:bg-[#f5f2eb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2e2c29] text-white text-xs font-semibold rounded-lg hover:bg-[#45423f]"
                >
                  Confirm Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
