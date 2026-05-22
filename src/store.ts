import { create } from 'zustand';
import { 
  User, Wallet, Campaign, Task, TaskSubmission, SocialAccount, 
  TeamWorkspace, Notification, ProxyItem, RewardLog, ActivityLog, 
  APIKey, AppSetting, DashboardStats 
} from './types';

interface AirdropStore {
  activeTab: string;
  user: User | null;
  token: string | null;
  campaigns: Campaign[];
  wallets: Wallet[];
  tasks: Task[];
  proxies: ProxyItem[];
  notifications: Notification[];
  rewards: RewardLog[];
  activityLogs: ActivityLog[];
  apiKeys: APIKey[];
  settings: Record<string, string>;
  allUsers: User[];
  gasFees: { ethereum: number; arbitrum: number; linea: number; solana: number };
  
  // States
  isLoading: boolean;
  error: string | null;
  commandPaletteOpen: boolean;
  searchQuery: string;
  theme: 'warm' | 'dark';
  density: 'compact' | 'relaxed';

  // Actions
  setTab: (tab: string) => void;
  setUser: (u: User | null, token: string | null) => void;
  setCommandPalette: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  toggleTheme: () => void;
  toggleDensity: () => void;

  // Fetch logic
  fetchInitialData: () => Promise<void>;
  fetchGas: () => Promise<void>;
  
  // Database mutations with automatic API updates
  addWallet: (w: { address: string; label: string; chain: string; groupName: string; balanceUsd: number }) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  
  addCampaign: (c: Partial<Campaign>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  addTask: (t: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addSubmission: (sub: { taskId: string; walletId: string; screenshot?: string; comment?: string }) => Promise<void>;
  addSocial: (s: { type: string; handle: string; email: string; proxyUsed?: string; walletIdBind?: string }) => Promise<void>;
  deleteSocial: (id: string) => Promise<void>;

  addProxy: (p: { ip: string; port: number; username?: string; label?: string }) => Promise<void>;
  pingProxy: (id: string) => Promise<void>;
  deleteProxy: (id: string) => Promise<void>;

  inviteTeamMember: (email: string, role: string) => Promise<void>;
  addAPIKey: (label: string) => Promise<void>;
  saveSettings: (settings: Record<string, string>) => Promise<void>;
  suspendUser: (id: string, state: 'active' | 'suspended') => Promise<void>;
}

export const useAirdropStore = create<AirdropStore>((set, get) => ({
  activeTab: 'dashboard',
  user: null,
  token: null,
  campaigns: [],
  wallets: [],
  tasks: [],
  proxies: [],
  notifications: [],
  rewards: [],
  activityLogs: [],
  apiKeys: [],
  settings: {},
  allUsers: [],
  gasFees: { ethereum: 15, arbitrum: 0.1, linea: 5, solana: 0.00005 },
  isLoading: false,
  error: null,
  commandPaletteOpen: false,
  searchQuery: '',
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as 'warm' | 'dark') || 'warm',
  density: (typeof window !== 'undefined' && localStorage.getItem('density') as 'compact' | 'relaxed') || 'compact',

  setTab: (tab) => set({ activeTab: tab }),
  setUser: (user, token) => set({ user, token }),
  setCommandPalette: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleTheme: () => {
    const next = get().theme === 'warm' ? 'dark' : 'warm';
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: next });
  },
  toggleDensity: () => {
    const next = get().density === 'compact' ? 'relaxed' : 'compact';
    localStorage.setItem('density', next);
    set({ density: next });
  },

  fetchGas: async () => {
    try {
      const r = await fetch('/api/gas-tracker');
      if (r.ok) {
        const data = await r.json();
        set({ gasFees: data });
      }
    } catch (e) {
      console.warn('Error fetching gas tracker data', e);
    }
  },

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const headers: Record<string, string> = {};
      const token = get().token;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Parallel data fetching for instant experience
      const [
        resCampaigns, 
        resWallets, 
        resTasks, 
        resProxies, 
        resNotifications, 
        resRewards, 
        resLogs, 
        resKeys, 
        resSettings
      ] = await Promise.all([
        fetch('/api/campaigns', { headers }),
        fetch('/api/wallets', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/proxies', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/rewards', { headers }),
        fetch('/api/activity-logs', { headers }),
        fetch('/api/apikeys', { headers }),
        fetch('/api/settings', { headers })
      ]);

      set({
        campaigns: resCampaigns.ok ? await resCampaigns.json() : [],
        wallets: resWallets.ok ? await resWallets.json() : [],
        tasks: resTasks.ok ? await resTasks.json() : [],
        proxies: resProxies.ok ? await resProxies.json() : [],
        notifications: resNotifications.ok ? await resNotifications.json() : [],
        rewards: resRewards.ok ? await resRewards.json() : [],
        activityLogs: resLogs.ok ? await resLogs.json() : [],
        apiKeys: resKeys.ok ? await resKeys.json() : [],
        settings: resSettings.ok ? (await resSettings.json()).reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {}) : {}
      });

