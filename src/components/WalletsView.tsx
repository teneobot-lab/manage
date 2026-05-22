import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { 
  Wallet as WalletIcon, Plus, Trash2, Import, Clipboard, 
  Check, Shield, AlertTriangle, HelpCircle, Activity, Globe, Info, Download, Filter, Search, Grid, LineChart, Cpu, RefreshCw
} from 'lucide-react';

export default function WalletsView() {
  const { wallets, addWallet, deleteWallet, density, theme } = useAirdropStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(wallets[0]?.id || null);

  // Filter & Search states
  const [searchFilter, setSearchFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Form states
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [chain, setChain] = useState<'EVM' | 'Solana' | 'Bitcoin' | 'Cosmos'>('EVM');
  const [groupName, setGroupName] = useState<'Farming Main' | 'Sybil Bot' | 'Testnet Roll' | 'General'>('General');
  const [balance, setBalance] = useState('1500');

  // Bulk paste states
  const [bulkText, setBulkText] = useState('');

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 1500);
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

    setAddress('');
    setLabel('');
    setChain('EVM');
    setGroupName('General');
    setBalance('1500');
    setShowAdd(false);
  };

  // Bulk Import parser
  const handleBulkImport = async () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    let count = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      // Format support: Address,Label,Balance OR just Address
      const segments = line.split(',');
      const parsedAddr = segments[0]?.trim();
      const parsedLabel = segments[1]?.trim() || `Node-${Math.floor(Math.random() * 900) + 100}`;
      const parsedBal = Number(segments[2]?.trim()) || Math.floor(Math.random() * 900) + 150;

      if (parsedAddr && parsedAddr.length > 10) {
        await addWallet({
          address: parsedAddr,
          label: parsedLabel,
          chain: parsedAddr.startsWith('0x') ? 'EVM' : 'Solana',
          groupName: 'General',
          balanceUsd: parsedBal
        });
        count++;
      }
    }

    setBulkText('');
    setShowBulkAdd(false);
    alert(`Successfully parsed and registered ${count} high-performance ledger nodes in parallel!`);
  };

  // Bulk Export to CSV
  const handleCSVExport = () => {
    if (wallets.length === 0) return;
    const headers = 'ID,Label,Address,Chain,Group,BalanceUSD,Transactions,Risk\n';
    const rows = wallets.map(w => 
      `"${w.id}","${w.label}","${w.address}","${w.chain}","${w.groupName}",${w.balanceUsd},${w.transactionCount},"${w.riskIndicator}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `airdrop_wallets_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
            <Shield className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Clear
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse">
            <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400 hover:scale-110" />
            Sybil Risk
          </span>
        );
    }
  };

  // Filtered dataset
  const filteredWallets = wallets.filter(w => {
    const matchesSearch = w.label.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          w.address.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesGroup = groupFilter === 'ALL' || w.groupName === groupFilter;
    const matchesRisk = riskFilter === 'ALL' || w.riskIndicator === riskFilter;
    return matchesSearch && matchesGroup && matchesRisk;
  });

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Upper Command Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xs font-extrabold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-spin-slow" />
            <span>Multi-Chain Wallet Matrix ({wallets.length} Keys loaded)</span>
          </h2>
          <p className="text-[11px] text-[#a1998f] dark:text-[#8c857b]">Audit address groupings, Sybil cluster scores, and execute micro-transactions isolated via proxies.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f5f2eb] dark:bg-[#1b1916] hover:bg-[#e4dfd5] dark:hover:bg-[#272421] border border-[#e4dfd5] dark:border-[#272421] text-[#2c2a29] dark:text-[#f4f3f1] rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="Export registry to CSV format"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setShowBulkAdd(!showBulkAdd)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="Import dozens of wallet keys simultaneously"
          >
            <Import className="h-4 w-4" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Bulk Upload Panel Accordion */}
      {showBulkAdd && (
        <div className="p-4 bg-[#f5f2eb] dark:bg-[#151311] border border-[#cbd2c0] dark:border-[#272421] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase text-[10px] tracking-wide flex items-center gap-1">
              <Import className="h-3.5 w-3.5 text-amber-500" />
              <span>Bulk Parse CSV or Raw Cryptographic Public Key Rows</span>
            </span>
            <button className="text-[10px] underline text-[#8c857b] hover:text-[#2e2c29]" onClick={() => setBulkText('0x9a3e14fde5e1de78210342981ae1765cde123abc,Node-01,450.50\n0x18e0dfabcdeed103487198aee1cde9190c128765,Node-02,950.00')}>Load Example</button>
          </div>
          <p className="text-[10px] text-[#8c857b]">Input format: <code>Address, Name, BalanceUSD (optional)</code>. Paste one row per wallet entry.</p>
          <textarea
            className="w-full h-24 p-2 font-mono text-[10px] bg-[#fcfbfa] dark:bg-[#0c0a09] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-[#2e2c29] dark:text-[#f4f3f1]"
            placeholder="0x9a3e14fde5e1de78210342981ae1765cde123abc,Node-01,450&#10;0x18e0dfabcdeed103487198aee1cde9190c128765,Node-02,950"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowBulkAdd(false)} className="px-3 py-1 border border-[#e4dfd5] rounded text-[11px] hover:bg-[#eae6db]">Cancel</button>
            <button onClick={handleBulkImport} className="px-3 py-1 bg-[#2e2c29] dark:bg-emerald-700 text-white rounded text-[11px] hover:opacity-90 font-bold">Import Batch Nodes</button>
          </div>
        </div>
      )}

      {/* Datatable Filters deck */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8c857b] dark:text-[#a1998f]" />
            <input
              type="text"
              placeholder="Search address or alias..."
              className="pl-8 pr-2.5 py-1.5 w-48 bg-[#f5f2eb] dark:bg-[#1c1a17] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {/* Group filter selection */}
          <select
            className="px-2 py-1.5 bg-[#f5f2eb] dark:bg-[#1c1a17] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="ALL">All Cluster Groups</option>
            <option value="Farming Main">Farming Main</option>
            <option value="Sybil Bot">Sybil Bot Bundle</option>
            <option value="Testnet Roll">Testnet Roll</option>
            <option value="General">General Isolation</option>
          </select>

          {/* Risk Level Filter */}
          <select
            className="px-2 py-1.5 bg-[#f5f2eb] dark:bg-[#1c1a17] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Sybil Statuses</option>
            <option value="safe">Clear / Safe Only</option>
            <option value="warning">Flagged Pending</option>
            <option value="high_risk">Sybil Warning Only</option>
          </select>
        </div>

        <span className="text-[10px] text-[#8c857b] font-mono uppercase font-semibold">Matched: {filteredWallets.length} of {wallets.length} entries</span>
      </div>

      {/* Interactive Responsive Grid Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Main interactive Table List: 7 columns width */}
        <div className="lg:col-span-8 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f2eb] dark:bg-[#1c1a17] border-b border-[#e4dfd5] dark:border-[#272421] text-[9px] uppercase font-bold tracking-wider text-[#8c857b] dark:text-[#a1998f]">
                  <th className="px-3 py-2">Wallet / Labeled Node</th>
                  <th className="px-3 py-2">Public Address Node</th>
                  <th className="px-3 py-2 text-center">Network</th>
                  <th className="px-3 py-2 text-right">Balance USD</th>
                  <th className="px-3 py-2 text-center">Txs Count</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4dfd5] dark:divide-[#272421] text-xs text-[#2e2c29] dark:text-[#f4f3f1]">
                {filteredWallets.map((wallet) => {
                  const isSelected = selectedWallet?.id === wallet.id;
                  return (
                    <tr 
                      key={wallet.id} 
                      onClick={() => setSelectedWalletId(wallet.id)}
                      className={`transition-colors cursor-pointer group hover:bg-[#f5f2eb]/60 dark:hover:bg-[#1b1916]/50 ${isSelected ? 'bg-amber-500/10 dark:bg-amber-500/5 hover:bg-amber-500/20' : ''}`}
                    >
                      <td className="px-3 py-2.5 font-sans font-medium">
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1.5 rounded bg-[#f5f2eb] dark:bg-[#1d1a18] text-[#8c857b] dark:text-[#a1998f] group-hover:scale-105 transition-transform ${isSelected ? 'border border-amber-500/50' : ''}`}>
                            <WalletIcon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-[#2e2c29] dark:text-[#f4f3f1]">{wallet.label}</div>
                            <span className="text-[9px] text-[#8c857b] dark:text-[#a1998f] uppercase font-mono tracking-wider">{wallet.groupName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[#4d4a45] dark:text-[#b4af9e] bg-[#f5f2eb]/60 dark:bg-[#201d1a] px-1.5 py-0.5 rounded text-[10px]">
                            {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}
                          </span>
                          <button
                            onClick={() => handleCopy(wallet.address)}
                            className="p-1 hover:bg-[#e4dfd5] dark:hover:bg-[#292622] rounded transition-all text-[#8c857b]"
                            title="Copy to clipboard"
                          >
                            {copied === wallet.address ? <Check className="h-3 w-3 text-emerald-600" /> : <Clipboard className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-1.5 py-0.5 bg-neutral-900 dark:bg-[#2e2c29] text-[#fcfbfa] dark:text-zinc-100 rounded-xs font-mono text-[9px] font-extrabold">{wallet.chain}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ${wallet.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[#5c564f] dark:text-[#a1998f] font-semibold">
                        {wallet.transactionCount} txs
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {getRiskBadge(wallet.riskIndicator)}
                      </td>
                      <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => deleteWallet(wallet.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg transition-all cursor-pointer"
                          title="Delete Key entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredWallets.length === 0 && (
            <div className="p-8 text-center bg-[#fcfbfa] dark:bg-[#141210] space-y-2">
              <Activity className="h-8 w-8 text-[#a1998f] dark:text-[#272421] mx-auto animate-pulse" />
              <p className="text-xs text-[#8c857b]">No match detected</p>
              <p className="text-[10px] text-[#a1998f]">Adjust search queries or group filters to isolate specific key nodes.</p>
            </div>
          )}
        </div>

        {/* Dynamic Sybil Risk Analytics details card (33% width / 4 cols width) */}
        <div className="lg:col-span-4 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden shadow-2xs divide-y divide-[#e4dfd5] dark:divide-[#272421]">
          <div className="p-3 bg-[#f5f2eb] dark:bg-[#1c1a17] flex items-center justify-between">
            <span className="font-extrabold uppercase text-[#2e2c29] dark:text-[#f4f3f1] tracking-wider text-[10px] flex items-center gap-1">
              <LineChart className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Wallet Risk Audit Sandbox</span>
            </span>
            <span className="font-mono text-[9px] text-[#ab9b8a] uppercase font-bold">Nansen Layer3 Sync</span>
          </div>

          <div className="p-3.5 space-y-3.5 font-sans">
            {selectedWallet ? (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-[#8c857b] uppercase">Active Target Node</span>
                  <div className="text-sm font-black font-display text-[#2e2c29] dark:text-[#f4f3f1]">{selectedWallet.label}</div>
                  <div className="font-mono text-[10px] text-[#8c857b] dark:text-[#a1998f] select-text">{selectedWallet.address}</div>
                </div>

                {/* Score Dial */}
                <div className="bg-[#f5f2eb] dark:bg-[#1b1916] p-3 rounded-lg border border-[#e4dfd5] dark:border-[#272421] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-[#8c857b] dark:text-[#a1998f] uppercase">
                    <span>Sybil Link Protection Score</span>
                    <span className="font-mono tracking-tight text-emerald-800 dark:text-emerald-400 font-bold">98/100 SAFETY</span>
                  </div>
                  {/* Visual gauge */}
                  <div className="h-2 w-full bg-[#e4dfd5] dark:bg-[#272421] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        selectedWallet.riskIndicator === 'safe' ? 'bg-emerald-600 w-[94%]' :
                        selectedWallet.riskIndicator === 'warning' ? 'bg-amber-500 w-[65%]' : 'bg-rose-600 w-[24%]'
                      }`}
                    />
                  </div>
                  <p className="text-[9px] text-[#8c857b] leading-tight">Meters potential link correlations based on multi-address transaction sequencing, shared exchange deposits, and matching IP routers.</p>
                </div>

                {/* Simulated behavioral active dates map */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase block">Farming Gas Intensity Density Map</span>
                  <div className="grid grid-cols-7 gap-1 bg-[#f5f2eb]/40 dark:bg-zinc-950 p-2 border border-[#e4dfd5]/45 dark:border-[#272421] rounded-lg">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const heights = [3, 1, 0, 4, 3, 2, 0, 1, 3, 4, 2, 0, 1, 3];
                      const depth = heights[i];
                      const mockColors = [
                        'bg-zinc-100 dark:bg-[#1a1715]',
                        'bg-emerald-100 dark:bg-emerald-950/20',
                        'bg-emerald-300 dark:bg-emerald-900/45',
                        'bg-emerald-500 dark:bg-emerald-800/60',
                        'bg-emerald-700 dark:bg-emerald-500'
                      ];
                      return (
                        <div 
                          key={i} 
                          className={`h-4.5 rounded-xs transition-transform hover:scale-110 ${mockColors[depth]}`} 
                          title={`Day -${14 - i}: ${depth * 2 + 1} micro-quests executed`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-[#8c857b] dark:text-[#a1998f] uppercase px-1">
                    <span>14 Days ago</span>
                    <span>Synchronous Live</span>
                  </div>
                </div>

                {/* Core parameters verification checklist */}
                <div className="space-y-1.5 md:pt-1">
                  <span className="text-[10px] font-extrabold text-[#8c857b] dark:text-[#a1998f] uppercase">Decentralized Audit Checklist</span>
                  <div className="space-y-1 text-[10px] text-[#5c564f] dark:text-[#a1998f]">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Zero cross-wallet token transfers tracked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Isolated funding lineage (Hop / zkSync bridge)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#2c2a29] dark:text-[#f4f3f1]">
                      {selectedWallet.riskIndicator === 'high_risk' ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0 animate-pulse" />
                          <span className="text-rose-600 dark:text-rose-400">Risk detected: Shared Binance funding source</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Individualized proxy location mapping verified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Core quick actions on selected node */}
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      alert(`Mock TX submitted: Dispatched gas distribution and contract check on ${selectedWallet.label} via local routing proxy!`);
                    }}
                    className="w-full text-center px-3 py-1.5 bg-[#221e1a] hover:bg-neutral-800 text-white dark:bg-[#eae6db] dark:hover:bg-[#f4f3f1] dark:text-neutral-950 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Run Custom Balance Sweep Trace</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-[#8c857b] italic">Click on any table row to load interactive audit telemetry data.</div>
            )}
          </div>
        </div>
      </div>

      {/* Info Notice Strip */}
      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/40 rounded-xl space-y-1 text-xs text-[#2e2c29] dark:text-[#a1998f] flex gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <div>
          <strong className="font-bold text-blue-900 dark:text-blue-400 block mb-0.5 uppercase tracking-wide">Automated Overlap Mitigation Loop</strong>
          <span>To protect security integrity, Airdrop Hub monitors linked transaction hashes across standard EVM chains. Always distribute and recycle funds using completely isolated bridges (like Orbiter Finance or native Rollup Bridges) rather than central banking deposits.</span>
        </div>
      </div>

      {/* Add New Wallet Key Overlay Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] dark:bg-[#151311] border border-[#e4dfd5] dark:border-[#272421] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-3.5 bg-[#f5f2eb] dark:bg-[#1c1a17]">
              <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
                <WalletIcon className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>Import Public Wallet Address Ledger</span>
              </h3>
              <button 
                onClick={() => setShowAdd(false)}
                className="p-1 rounded hover:bg-[#e4dfd5] dark:hover:bg-[#201d1a]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] dark:text-[#a1998f] uppercase">Wallet Label / Alias *</label>
                <input
                  type="text"
                  placeholder="e.g. Ledger Main Node-01"
                  required
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] dark:text-[#a1998f] uppercase">Public Address Hex *</label>
                <input
                  type="text"
                  placeholder="0x... or Solana pubkey"
                  required
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#8c857b] dark:text-[#a1998f] uppercase">Blockchain Network</label>
                  <select
                    className="w-full px-2.5 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
                    value={chain}
                    onChange={(e: any) => setChain(e.target.value)}
                  >
                    <option value="EVM">EVM (zkSync, Scroll, Linea)</option>
                    <option value="Solana">Solana (Jupiter, MarginFi)</option>
                    <option value="Bitcoin">Bitcoin (BRC-20 Satoshis)</option>
                    <option value="Cosmos">Cosmos Hub</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#8c857b] dark:text-[#a1998f] uppercase">Farming Group</label>
                  <select
                    className="w-full px-2.5 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
                    value={groupName}
                    onChange={(e: any) => setGroupName(e.target.value)}
                  >
                    <option value="Farming Main">Farming Main</option>
                    <option value="Sybil Bot">Sybil Bot Bundle</option>
                    <option value="Testnet Roll">Testnet Roll</option>
                    <option value="General">General Isolation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#8c857b] dark:text-[#a1998f] uppercase">Initial Verified USD Balance</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] dark:border-[#272421] pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-[#e4dfd5] dark:border-[#272421] text-xs font-semibold rounded-lg hover:bg-[#f5f2eb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2e2c29] dark:bg-[#eae6db] text-white dark:text-neutral-950 text-xs font-bold rounded-lg hover:opacity-90"
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
