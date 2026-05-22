import fs from 'fs';
import path from 'path';
import { 
  User, Wallet, Campaign, Task, TaskSubmission, SocialAccount, 
  TeamWorkspace, TeamMember, Notification, ProxyItem, RewardLog, 
  ActivityLog, APIKey, FarmingSession, AppSetting 
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  wallets: Wallet[];
  campaigns: Campaign[];
  tasks: Task[];
  taskSubmissions: TaskSubmission[];
  socialAccounts: SocialAccount[];
  teamWorkspaces: TeamWorkspace[];
  notifications: Notification[];
  proxies: ProxyItem[];
  rewards: RewardLog[];
  activityLogs: ActivityLog[];
  apiKeys: APIKey[];
  farmingSessions: FarmingSession[];
  settings: AppSetting[];
}

// Initial Seed Data
const initialDB: DatabaseSchema = {
  users: [
    {
      id: 'usr-admin',
      username: 'sys_admin',
      email: 'teneobot@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      role: 'admin',
      is2FAEnabled: true,
      emailVerified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-manager',
      username: 'farming_manager',
      email: 'manager@airdrop.io',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      role: 'manager',
      is2FAEnabled: false,
      emailVerified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  wallets: [
    {
      id: 'w-1',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d1476B',
      label: 'Main Farming Ledger',
      chain: 'EVM',
      groupName: 'Farming Main',
      balanceUsd: 14520.45,
      riskIndicator: 'safe',
      transactionCount: 421
    },
    {
      id: 'w-2',
      address: '0x228f2de009699691dd7228f2db6b26ee8211690a',
      label: 'Linea Sybil Master-01',
      chain: 'EVM',
      groupName: 'Sybil Bot',
      balanceUsd: 1850.20,
      riskIndicator: 'warning',
      transactionCount: 188
    },
    {
      id: 'w-3',
      address: '0x996c7db9e18cdefb751b7401b5f6d1476b71c765',
      label: 'Linea Sybil Master-02',
      chain: 'EVM',
      groupName: 'Sybil Bot',
      balanceUsd: 1120.00,
      riskIndicator: 'warning',
      transactionCount: 110
    },
    {
      id: 'w-4',
      address: 'HN7c12658WhX7vNuW4Xf9WqDuHn46bQz5fS9V2B6Wv',
      label: 'Solana Farming Main',
      chain: 'Solana',
      groupName: 'Farming Main',
      balanceUsd: 4890.30,
      riskIndicator: 'safe',
      transactionCount: 295
    },
    {
      id: 'w-5',
      address: '0x32111690add7228f2db6b26ee8211690a1dd7228',
      label: 'Testnet Roll-01',
      chain: 'EVM',
      groupName: 'Testnet Roll',
      balanceUsd: 54.10,
      riskIndicator: 'high_risk',
      transactionCount: 22
    }
  ],
  campaigns: [
    {
      id: 'c-1',
      name: 'Monad Testnet Journey',
      difficulty: 'medium',
      category: 'L1',
      priority: 'high',
      status: 'active',
      rewardEstimation: 4500,
      completedTasksCount: 2,
      totalTasksCount: 4,
      tags: ['Testnet', 'EVMy', 'Ecosystem'],
      deadline: '2026-08-31T00:00:00Z',
      notesString: 'Swap daily, provide liquidity to Monad pools, and complete social crew3 quests.',
      participants: 1240,
      targetUrl: 'https://testnet.monad.xyz'
    },
    {
      id: 'c-2',
      name: 'Linea Park Voyage',
      difficulty: 'hard',
      category: 'L2',
      priority: 'high',
      status: 'active',
      rewardEstimation: 3400,
      completedTasksCount: 4,
      totalTasksCount: 5,
      tags: ['Layer2', 'Mainnet', 'Weekly'],
      deadline: '2026-06-15T00:00:00Z',
      notesString: 'Must complete Proof of Humanity (PoH) prior to doing these advanced gaming tasks.',
      participants: 950,
      targetUrl: 'https://linea.build'
    },
    {
      id: 'c-3',
      name: 'Scroll Canvas Badge Mining',
      difficulty: 'easy',
      category: 'L2',
      priority: 'medium',
      status: 'active',
      rewardEstimation: 1500,
      completedTasksCount: 1,
      totalTasksCount: 3,
      tags: ['ZK-Rollup', 'Canvas', 'Badge'],
      deadline: '2026-10-10T00:00:00Z',
      notesString: 'Mint Canvas profiles and activate secondary contract interaction badges.',
      participants: 610,
      targetUrl: 'https://scroll.io/canvas'
    },
    {
      id: 'c-4',
      name: 'Berachain bArtio Testnet',
      difficulty: 'easy',
      category: 'L1',
      priority: 'high',
      status: 'active',
      rewardEstimation: 2800,
      completedTasksCount: 3,
      totalTasksCount: 3,
      tags: ['Testnet', 'Proof-of-Liquidity'],
      deadline: '2026-07-20T00:00:00Z',
      notesString: 'Faucet BERA daily, swap to HONEY, stake, and lend in BEND protocol.',
      participants: 1500,
      targetUrl: 'https://artio.faucet.berachain.com'
    },
    {
      id: 'c-5',
      name: 'Hyperliquid Trading Farming',
      difficulty: 'hard',
      category: 'DeFi',
      priority: 'high',
      status: 'completed',
      rewardEstimation: 9800,
      completedTasksCount: 3,
      totalTasksCount: 3,
      tags: ['Perp-DEX', 'Points', 'Mainnet'],
      deadline: '2026-05-01T00:00:00Z',
      notesString: 'Completed with high reward output. Airdrop received successfully.',
      participants: 2100,
      targetUrl: 'https://hyperliquid.xyz'
    }
  ],
  tasks: [
    {
      id: 't-1',
      campaignId: 'c-1',
      name: 'Daily Monad swap & wrap/unwrap token',
      dependencyId: null,
      isRecurring: true,
      recurIntervalDays: 1,
      priorityScore: 90,
      dueReminderDate: '2026-05-23T12:00:00Z',
      automationReady: true,
      manualVerification: false,
      aiTips: 'Always keep some MONAD for gas fees. Recommended token wrap/unwrap volume should be above $5.',
      checklist: ['Wrap 1.5 MONAD to WMONAD', 'Unwrap WMONAD back', 'Liquidity add to MONAD-USDC pool'],
      targetUrl: 'https://testnet.monad.xyz'
    },
    {
      id: 't-2',
      campaignId: 'c-1',
      name: 'Complete Guild.xyz Discord Roles binding',
      dependencyId: null,
      isRecurring: false,
      recurIntervalDays: 0,
      priorityScore: 70,
      dueReminderDate: '2026-05-28T00:00:00Z',
      automationReady: false,
      manualVerification: true,
      aiTips: 'Verify you have the "Monad Explorer" role on their official Discord server.',
      checklist: ['Connect Discord to Guild.xyz', 'Pass bot validation', 'Confirm server role update'],
      targetUrl: 'https://guild.xyz'
    },
    {
      id: 't-3',
      campaignId: 'c-2',
      name: 'L2 Diamond Gaming Token Swap & Checkpoint',
      dependencyId: null,
      isRecurring: false,
      recurIntervalDays: 0,
      priorityScore: 85,
      dueReminderDate: '2026-06-03T00:00:00Z',
      automationReady: true,
      manualVerification: false,
      aiTips: 'Verify that gas fees on Linea are below 10 Gwei before executing high-volume contract calls.',
      checklist: ['Mint Test NFT', 'Bridge NFT to secondary rollup layer', 'Register game progress id'],
      targetUrl: 'https://linea.build'
    },
    {
      id: 't-4',
      campaignId: 'c-3',
      name: 'Mint Scroll Canvas Profile Badge',
      dependencyId: null,
      isRecurring: false,
      recurIntervalDays: 0,
      priorityScore: 65,
      dueReminderDate: '2026-06-10T18:00:00Z',
      automationReady: false,
      manualVerification: true,
      aiTips: 'Your wallet must hold at least 0.005 ETH on Scroll to initiate the profile mint.',
      checklist: ['Initiate mint profile', 'Select profile avatar', 'Confirm gas fee and transaction'],
      targetUrl: 'https://scroll.io/canvas'
    }
  ],
  taskSubmissions: [
    {
      id: 'ts-1',
      taskId: 't-1',
      walletId: 'w-1',
      status: 'approved',
      proofScreenshot: null,
      comment: 'Daily swap run completed automatically via terminal worker bot.',
      submittedAt: new Date().toISOString()
    }
  ],
  socialAccounts: [
    {
      id: 's-1',
      type: 'twitter',
      handle: '@AirdropPioneer',
      email: 'pioneer.farm@gmail.com',
      proxyUsed: '192.168.1.104:8000:farm_usr:secretPass',
      status: 'active',
      walletIdBind: 'w-1'
    },
    {
      id: 's-2',
      type: 'discord',
      handle: 'farmer_pro#8891',
      email: 'pioneer.farm@gmail.com',
      proxyUsed: '192.168.1.104:8000:farm_usr:secretPass',
      status: 'active',
      walletIdBind: 'w-1'
    },
    {
      id: 's-3',
      type: 'telegram',
      handle: '@sybil_lord_01',
      email: 'sybil.m01@gmail.com',
      proxyUsed: '103.22.41.4:5512:proxy_bot:botPass',
      status: 'rate-limited',
      walletIdBind: 'w-2'
    },
    {
      id: 's-4',
      type: 'github',
      handle: 'sybil-master-01',
      email: 'syb.git01@proton.me',
      proxyUsed: '103.22.41.4:5512:proxy_bot:botPass',
      status: 'active',
      walletIdBind: 'w-2'
    }
  ],
  teamWorkspaces: [
    {
      id: 'team-1',
      name: 'Alpha Synapse Devs',
      description: 'Main joint-force workspace tracking extreme retro campaigns and Bot schedules.',
      inviteCode: 'ALPHA-9981-JOIN',
      members: [
        {
          id: 'm-1',
          userId: 'usr-admin',
          username: 'sys_admin',
          email: 'teneobot@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          roleInTeam: 'owner'
        },
        {
          id: 'm-2',
          userId: 'usr-manager',
          username: 'farming_manager',
          email: 'manager@airdrop.io',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
          roleInTeam: 'contributor'
        }
      ]
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'usr-admin',
      title: 'Monad Faucet Available',
      message: 'BERA faucet on Berachain can now be claimed again! Run bot sequencer to claim.',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 'notif-2',
      userId: 'usr-admin',
      title: 'Linea Deadline Closing In',
      message: 'Linea park quests close in less than 3 weeks. Complete tasks now to maximize multipliers!',
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false
    }
  ],
  proxies: [
    {
      id: 'p-1',
      ip: '103.111.45.2',
      port: 8080,
      username: 'sybil_user_main',
      status: 'active',
      responseMs: 140,
      label: 'SG Residential Premium'
    },
    {
      id: 'p-2',
      ip: '198.51.100.12',
      port: 9021,
      username: 'proxy_s5_admin',
      status: 'slow',
      responseMs: 512,
      label: 'US Texas Mobile 5G'
    },
    {
      id: 'p-3',
      ip: '45.132.22.4',
      port: 1080,
      username: 'no_auth_pool',
      status: 'banned',
      responseMs: 9991,
      label: 'DE Frankfurt Pool proxy'
    }
  ],
  rewards: [
    {
      id: 'r-1',
      campaignId: 'c-5',
      campaignName: 'Hyperliquid Trading Farming',
      walletId: 'w-1',
      walletLabel: 'Main Farming Ledger',
      amount: 1450,
      tokenSymbol: 'HYPE',
      usdValue: 9800,
      dateReceived: '2026-05-18T10:00:00Z'
    }
  ],
  activityLogs: [
    {
      id: 'act-1',
      userId: 'usr-admin',
      userEmail: 'teneobot@gmail.com',
      action: 'Wallet Imported',
      details: 'Imported new Solana Main Wallet with label: "Solana Farming Main"',
      ip: '127.0.0.1',
      device: 'Chrome - Linux x86_64',
      createdAt: new Date().toISOString()
    }
  ],
  apiKeys: [
    {
      id: 'k-1',
      label: 'Automation Bot Key',
      keyPrefix: 'air_live_3fb9a',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsedAt: new Date().toISOString(),
      status: 'active'
    }
  ],
  farmingSessions: [
    {
      id: 'fs-1',
      walletId: 'w-1',
      walletLabel: 'Main Farming Ledger',
      campaignId: 'c-1',
      campaignName: 'Monad Testnet Journey',
      status: 'farming',
      startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      durationMinutes: 45
    },
    {
      id: 'fs-2',
      walletId: 'w-4',
      walletLabel: 'Solana Farming Main',
      campaignId: 'c-4',
      campaignName: 'Berachain bArtio Testnet',
      status: 'farming',
      startTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      durationMinutes: 120
    }
  ],
  settings: [
    { id: 'set-1', key: 'GAS_ALERT_LIMIT', value: '18' },
    { id: 'set-2', key: 'TELEGRAM_ALERT_WEBHOOK', value: 'https://api.telegram.org/bot68521/alerts' },
    { id: 'set-3', key: 'REALTIME_DASHBOARD_INTERVAL_SEC', value: '5' }
  ]
};

class DBManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
      return initialDB;
    }

    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading JSON DB file, fallback to initialDB', e);
      return initialDB;
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // User Actions
  getUsers() { return this.data.users; }
  addUser(user: User) { this.data.users.push(user); this.save(); }
  updateUser(id: string, updates: Partial<User>) {
    this.data.users = this.data.users.map(u => u.id === id ? { ...u, ...updates } : u);
    this.save();
  }

  // Wallet Actions
  getWallets() { return this.data.wallets; }
  addWallet(w: Wallet) { this.data.wallets.push(w); this.save(); }
  updateWallet(id: string, updates: Partial<Wallet>) {
    this.data.wallets = this.data.wallets.map(w => w.id === id ? { ...w, ...updates } : w);
    this.save();
  }
  deleteWallet(id: string) {
    this.data.wallets = this.data.wallets.filter(w => w.id !== id);
    this.save();
  }

  // Campaign Actions
  getCampaigns() { return this.data.campaigns; }
  addCampaign(c: Campaign) { this.data.campaigns.push(c); this.save(); }
  updateCampaign(id: string, updates: Partial<Campaign>) {
    this.data.campaigns = this.data.campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
    this.save();
  }
  deleteCampaign(id: string) {
    this.data.campaigns = this.data.campaigns.filter(c => c.id !== id);
    this.save();
  }

  // Task Actions
  getTasks() { return this.data.tasks; }
  addTask(t: Task) { this.data.tasks.push(t); this.save(); }
  updateTask(id: string, updates: Partial<Task>) {
    this.data.tasks = this.data.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    this.save();
  }
  deleteTask(id: string) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.save();
  }

  // TaskSubmission Actions
  getSubmissions() { return this.data.taskSubmissions; }
  addSubmission(ts: TaskSubmission) { this.data.taskSubmissions.push(ts); this.save(); }
  updateSubmission(id: string, updates: Partial<TaskSubmission>) {
    this.data.taskSubmissions = this.data.taskSubmissions.map(ts => ts.id === id ? { ...ts, ...updates } : ts);
    this.save();
  }

  // Social Account Actions
  getSocials() { return this.data.socialAccounts; }
  updateSocial(id: string, updates: Partial<SocialAccount>) {
    this.data.socialAccounts = this.data.socialAccounts.map(s => s.id === id ? { ...s, ...updates } : s);
    this.save();
  }
  addSocial(s: SocialAccount) { this.data.socialAccounts.push(s); this.save(); }
  deleteSocial(id: string) {
    this.data.socialAccounts = this.data.socialAccounts.filter(s => s.id !== id);
    this.save();
  }

  // Team Workspaces
  getTeamWorkspaces() { return this.data.teamWorkspaces; }
  addTeamWorkspace(w: TeamWorkspace) { this.data.teamWorkspaces.push(w); this.save(); }
  updateTeamWorkspace(id: string, updates: Partial<TeamWorkspace>) {
    this.data.teamWorkspaces = this.data.teamWorkspaces.map(w => w.id === id ? { ...w, ...updates } : w);
    this.save();
  }

  // Proxies
  getProxies() { return this.data.proxies; }
  addProxy(p: ProxyItem) { this.data.proxies.push(p); this.save(); }
  updateProxy(id: string, updates: Partial<ProxyItem>) {
    this.data.proxies = this.data.proxies.map(p => p.id === id ? { ...p, ...updates } : p);
    this.save();
  }
  deleteProxy(id: string) {
    this.data.proxies = this.data.proxies.filter(p => p.id !== id);
    this.save();
  }

  // Rewards
  getRewards() { return this.data.rewards; }
  addReward(r: RewardLog) { this.data.rewards.push(r); this.save(); }

  // Notifications
  getNotifications() { return this.data.notifications; }
  addNotification(n: Notification) { this.data.notifications.push(n); this.save(); }
  markNotificationsAsRead() {
    this.data.notifications = this.data.notifications.map(n => ({ ...n, read: true }));
    this.save();
  }
  clearNotifications() {
    this.data.notifications = [];
    this.save();
  }

  // APIKeys
  getAPIKeys() { return this.data.apiKeys; }
  addAPIKey(k: APIKey) { this.data.apiKeys.push(k); this.save(); }
  updateAPIKey(id: string, updates: Partial<APIKey>) {
    this.data.apiKeys = this.data.apiKeys.map(k => k.id === id ? { ...k, ...updates } : k);
    this.save();
  }

  // Farming Sessions
  getFarmingSessions() { return this.data.farmingSessions; }
  addFarmingSession(fsObj: FarmingSession) { this.data.farmingSessions.push(fsObj); this.save(); }
  updateFarmingSession(id: string, updates: Partial<FarmingSession>) {
    this.data.farmingSessions = this.data.farmingSessions.map(f => f.id === id ? { ...f, ...updates } : f);
    this.save();
  }

  // Security Audit Logs
  getActivityLogs() { return this.data.activityLogs; }
  addActivityLog(log: ActivityLog) { this.data.activityLogs.unshift(log); this.save(); }

  // App Settings
  getSettings() { return this.data.settings; }
  updateSetting(key: string, value: string) {
    this.data.settings = this.data.settings.map(s => s.key === key ? { ...s, value } : s);
    this.save();
  }
}

export const db = new DBManager();
export default db;
