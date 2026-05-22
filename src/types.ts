export type UserRole = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: UserRole;
  is2FAEnabled: boolean;
  emailVerified: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface DeviceSession {
  id: string;
  userId: string;
  ip: string;
  deviceName: string;
  location: string;
  platform: string;
  lastActive: string;
}

export interface Campaign {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'L1' | 'L2' | 'DeFi' | 'DePIN' | 'GameFi' | 'AI';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'missed' | 'pending';
  rewardEstimation: number;
  completedTasksCount: number;
  totalTasksCount: number;
  tags: string[];
  deadline: string;
  notesString: string;
  participants: number;
  targetUrl?: string;
}

export interface Wallet {
  id: string;
  address: string;
  label: string;
  chain: 'EVM' | 'Solana' | 'Bitcoin' | 'Cosmos';
  groupName: 'Farming Main' | 'Sybil Bot' | 'Testnet Roll' | 'General';
  balanceUsd: number;
  riskIndicator: 'safe' | 'warning' | 'high_risk';
  transactionCount: number;
}

export interface Task {
  id: string;
  campaignId: string;
  name: string;
  dependencyId: string | null;
  isRecurring: boolean;
  recurIntervalDays: number;
  priorityScore: number;
  dueReminderDate: string;
  automationReady: boolean;
  manualVerification: boolean;
  aiTips: string;
  checklist: string[];
  targetUrl?: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  walletId: string;
  status: 'submitted' | 'approved' | 'rejected';
  proofScreenshot: string | null;
  comment: string;
  submittedAt: string;
}

export interface SocialAccount {
  id: string;
  type: 'twitter' | 'discord' | 'telegram' | 'gmail' | 'github';
  handle: string;
  email: string;
  proxyUsed: string;
  status: 'active' | 'rate-limited' | 'disconnected';
  walletIdBind: string | null;
}

export interface TeamMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  avatar: string;
  roleInTeam: 'owner' | 'contributor' | 'spectator';
}

export interface TeamWorkspace {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  members: TeamMember[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'success' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export interface ProxyItem {
  id: string;
  ip: string;
  port: number;
  username: string;
  status: 'active' | 'banned' | 'slow';
  responseMs: number;
  label: string;
}

export interface RewardLog {
  id: string;
  campaignId: string;
  campaignName: string;
  walletId: string;
  walletLabel: string;
  amount: number;
  tokenSymbol: string;
  usdValue: number;
  dateReceived: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ip: string;
  device: string;
  createdAt: string;
}

export interface APIKey {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string;
  status: 'active' | 'revoked';
}

export interface FarmingSession {
  id: string;
  walletId: string;
  walletLabel: string;
  campaignId: string;
  campaignName: string;
  status: 'farming' | 'idle' | 'ended';
  startTime: string;
  durationMinutes: number;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
}

export interface DashboardStats {
  totalAirdrops: number;
  activeFarming: number;
  estimatedReward: number;
  completedTasks: number;
  pendingVerification: number;
  walletConnected: number;
  roiEstimation: number;
}
