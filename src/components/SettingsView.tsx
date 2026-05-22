import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { 
  Settings, Key, Plus, Trash2, Globe, Send, ShieldAlert, 
  HelpCircle, Check, Loader2, Sparkles, MessageCircle 
} from 'lucide-react';

export default function SettingsView() {
  const { 
    proxies, apiKeys, settings, addProxy, pingProxy, deleteProxy, 
    addAPIKey, saveSettings, fetchInitialData 
  } = useAirdropStore();

  const [loadingPingId, setLoadingPingId] = useState<string | null>(null);

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
  };

  const handlePing = async (id: string) => {
    setLoadingPingId(id);
    await pingProxy(id);
    setLoadingPingId(null);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      'GAS_ALERT_LIMIT': gasLimit,
      'TELEGRAM_ALERT_WEBHOOK': tgWebhook
    });
    await fetchInitialData();
    alert('Settings saved successfully!');
  };

  const handleGenerateKey = async () => {
    if (!newKeyLabel) return;
    await addAPIKey(newKeyLabel);
    setNewKeyLabel('');
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Alert Gas Limit & Telegram Webhooks configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form onSubmit={handleSaveConfig} className="bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-[#8c857b]" />
            <span>Farming Bot Watcher Configuration</span>
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Ethereum Gas Alert limit (Gwei)</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
              />
              <span className="text-[10px] text-[#a1998f]">Auto claims pause if Ethereum mainnet gas goes higher than this.</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#8c857b] uppercase">Telegram Alert Channel Webhook URL</label>
              <input
                type="url"
                className="w-full px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
                value={tgWebhook}
                onChange={(e) => setTgWebhook(e.target.value)}
              />
              <span className="text-[10px] text-[#a1998f]">Endpoint for immediate push notification alerts on target expirations.</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#2e2c29] text-white text-xs font-semibold rounded-lg hover:bg-[#45423f]"
            >
              Save Alert parameters
            </button>
          </div>
        </form>

        {/* API keys console */}
        <div className="bg-[#fcfbfa] border border-[#e4dfd5] p-4 rounded-xl space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
              <Key className="h-4.5 w-4.5 text-[#8c857b]" />
              <span>API Gateway Credentials & Secrets</span>
            </h3>
            <p className="text-[#8c857b] text-[11px]">Generate unique access keys to hook external desktop scripts with on-chain trackers.</p>
          </div>

          {/* Current API Keys */}
          <div className="space-y-2">
            {apiKeys.map(key => (
              <div key={key.id} className="flex justify-between items-center bg-[#f5f2eb]/60 border border-[#e4dfd5] px-3 py-2 rounded-lg font-mono">
                <div>
                  <div className="font-bold text-[#4d4a45] text-xs font-sans">{key.label}</div>
                  <div className="text-[9px] text-[#8c857b]">{key.keyPrefix}*****************</div>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded uppercase font-semibold">Active</span>
              </div>
            ))}
          </div>

          {/* Create API Key Form */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Scrapy-Bot-02"
              className="flex-1 px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
            />
            <button
              onClick={handleGenerateKey}
              className="px-3.5 py-1.5 bg-[#2e2c29] text-white font-semibold rounded-lg hover:bg-[#45423f] flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Create Access Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proxy Lists & Rotate / Pinger */}
      <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl overflow-hidden shadow-2xs space-y-3">
        <div className="px-4 py-3 bg-[#f5f2eb] border-b border-[#e4dfd5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Globe className="h-4.5 w-4.5 text-emerald-700 font-bold" />
            <span className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider">Fingerprint Protection Proxy Servers</span>
          </div>
          <span className="text-[10px] font-mono text-[#8c857b]">Prevent Multi-wallet Sybil link cluster warnings</span>
        </div>

        {/* Add proxy sub-form */}
        <form onSubmit={handleAddProxy} className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-[#e4dfd5]">
          <input
            type="text"
            required
            placeholder="Proxy Server IP (e.g. 192.16.2.2)"
            className="px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <input
            type="number"
            required
            placeholder="Port (e.g. 8080)"
            className="px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs font-mono"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <input
            type="text"
            placeholder="Alias Label"
            className="px-3 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 flex items-center justify-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Proxy Node</span>
          </button>
        </form>

        {/* Proxy Listing Table */}
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#e4dfd5] text-[10px] uppercase text-[#8c857b] font-semibold">
                <th className="px-4 py-2">Alias Label</th>
                <th className="px-4 py-2">Connection Address</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Ping (Latency)</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4dfd5] text-[#2e2c29]">
              {proxies.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-2.5 font-semibold text-zinc-800">{p.label}</td>
                  <td className="px-4 py-2.5 font-mono text-[#5c564f]">{p.ip}:{p.port}</td>
                  <td className="px-4 py-2.5 font-mono text-[#8c857b]">{p.username || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                      p.status === 'active' ? 'bg-emerald-50 text-emerald-800' :
                      p.status === 'slow' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-700">{p.responseMs} ms</td>
                  <td className="px-4 py-2.5 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handlePing(p.id)}
                      disabled={loadingPingId === p.id}
                      className="px-2 py-0.5 border border-[#e4dfd5] hover:bg-[#f5f2eb] rounded text-[10px] font-semibold text-[#5c564f]"
                    >
                      {loadingPingId === p.id ? 'Pinging...' : 'Ping Test'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProxy(p.id)}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded"
                      title="Remove Proxy"
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
