import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { Layers, Sparkles, LogIn, UserPlus, Info } from 'lucide-react';

export default function AuthPage() {
  const { setUser, fetchInitialData } = useAirdropStore();
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
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col items-center justify-center p-6 font-sans text-xs">
      {/* Branding Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 bg-[#fcfbfa] border border-[#e4dfd5] px-3.5 py-1.5 rounded-full shadow-3xs">
          <Layers className="h-4 w-4 text-emerald-800" />
          <span className="font-display font-black text-xs uppercase tracking-widest text-[#2e2c29]">Airdrop Hub</span>
        </div>
        <p className="text-[#8c857b] font-medium text-[11px] max-w-xs leading-relaxed">
          The professional platform to manage multi-chain campaign operations, analyze volume stats, and track tasks.
        </p>
      </div>

      <div className="w-full max-w-sm bg-[#fcfbfa] border border-[#e4dfd5] rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Toggle navigation tab */}
        <div className="flex border-b border-[#e4dfd5] bg-[#f5f2eb]">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3.5 text-center font-bold uppercase tracking-widest text-[10px] transition-all border-r border-[#e4dfd5] ${isLogin ? 'bg-[#fcfbfa] text-[#2e2c29]' : 'text-[#8c857b] hover:bg-[#eae6db]/60 hover:text-[#2e2c29]'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3.5 text-center font-bold uppercase tracking-widest text-[10px] transition-all ${!isLogin ? 'bg-[#fcfbfa] text-[#2e2c29]' : 'text-[#8c857b] hover:bg-[#eae6db]/60 hover:text-[#2e2c29]'}`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl font-medium leading-relaxed">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Alias Username *</label>
              <input
                type="text"
                required
                placeholder="e.g. sybil_master"
                className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl text-xs text-[#2e2c29] placeholder-[#a1998f] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Email Address *</label>
            <input
              type="email"
              required
              className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl text-xs text-[#2e2c29] placeholder-[#a1998f] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
              placeholder="operator@airdrop.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Secure Passphrase *</label>
            <input
              type="password"
              required
              className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl text-xs text-[#2e2c29] placeholder-gray-300 font-mono outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#2e2c29] hover:bg-neutral-800 text-white font-bold uppercase tracking-wider rounded-xl hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span className="text-[10px]">{loading ? 'Verifying...' : isLogin ? 'Access Console' : 'Activate Account'}</span>
          </button>
        </form>

        <div className="border-t border-[#e4dfd5] px-6 py-4 bg-[#f5f2eb]/70 flex items-start gap-3 text-[10px] text-[#8c857b] leading-relaxed font-medium">
          <Info className="h-4 w-4 text-[#8c857b] shrink-0 mt-0.5" />
          <span>Type any email and passphrase to login or register instantly in sandbox mode. No real database registration required.</span>
        </div>
      </div>
    </div>
  );
}
