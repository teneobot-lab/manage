import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/db';
import { User, Wallet, Campaign, Task, TaskSubmission, SocialAccount, ProxyItem } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header according to gemini-api guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Gemini SDK client:', error);
  }
}

// Global Middleware to simulate JWT authentication
function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Return admin user by default for frictionless developer preview
    return db.getUsers()[0] || null;
  }
  const token = authHeader.replace('Bearer ', '');
  if (token === 'revoked-token') return null;
  
  // Find or default to administrative user
  return db.getUsers().find(u => u.id === 'usr-admin') || null;
}

// ---------------- API ENDPOINTS -----------------

// Gas Fee Oracle
app.get('/api/gas-tracker', (req, res) => {
  res.json({
    ethereum: Math.floor(Math.random() * 8) + 12, // 12-20 Gwei
    arbitrum: 0.1,
    linea: Math.floor(Math.random() * 3) + 4,
    solana: 0.00005,
    lastUpdated: new Date().toISOString()
  });
});

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  // Find or create user
  let user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Scaffold automatic registration to make testing frictionless!
    const username = email.split('@')[0];
    user = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      username,
      email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=100&h=100&fit=crop&crop=faces`,
      role: 'member',
      is2FAEnabled: false,
      emailVerified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.addUser(user);
  }

  if (user.status === 'suspended') {
    res.status(403).json({ error: 'Account has been suspended' });
    return;
  }

  // Generate mock session
  const sessionId = 'sess-' + Math.random().toString(36).substring(2, 9);
  db.addActivityLog({
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    userId: user.id,
    userEmail: user.email,
    action: 'User Login',
    details: 'Authenticated successfully through browser client',
    ip: req.ip || '127.0.0.1',
    device: req.headers['user-agent'] || 'Unknown Platform',
    createdAt: new Date().toISOString()
  });

  res.json({
    user,
    token: `mock-jwt-token-for-${user.id}`,
    refreshToken: `mock-refresh-token-for-${user.id}`
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email) {
    res.status(400).json({ error: 'Username and Email are required' });
    return;
  }

  const existing = db.getUsers().find(u => u.email === email || u.username === username);
  if (existing) {
    res.status(400).json({ error: 'Email or Username already exists' });
    return;
  }

  const user: User = {
    id: 'usr-' + Math.random().toString(36).substring(2, 9),
    username,
    email,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    role: 'member',
    is2FAEnabled: false,
    emailVerified: false,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.addUser(user);

  res.json({
    success: true,
    user,
    token: `mock-jwt-token-for-${user.id}`
  });
});

// User Session Information
app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({ user });
});

app.post('/api/auth/toggle-2fa', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const current = user.is2FAEnabled;
  db.updateUser(user.id, { is2FAEnabled: !current });
  res.json({ success: true, is2FAEnabled: !current });
});

// Admin Account Suspend/Activate
app.post('/api/admin/suspend-user', (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== 'admin') {
    res.status(403).json({ error: 'Requires admin permission level' });
    return;
  }
  const { userId, status } = req.body;
  db.updateUser(userId, { status });
  res.json({ success: true, status });
});

// Campaign Endpoints
app.get('/api/campaigns', (req, res) => {
  res.json(db.getCampaigns());
});

app.post('/api/campaigns', (req, res) => {
  const { name, difficulty, category, priority, rewardEstimation, deadline, notesString, tags, targetUrl } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Campaign name is required' });
    return;
  }
  const newCampaign: Campaign = {
    id: 'c-' + Math.random().toString(36).substring(2, 9),
    name,
    difficulty: difficulty || 'medium',
    category: category || 'L2',
    priority: priority || 'medium',
    status: 'active',
    rewardEstimation: Number(rewardEstimation) || 0,
    completedTasksCount: 0,
    totalTasksCount: 0,
    tags: Array.isArray(tags) ? tags : ['General'],
    deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notesString: notesString || '',
    participants: Math.floor(Math.random() * 200) + 10,
    targetUrl: targetUrl || ''
  };
  db.addCampaign(newCampaign);
  res.status(210).json(newCampaign);
});

app.put('/api/campaigns/:id', (req, res) => {
  const id = req.params.id;
  db.updateCampaign(id, req.body);
  const updated = db.getCampaigns().find(c => c.id === id);
  res.json(updated);
});

app.delete('/api/campaigns/:id', (req, res) => {
  db.deleteCampaign(req.params.id);
  res.json({ success: true });
});

// Wallet Endpoints
app.get('/api/wallets', (req, res) => {
  res.json(db.getWallets());
});

app.post('/api/wallets', (req, res) => {
  const { address, label, chain, groupName, balanceUsd } = req.body;
  if (!address || !label) {
    res.status(400).json({ error: 'Address and Label are required' });
    return;
  }
  const newWallet: Wallet = {
    id: 'w-' + Math.random().toString(36).substring(2, 9),
    address,
    label,
    chain: chain || 'EVM',
    groupName: groupName || 'General',
    balanceUsd: Number(balanceUsd) || 0,
    riskIndicator: 'safe',
    transactionCount: 0
  };
  db.addWallet(newWallet);
  res.json(newWallet);
});

app.put('/api/wallets/:id', (req, res) => {
  const id = req.params.id;
  db.updateWallet(id, req.body);
  res.json(db.getWallets().find(w => w.id === id));
});

app.delete('/api/wallets/:id', (req, res) => {
  db.deleteWallet(req.params.id);
  res.json({ success: true });
});

// Task Endpoints
app.get('/api/tasks', (req, res) => {
  res.json(db.getTasks());
});

app.post('/api/tasks', (req, res) => {
  const { campaignId, name, priorityScore, isRecurring, recurIntervalDays, dueReminderDate, manualVerification, automationReady, checklist, aiTips, targetUrl } = req.body;
  if (!campaignId || !name) {
    res.status(400).json({ error: 'campaignId and name is required' });
    return;
  }
  const newTask: Task = {
    id: 't-' + Math.random().toString(36).substring(2, 9),
    campaignId,
    name,
    dependencyId: null,
    isRecurring: !!isRecurring,
    recurIntervalDays: Number(recurIntervalDays) || 1,
    priorityScore: Number(priorityScore) || 50,
    dueReminderDate: dueReminderDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    automationReady: !!automationReady,
    manualVerification: !!manualVerification,
    aiTips: aiTips || 'Run multiple checks on relevant social media accounts before verifying transaction signatures.',
    checklist: Array.isArray(checklist) ? checklist : ['Follow on Twitter', 'Check status update'],
    targetUrl: targetUrl || ''
  };
  db.addTask(newTask);

  // Update total tasks count in Campaign
  const campaign = db.getCampaigns().find(c => c.id === campaignId);
  if (campaign) {
    db.updateCampaign(campaignId, { totalTasksCount: campaign.totalTasksCount + 1 });
  }

  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.updateTask(id, req.body);
  res.json(db.getTasks().find(t => t.id === id));
});

app.delete('/api/tasks/:id', (req, res) => {
  const task = db.getTasks().find(t => t.id === req.params.id);
  if (task) {
    const campaign = db.getCampaigns().find(c => c.id === task.campaignId);
    if (campaign) {
      db.updateCampaign(task.campaignId, { 
        totalTasksCount: Math.max(0, campaign.totalTasksCount - 1),
        completedTasksCount: Math.max(0, campaign.completedTasksCount - 1)
      });
    }
  }
  db.deleteTask(req.params.id);
  res.json({ success: true });
});

// AI Tip Generation utilizing modern server-side `@google/genai`
app.post('/api/gemini/generate-tips', async (req, res) => {
  const { campaignName, taskName } = req.body;
  if (!campaignName || !taskName) {
    res.status(400).json({ error: 'campaignName and taskName parameters are required.' });
    return;
  }

  // Fallback offline tip index
  const fallbackTips = [
    `Always verify the official contract address on Discord. Sybils can split funds into random $5 amounts on Berachain.`,
    `Execute at least 3 distinct daily interactions on Testnet. Gas is free, but volume counts towards loyalty tiers.`,
    `Do not execute swaps within the same block on multiple linked wallets to bypass sybil clustering filters.`,
    `Keep gas speed to slow/standard on Linea mainnet voyages to cut your transacting fees by up to 45%!`
  ];
  const chosenFallback = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];

  if (!ai) {
    // Elegant fallback configuration
    res.json({
      tips: `[⚡ AI Offline Mode] Monad / Linea Strategic Insight:\n- ${chosenFallback}\n- Ensure wallets are aged > 2 weeks.\n- Keep random balance differences of 10-15% across target accounts.`
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Provide 3 sharp, short, expert Web3 airdrop guidelines or tips for the task: "${taskName}" inside the campaign: "${campaignName}". Do not use markdown titles. List direct bullet points focusing on evading sybil detection, optimizing gas, or automated speedrun rules. Keep response under 100 words.`,
    });

    if (response && response.text) {
      res.json({ tips: response.text });
    } else {
      res.json({ tips: `- Always review task requirements.\n- Maintain safe intervals between linked wallets.\n- Gas values under 15 Gwei.` });
    }
  } catch (error) {
    console.error('Error querying gemini API:', error);
    res.json({ tips: `- [Simulate Tip] Always alternate wallets to hide cluster patterns.\n- Use custom gas optimization on multi-chain pools.` });
  }
});

