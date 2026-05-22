import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { Layers, Sparkles, LogIn, UserPlus, Info } from 'lucide-react';

export default function AuthPage() {
  const { setUser, fetchInitialData, theme } = useAirdropStore();
  const [isLogin, setIsLogin] = useState(true);
  
  // Inputs
  const [email, setEmail] = useState('teneobot@gmail.com');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const bodyObj = isLogin ? { email, password } : { email, username, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj)
      });

      if (res.ok) {
        const data = await res.json();
        // Save in global state store
        setUser(data.user, data.token);
        // Load initial records
        await fetchInitialData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Authentication rejected.');
      }
    } catch (e) {
      console.error(e);
      setError('Connection refused. Is Node.js dev server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#0c0a09] text-[#2e2c29] dark:text-[#f4f3f1] flex flex-col items-center justify-center p-6 font-sans text-xs transition-colors duration-200">
      {/* Branding Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] px-3.5 py-1.5 rounded-full shadow-3xs">
          <Layers className="h-4 w-4 text-emerald-800 dark:text-emerald-500" />
          <span className="font-sans font-extrabold text-[#2e2c29] dark:text-[#f4f3f1] text-xs uppercase tracking-widest">Airdrop Manager OS</span>
        </div>
        <p className="text-[#8c857b] dark:text-[#a1998f] font-semibold text-[11px] max-w-xs leading-relaxed">
          The professional platform to manage multi-chain campaign operations, analyze volume stats, and track tasks.
        </p>
      </div>

      <div className="w-full max-w-sm bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Toggle navigation tabs */}
        <div className="flex border-b border-[#e4dfd5] dark:border-[#272421] bg-[#f5f2eb] dark:bg-[#1c1a17]">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3.5 text-center font-extrabold uppercase tracking-widest text-[9px] transition-all border-r border-[#e4dfd5] dark:border-[#272421] ${isLogin ? 'bg-[#fcfbfa] dark:bg-[#141210] text-[#2e2c29] dark:text-[#f4f3f1]' : 'text-[#8c857b] dark:text-[#a1998f] hover:bg-[#eae6db]/60 dark:hover:bg-neutral-800'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3.5 text-center font-extrabold uppercase tracking-widest text-[9px] transition-all ${!isLogin ? 'bg-[#fcfbfa] dark:bg-[#141210] text-[#2e2c29] dark:text-[#f4f3f1]' : 'text-[#8c857b] dark:text-[#a1998f] hover:bg-[#eae6db]/60 dark:hover:bg-neutral-800'}`}
          >
            Register
          </button>
        </div>

        {/* Form elements container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 p-3 rounded-xl font-bold leading-normal">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Alias Username *</label>
              <input
                type="text"
                required
                placeholder="e.g. sybil_master"
                className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden focus:border-[#2e2c29]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Email Address *</label>
            <input
              type="email"
              required
              className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden focus:border-[#2e2c29]"
              placeholder="operator@airdrop.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Secure Passphrase *</label>
            <input
              type="password"
              required
              className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden font-mono"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#2e2c29] dark:bg-[#eae6db] hover:opacity-90 text-white dark:text-neutral-900 font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span className="text-[10px]">{loading ? 'Verifying Node Authenticity...' : isLogin ? 'Access Command Console' : 'Activate Sandbox Account'}</span>
          </button>
        </form>

        <div className="border-t border-[#e4dfd5] dark:border-[#272421] px-6 py-4 bg-[#f5f2eb]/70 dark:bg-[#1c1a17]/50 flex items-start gap-3 text-[10px] text-[#8c857b] dark:text-[#a1998f] leading-relaxed font-bold">
          <Info className="h-4 w-4 text-[#8c857b] dark:text-[#a1998f] shrink-0 mt-0.5" />
          <span>Type any mock credential or faucet keys to register instantly in airdrop management sandbox mode.</span>
        </div>
      </div>
    </div>
  );
}
