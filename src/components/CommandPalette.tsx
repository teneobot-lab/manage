import React, { useEffect, useState, useRef } from 'react';
import { Search, FolderSync, Wallet as WalletIcon, Layers, Settings, Award, Terminal, Users, Sparkles, X } from 'lucide-react';
import { useAirdropStore } from '../store';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette, setTab, campaigns, wallets } = useAirdropStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPalette(!commandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const shortcuts = [
    { name: 'Go to Dashboard', tab: 'dashboard', icon: Layers, shortcut: 'G + D' },
    { name: 'Manage Campaigns', tab: 'campaigns', icon: FolderSync, shortcut: 'G + C' },
    { name: 'Monitor Wallets', tab: 'wallets', icon: WalletIcon, shortcut: 'G + W' },
    { name: 'System Settings', tab: 'settings', icon: Settings, shortcut: 'G + S' },
    { name: 'View Claimed Rewards', tab: 'rewards', icon: Award, shortcut: 'G + R' },
    { name: 'Admin Console Control', tab: 'admin', icon: Terminal, shortcut: 'G + A' }
  ];

  const filteredCampaigns = query 
    ? campaigns.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : campaigns.slice(0, 3);

  const filteredWallets = query 
    ? wallets.filter(w => w.label.toLowerCase().includes(query.toLowerCase()) || w.address.toLowerCase().includes(query.toLowerCase()))
    : wallets.slice(0, 3);

  const handleSelectTab = (tab: string) => {
    setTab(tab);
    setCommandPalette(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search header bar */}
        <div className="flex items-center justify-between border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17]">
          <Search className="h-5 w-5 text-[#8c857b] dark:text-[#a1998f]" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 ml-3 bg-transparent border-0 outline-hidden font-sans text-sm text-[#2e2c29] dark:text-[#f4f3f1] placeholder-[#a1998f]"
            placeholder="Type a command, search wallet label, or campaign..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-sm border border-[#d3cbbe] dark:border-[#38332e] bg-[#fcfbfa] dark:bg-[#141210] text-[10px] font-mono text-[#8c857b] dark:text-[#a1998f] uppercase">esc</kbd>
          <button 
            onClick={() => setCommandPalette(false)}
            className="p-1 ml-2 rounded-sm hover:bg-[#e4dfd5] dark:hover:bg-[#201d12] text-[#8c857b] dark:text-[#a1998f] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3.5 font-sans">
          {/* Shortcuts navigation */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider mb-1">Navigation Commands</div>
            {shortcuts.map((sh, idx) => {
              const IconComp = sh.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectTab(sh.tab)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-[#f5f2eb] dark:hover:bg-[#1b1916] active:bg-[#e4dfd5] dark:text-[#ccd0cf] text-xs text-[#4d4a45] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <IconComp className="h-4 w-4 text-[#8c857b] dark:text-[#a1998f]" />
                    <span className="font-bold">{sh.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a1998f] font-bold">{sh.shortcut}</span>
                </button>
              );
            })}
          </div>

          {/* Clean campaigns search mapping */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider mb-1">Campaign Indexing</div>
            {filteredCampaigns.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#a1998f] italic">No campaigns match criteria...</div>
            ) : (
              filteredCampaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectTab('campaigns')}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-[#f5f2eb] dark:hover:bg-[#1b1916] text-xs text-[#5c564f] dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
                    <span className="truncate font-bold">{c.name}</span>
                  </div>
                  <span className="text-[10px] bg-[#e4dfd5] dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[#5c564f] dark:text-zinc-300 uppercase font-bold">{c.difficulty}</span>
                </button>
              ))
            )}
          </div>

          {/* Searched active wallets listing */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider mb-1">Wallets Indexing</div>
            {filteredWallets.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#a1998f] italic">No wallets found...</div>
            ) : (
              filteredWallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectTab('wallets')}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-[#f5f2eb] dark:hover:bg-[#1b1916] text-xs text-[#4d4a45] dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <WalletIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                    <span className="truncate font-bold">{w.label}</span>
                    <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] font-mono">{w.address.substring(0, 6)}...{w.address.substring(w.address.length - 4)}</span>
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">${w.balanceUsd.toLocaleString()}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Command Palette Footer */}
        <div className="border-t border-[#e4dfd5] dark:border-[#272421] px-4 py-2.5 bg-[#f5f2eb] dark:bg-[#1c1a17] flex items-center justify-between text-[10px] text-[#8c857b] dark:text-[#a1998f] font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Shortcut: type <strong className="text-[#4d4a45] dark:text-[#f4f3f1] font-bold">Ctrl + K</strong> to launch or close</span>
          </div>
          <span className="font-mono font-bold">v1.1.0-alpha</span>
        </div>
      </div>
    </div>
  );
}