// Task Submissions
app.post('/api/submissions', (req, res) => {
  const { taskId, walletId, proofScreenshot, comment } = req.body;
  const newSubmission: TaskSubmission = {
    id: 'ts-' + Math.random().toString(36).substring(2, 9),
    taskId,
    walletId,
    status: 'submitted',
    proofScreenshot: proofScreenshot || null,
    comment: comment || 'Manual confirmation run',
    submittedAt: new Date().toISOString()
  };
  db.addSubmission(newSubmission);

  // Update Campaign Progress
  const task = db.getTasks().find(t => t.id === taskId);
  if (task) {
    const campaign = db.getCampaigns().find(c => c.id === task.campaignId);
    if (campaign && campaign.completedTasksCount < campaign.totalTasksCount) {
      db.updateCampaign(campaign.id, { completedTasksCount: campaign.completedTasksCount + 1 });
    }
  }

  res.json(newSubmission);
});

// Manage Social Accounts
app.get('/api/socials', (req, res) => {
  res.json(db.getSocials());
});

app.post('/api/socials', (req, res) => {
  const { type, handle, email, proxyUsed, walletIdBind } = req.body;
  const newSocial: SocialAccount = {
    id: 's-' + Math.random().toString(36).substring(2, 9),
    type,
    handle,
    email,
    proxyUsed: proxyUsed || '',
    status: 'active',
    walletIdBind: walletIdBind || null
  };
  db.addSocial(newSocial);
  res.json(newSocial);
});

