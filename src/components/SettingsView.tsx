import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { 
  Settings, Key, Plus, Trash2, Globe, Send, ShieldAlert, 
  HelpCircle, Check, Loader2, Sparkles, MessageCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsView() {
  const { 
    proxies, apiKeys, settings, addProxy, pingProxy, deleteProxy, 
    addAPIKey, saveSettings, fetchInitialData, density, theme 
  } = useAirdropStore();

  const [loadingPingId, setLoadingPingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states - Proxy
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [label, setLabel] = useState('');

  // Form states - Config
  const [gasLimit, setGasLimit] = useState(settings['GAS_ALERT_LIMIT'] || '18');
  const [tgWebhook, setTgWebhook] = useState(settings['TELEGRAM_ALERT_WEBHOOK'] || 'https://api.telegram.org/bot/alerts');

  // New API key label
  const [newKeyLabel, setNewKeyLabel] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddProxy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip || !port) return;
    await addProxy({
      ip,
      port: Number(port),
      username,
      label: label || 'Custom Proxy'
    });
    setIp('');
    setPort('');
    setUsername('');
    setLabel('');
    triggerToast('Proxy server node deployed down to scheduler network.');
  };

  const handlePing = async (id: string) => {
    setLoadingPingId(id);
    await pingProxy(id);
    setLoadingPingId(null);
    triggerToast('Tunnel sweep ping test compiled successfully.');
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      'GAS_ALERT_LIMIT': gasLimit,
      'TELEGRAM_ALERT_WEBHOOK': tgWebhook
    });
    await fetchInitialData();
    triggerToast('Farming safety margins persisted down to local node database.');
  };

  const handleGenerateKey = async () => {
    if (!newKeyLabel) return;
    await addAPIKey(newKeyLabel);
    setNewKeyLabel('');
    triggerToast(`Created dynamic API access token: ${newKeyLabel}`);
  };

  const gridGap = density === 'compact' ? 'gap-2.5' : 'gap-4';
  const elementPadding = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2.5';

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Toast Alert panel overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-[#2e2c29] dark:bg-zinc-100 border border-[#e4dfd5]/20 dark:border-zinc-800 text-white dark:text-neutral-900 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold"
          >
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 dark:text-emerald-600 shrink-0 animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`grid grid-cols-1 lg:grid-cols-2 ${gridGap}`}>
        {/* Watcher card settings */}
        <form onSubmit={handleSaveConfig} className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-[#8c857b]" />
            <span>Farming Bot Watcher Configuration</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] block uppercase">Network Gas Alert cap (Gwei)</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#110f0e] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
              />
              <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] leading-normal block">Auto claims pause if Ethereum mainnet gas goes higher than this.</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] block uppercase">Telegram Notification Webhook endpoint</label>
              <input
                type="url"
                className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#110f0e] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                value={tgWebhook}
                onChange={(e) => setTgWebhook(e.target.value)}
              />
              <span className="text-[10px] text-[#8c857b] dark:text-[#a1998f] leading-normal block">Endpoint for immediate push notification alerts on target expirations.</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#2e2c29] dark:bg-[#eae6db] text-white dark:text-neutral-900 text-xs font-bold rounded-lg cursor-pointer hover:opacity-90 transition-all font-sans"
            >
              Save Watcher Parameters
            </button>
          </div>
        </form>

        {/* Access tokens Console keys */}
        <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-4 rounded-xl space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
              <Key className="h-4.5 w-4.5 text-[#8c857b]" />
              <span>Daemon Gateway Credentials & Tokens</span>
            </h3>
            <p className="text-[#8c857b] dark:text-[#a1998f] text-[11px] leading-relaxed">Generate unique access keys to hook external desktop scripts with on-chain trackers.</p>
          </div>

          {/* Connected keys */}
          <div className="space-y-2">
            {apiKeys.map(key => (
              <div key={key.id} className="flex justify-between items-center bg-[#f5f2eb]/60 dark:bg-[#191715] border border-[#e4dfd5] dark:border-[#272421] px-3 py-2 rounded-lg font-mono">
                <div>
                  <div className="font-bold text-[#4d4a45] dark:text-[#eae6db] text-xs font-sans">{key.label}</div>
                  <div className="text-[9px] text-[#8c857b] dark:text-[#a1998f]">{key.keyPrefix}*****************</div>
                </div>
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Active</span>
              </div>
            ))}
          </div>

          {/* New access configuration form */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. CLI-Bot-Node-02"
              className="flex-1 px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
            />
            <button
              onClick={handleGenerateKey}
              className="px-3.5 py-1.5 bg-[#2e2c29] dark:bg-[#eae6db] text-white dark:text-neutral-900 font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Token</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proxy Ledger table */}
      <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden shadow-2xs space-y-3">
        <div className="px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17] border-b border-[#e4dfd5] dark:border-[#272421] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Globe className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider">Fingerprint Protection Proxy Servers</span>
          </div>
          <span className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase font-mono">Prevent Sybil link cluster identification flagging</span>
        </div>

        {/* Input cluster */}
        <form onSubmit={handleAddProxy} className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-[#e4dfd5] dark:border-[#272421]">
          <input
            type="text"
            required
            placeholder="Proxy Server IP (e.g. 192.16.2.2)"
            className="px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#110f0e] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Port (e.g. 8080)"
            className="px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#110f0e] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <input
            type="text"
            placeholder="Alias Label"
            className="px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#110f0e] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Proxy Node</span>
          </button>
        </form>

        {/* Table representation list */}
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#e4dfd5] dark:border-[#272421] text-[10px] uppercase text-[#8c857b] dark:text-[#a1998f] font-bold">
                <th className="px-4 py-2">Alias Label</th>
                <th className="px-4 py-2">IP Address & Port</th>
                <th className="px-4 py-2">Credential User</th>
                <th className="px-4 py-2 text-center">Status state</th>
                <th className="px-4 py-2 text-right">Verified Latency</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4dfd5] dark:divide-[#272421] text-[#2e2c29] dark:text-[#f4f3f1] font-medium">
              {proxies.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1b1916]/40 transition-colors">
                  <td className="px-4 py-2.5 font-bold">{p.label}</td>
                  <td className="px-4 py-2.5 font-mono text-[#5c564f] dark:text-[#c4bfb0]">{p.ip}:{p.port}</td>
                  <td className="px-4 py-2.5 font-mono text-[#8c857b] dark:text-[#a1998f]">{p.username || 'System Root'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      p.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200/40' :
                      p.status === 'slow' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200/40' : 
                      'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-200/40'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[#4d4a45] dark:text-[#bcb8ab] font-bold">{p.responseMs} ms</td>
                  <td className="px-4 py-2.5 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handlePing(p.id)}
                      disabled={loadingPingId === p.id}
                      className="px-2.5 py-1 border border-[#e4dfd5] dark:border-[#272421] hover:bg-[#f5f2eb] dark:hover:bg-neutral-800 rounded-md text-[10px] font-bold text-[#5c564f] dark:text-[#a1998f] cursor-pointer"
                    >
                      {loadingPingId === p.id ? 'Loading...' : 'Ping Test'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProxy(p.id)}
                      className="text-rose-600 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 p-1.5 rounded-lg cursor-pointer"
                      title="Remove Proxy Server"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