      // Fetch active mock users for admin panel mock load
      const userRes = await fetch('/api/auth/me', { headers });
      if (userRes.ok) {
        const me = await userRes.json();
        set({ user: me.user });
      }
    } catch (err: any) {
      console.error('Initial load failure', err);
      set({ error: err.message || 'Server connectivity errors.' });
    } finally {
      set({ isLoading: false });
    }
  },

  addWallet: async (w) => {
    try {
      const r = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w)
      });
      if (r.ok) {
        const added = await r.json();
        set({ wallets: [...get().wallets, added] });
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteWallet: async (id) => {
    try {
      const r = await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
      if (r.ok) {
        set({ wallets: get().wallets.filter(w => w.id !== id) });
      }
    } catch (e) {
      console.error(e);
    }
  },

  addCampaign: async (c) => {
    try {
      const r = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
      if (r.ok) {
        const added = await r.json();
        set({ campaigns: [...get().campaigns, added] });
      }
    } catch (e) {
      console.error(e);
    }
  },

  updateCampaign: async (id, updates) => {
    try {
      const r = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (r.ok) {
        const updated = await r.json();
        set({ campaigns: get().campaigns.map(c => c.id === id ? updated : c) });
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteCampaign: async (id) => {
    try {
      const r = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (r.ok) {
        set({ campaigns: get().campaigns.filter(c => c.id !== id) });
      }
    } catch (e) {
      console.error(e);
    }
  },

  addTask: async (t) => {
    try {
      const r = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t)
      });
      if (r.ok) {
        const added = await r.json();
        set({ tasks: [...get().tasks, added] });
        // Refresh campaigns to recalculate totals
        await get().fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  },

  updateTask: async (id, updates) => {
    try {
      const r = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (r.ok) {
        const updated = await r.json();
        set({ tasks: get().tasks.map(t => t.id === id ? updated : t) });
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteTask: async (id) => {
    try {
      const r = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (r.ok) {
        set({ tasks: get().tasks.filter(t => t.id !== id) });
        await get().fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  },

  addSubmission: async (sub) => {
    try {
      const r = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
      if (r.ok) {
        await get().fetchInitialData(); // Reloads progress counters dynamically!
      }
    } catch (e) {
      console.error(e);
    }
  },

  addSocial: async (s) => {
    try {
      const r = await fetch('/api/socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s)
      });
      if (r.ok) {
        await get().fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteSocial: async (id) => {
    try {
      await fetch(`/api/socials/${id}`, { method: 'DELETE' });
      await get().fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  },

  addProxy: async (p) => {
    try {
      const r = await fetch('/api/proxies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      if (r.ok) {
        const added = await r.json();
        set({ proxies: [...get().proxies, added] });
      }
    } catch (e) {
      console.error(e);
    }
  },

  pingProxy: async (id) => {
    try {
      const r = await fetch(`/api/proxies/${id}/ping`, { method: 'POST' });
      if (r.ok) {
        const details = await r.json();
        set({
          proxies: get().proxies.map(p => p.id === id ? { ...p, responseMs: details.responseMs, status: details.status } : p)
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteProxy: async (id) => {
    try {
      const r = await fetch(`/api/proxies/${id}`, { method: 'DELETE' });
      if (r.ok) {
        set({ proxies: get().proxies.filter(p => p.id !== id) });
      }
    } catch (e) {
      console.error(e);
    }
  },

  inviteTeamMember: async (email, role) => {
    try {
      await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      await get().fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  },

  addAPIKey: async (label) => {
    try {
      const r = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label })
      });
      if (r.ok) {
        const added = await r.json();
        set({ apiKeys: [...get().apiKeys, added] });
      }
    } catch (e) {
      console.error(e);
    }
  },

  saveSettings: async (settings) => {
    try {
      const r = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (r.ok) {
        set({ settings });
      }
    } catch (e) {
      console.error(e);
    }
  },

  suspendUser: async (id, state) => {
    try {
      const r = await fetch('/api/admin/suspend-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, status: state })
      });
      if (r.ok) {
        await get().fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  }
}));