app.delete('/api/socials/:id', (req, res) => {
  db.deleteSocial(req.params.id);
  res.json({ success: true });
});

// Proxy Endpoints
app.get('/api/proxies', (req, res) => {
  res.json(db.getProxies());
});

app.post('/api/proxies', (req, res) => {
  const { ip, port, username, label } = req.body;
  if (!ip || !port) {
    res.status(400).json({ error: 'IP and Port are required' });
    return;
  }
  const newProxy: ProxyItem = {
    id: 'p-' + Math.random().toString(36).substring(2, 9),
    ip,
    port: Number(port),
    username: username || 'premium_farm',
    status: 'active',
    responseMs: Math.floor(Math.random() * 80) + 80,
    label: label || 'Mobile LTE'
  };
  db.addProxy(newProxy);
  res.json(newProxy);
});

app.post('/api/proxies/:id/ping', (req, res) => {
  const id = req.params.id;
  const mockPing = Math.floor(Math.random() * 120) + 70;
  const statusOptions: ('active' | 'slow')[] = ['active', 'slow'];
  const newStatus = mockPing > 150 ? 'slow' : 'active';
  db.updateProxy(id, { responseMs: mockPing, status: newStatus });
  res.json({ success: true, responseMs: mockPing, status: newStatus });
});

app.delete('/api/proxies/:id', (req, res) => {
  db.deleteProxy(req.params.id);
  res.json({ success: true });
});

// Claim Rewards / Simulation Logs
app.get('/api/rewards', (req, res) => {
  res.json(db.getRewards());
});

app.post('/api/rewards', (req, res) => {
  const { campaignId, walletId, amount, tokenSymbol, usdValue } = req.body;
  const campaign = db.getCampaigns().find(c => c.id === campaignId);
  const wallet = db.getWallets().find(w => w.id === walletId);
  const newReward = {
    id: 'r-' + Math.random().toString(36).substring(2, 9),
    campaignId,
    campaignName: campaign ? campaign.name : 'Unknown Airdrop',
    walletId,
    walletLabel: wallet ? wallet.label : 'Farming Wallet',
    amount: Number(amount) || 120,
    tokenSymbol: tokenSymbol || 'DROP',
    usdValue: Number(usdValue) || 150,
    dateReceived: new Date().toISOString()
  };
  db.addReward(newReward);
  res.json(newReward);
});

// Notifications Endpoints
app.get('/api/notifications', (req, res) => {
  res.json(db.getNotifications());
});

app.post('/api/notifications/read', (req, res) => {
  db.markNotificationsAsRead();
  res.json({ success: true });
});

app.delete('/api/notifications', (req, res) => {
  db.clearNotifications();
  res.json({ success: true });
});

// Team Workspaces Endpoints
app.get('/api/teams', (req, res) => {
  res.json(db.getTeamWorkspaces());
});

app.post('/api/teams/invite', (req, res) => {
  const { name, email, role } = req.body;
  const defaultWorkspace = db.getTeamWorkspaces()[0];
  if (defaultWorkspace) {
    const newMember = {
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      userId: 'usr-' + Math.random().toString(36).substring(2, 9),
      username: email.split('@')[0],
      email: email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=100&h=100&fit=crop&crop=faces`,
      roleInTeam: role || 'contributor'
    };
    const updatedMembers = [...defaultWorkspace.members, newMember];
    db.updateTeamWorkspace(defaultWorkspace.id, { members: updatedMembers });
    res.json(defaultWorkspace);
    return;
  }
  res.status(404).json({ error: 'No workspace found to add invite to.' });
});

// API keys and Settings
app.get('/api/apikeys', (req, res) => {
  res.json(db.getAPIKeys());
});

app.post('/api/apikeys', (req, res) => {
  const { label } = req.body;
  const newKey = {
    id: 'k-' + Math.random().toString(36).substring(2, 9),
    label: label || 'Automation Bot Key',
    keyPrefix: 'air_live_' + Math.random().toString(36).substring(2, 7) + 'a',
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    status: 'active' as const
  };
  db.addAPIKey(newKey);
  res.json(newKey);
});

app.put('/api/apikeys/:id', (req, res) => {
  const id = req.params.id;
  db.updateAPIKey(id, req.body);
  res.json(db.getAPIKeys().find(k => k.id === id));
});

// App settings endpoints
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req, res) => {
  const { settings } = req.body;
  if (typeof settings === 'object') {
    Object.keys(settings).forEach(key => {
      db.updateSetting(key, String(settings[key]));
    });
  }
  res.json({ success: true });
});

// Realtime Stream of Bot log outputs (SSE Protocol)
app.get('/api/live/logs', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const timer = setInterval(() => {
    const logs = [
      { bot: 'MonadBot-01', action: 'Claiming faucet BERA', level: 'info' },
      { bot: 'SybMaster-02', action: 'Arbitrage transaction detected', level: 'success' },
      { bot: 'ScrollChecker', action: 'Updated canvas profiles', level: 'info' },
      { bot: 'LineaDEXRunner', action: 'Wrapped 0.2 ETH to target contracts', level: 'success' },
      { bot: 'GlobalAirdropWatcher', action: 'Scan fee levels on line-2 network: standard', level: 'info' }
    ];
    const log = logs[Math.floor(Math.random() * logs.length)];
    sendEvent({
      ...log,
      timestamp: new Date().toISOString()
    });
  }, 4000);

  req.on('close', () => {
    clearInterval(timer);
  });
});

// Global Activity logs
app.get('/api/activity-logs', (req, res) => {
  res.json(db.getActivityLogs());
});

// ---------------- VITE MIDDLEWARE INTERACTION -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend files on production builds
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Airdrop Manager Backend] Running on http://localhost:${PORT}`);
  });
}

startServer();
