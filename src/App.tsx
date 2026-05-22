import { useEffect, useState } from 'react';
import { useAirdropStore } from './store';
import AuthPage from './components/AuthPage';
import CommandPalette from './components/CommandPalette';
import DashboardStats from './components/DashboardStats';
import CampaignsView from './components/CampaignsView';
import WalletsView from './components/WalletsView';
import TasksView from './components/TasksView';
import RewardsView from './components/RewardsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import TeamWorkspaceView from './components/TeamWorkspaceView';
import AdminPanel from './components/AdminPanel';

import { 
  Layers, FolderSync, Wallet, CheckSquare, Award, TrendingUp, Users, 
  Settings, Terminal, Bell, Search, LogOut, Menu, X, Sparkles, SlidersHorizontal,
  Sun, Moon, Maximize2, Minimize2, Workflow, Cpu, Eye, EyeOff
} from 'lucide-react';

export default function App() {
  const { 
    user, activeTab, setTab, fetchInitialData, fetchGas, 
    commandPaletteOpen, setCommandPalette, isLoading, notifications, token,
    theme, density, toggleTheme, toggleDensity
  } = useAirdropStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Sync session, theme, and schedules
  useEffect(() => {
    // Initial theme sync
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Authenticate automatically or load from mock token if session is saved
    fetchGas();
    fetchInitialData();

    // Live Gas polling for fintech dashboard vibe
    const gasInterval = setInterval(() => {
      fetchGas();
    }, 15000);

    return () => clearInterval(gasInterval);
  }, [token, theme]);

  if (!user) {
    return <AuthPage />;
  }

  // Define sidebar menu options with icons and levels
  const menuItems = [
    { label: 'Overview', tab: 'dashboard', icon: Layers, roles: ['admin', 'manager', 'member'] },
    { label: 'Campaigns Hub', tab: 'campaigns', icon: FolderSync, roles: ['admin', 'manager', 'member'] },
    { label: 'Wallet Registry', tab: 'wallets', icon: Wallet, roles: ['admin', 'manager', 'member'] },
    { label: 'Work Board', tab: 'tasks', icon: CheckSquare, roles: ['admin', 'manager', 'member'] },
    { label: 'Rewards Tracker', tab: 'rewards', icon: Award, roles: ['admin', 'manager', 'member'] },
    { label: 'Performance Analytics', tab: 'analytics', icon: TrendingUp, roles: ['admin', 'manager', 'member'] },
    { label: 'Team Workspace', tab: 'team', icon: Users, roles: ['admin', 'manager', 'member'] },
    { label: 'Settings & Proxies', tab: 'settings', icon: Settings, roles: ['admin', 'manager', 'member'] },
    { label: 'Admin Console', tab: 'admin', icon: Terminal, roles: ['admin'] }
  ];

  const handleLogout = () => {
    useAirdropStore.getState().setUser(null, null);
  };

  // Render sub-view matching active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-5 animate-in fade-in duration-200">
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CampaignsView />
              <WalletsView />
            </div>
          </div>
        );
      case 'campaigns':
        return <CampaignsView />;
      case 'wallets':
        return <WalletsView />;
      case 'tasks':
        return <TasksView />;
      case 'rewards':
        return <RewardsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'team':
        return <TeamWorkspaceView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <div className="text-xs text-[#8c857b]">Sub-view is compiling...</div>;
    }
  };

  const currentThemeHex = '#f8f6f1'; // Warm white custom color

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-250 bg-[#f8f6f1] dark:bg-[#0c0a09] text-[#2e2c29] dark:text-[#f4f3f1] select-none text-xs leading-normal relative ${density === 'compact' ? 'space-y-0.5' : 'space-y-1'}`}>
      <CommandPalette />

      {/* Top Header navbar */}
      <header className="sticky top-0 z-40 bg-[#fcfbfa]/90 dark:bg-[#141210]/95 backdrop-blur-md border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-[#f5f2eb] dark:hover:bg-[#201d1a] hidden md:block text-[#5c564f] dark:text-[#a1998f] transition-all"
            title="Toggle compact side navigation"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-800 dark:text-emerald-500" />
            <span className="font-display font-black text-sm uppercase tracking-widest text-[#2e2c29] dark:text-[#f4f3f1] select-none">Airdrop Hub</span>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 font-bold px-1.5 py-0.5 rounded font-mono">v1.2.0_ENTERPRISE</span>
          </div>
        </div>

        {/* Action icons controls block */}
        <div className="flex items-center gap-3">
          {/* Quick Command shortcut trigger */}
          <button
            onClick={() => setCommandPalette(true)}
            className="flex items-center gap-2 bg-[#f5f2eb] dark:bg-[#1d1b18] hover:bg-[#e4dfd5]/85 dark:hover:bg-[#2a2723] px-3 py-1.5 rounded-lg border border-[#e4dfd5] dark:border-[#272421] text-xs text-[#5c564f] dark:text-[#a1998f] transition-all cursor-pointer"
            title="Search database actions"
          >
            <Search className="h-4 w-4" />
            <span className="text-[10px] font-sans text-[#5c564f] dark:text-[#a1998f] hidden sm:inline">Search console</span>
            <kbd className="hidden sm:inline-block border border-[#d3cbbe] dark:border-[#3a3733] bg-[#fcfbfa] dark:bg-[#151311] px-1 rounded text-[9px] font-mono">ctrl + k</kbd>
          </button>

          {/* Density Control Toggle */}
          <button
            onClick={toggleDensity}
            className="p-2 rounded-lg bg-[#f5f2eb]/70 dark:bg-[#1d1b18] hover:bg-[#f5f2eb] dark:hover:bg-[#2a2723] border border-[#e4dfd5] dark:border-[#272421] text-[#5c564f] dark:text-[#a1998f] transition-all cursor-pointer"
            title={`Switch to ${density === 'compact' ? 'Relaxed / Spacious' : 'Compact / Hardcore'} layout density`}
          >
            {density === 'compact' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>

          {/* Sun/Moon Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#f5f2eb]/70 dark:bg-[#1d1b18] hover:bg-[#f5f2eb] dark:hover:bg-[#2a2723] border border-[#e4dfd5] dark:border-[#272421] text-[#5c564f] dark:text-[#a1998f] transition-all cursor-pointer"
            title={`Switch to ${theme === 'warm' ? 'Graphite Dark' : 'Warm Studio Light'} theme`}
          >
            {theme === 'warm' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
          </button>

          {/* Alarm Notifications box */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-lg hover:bg-[#f5f2eb] dark:hover:bg-[#201d1a] relative transition-colors text-[#5c564f] dark:text-[#a1998f]"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>

            {/* Notifications Popdown overlay */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2.5 w-72 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-2.5 bg-[#f5f2eb] dark:bg-[#1d1b18] border-b border-[#e4dfd5] dark:border-[#272421] flex items-center justify-between text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">
                  <span>Urgent alerts</span>
                  <button 
                    onClick={() => {
                      useAirdropStore.getState().notifications = [];
                      setShowNotifDropdown(false);
                    }}
                    className="hover:underline hover:text-[#2e2c29] dark:hover:text-[#f4f3f1]"
                  >
                    Clear
                  </button>
                </div>
                <div className="divide-y divide-[#e4dfd5] dark:divide-[#272421] max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-[#f5f2eb]/40 dark:hover:bg-[#1d1b18]/45 text-xs transition-colors space-y-1">
                      <div className="font-bold text-amber-900 dark:text-amber-500">{notif.title}</div>
                      <p className="text-[#5c564f] dark:text-[#a1998f] leading-normal text-[11px]">{notif.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-4 text-center text-[#8c857b] dark:text-[#a1998f] italic text-[11px]">No active notifications logged.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#e4dfd5] dark:bg-[#272421] hidden sm:block"></div>

          {/* User badge */}
          <div className="flex items-center gap-2">
            <img src={user.avatar} alt="Operator Avatar" className="h-7 w-7 rounded-lg object-cover border border-[#e4dfd5] dark:border-[#272421]" />
            <div className="hidden sm:block text-left text-[11px]">
              <div className="font-bold text-[#2e2c29] dark:text-[#f4f3f1] leading-tight">{user.username}</div>
              <div className="text-[9px] text-[#8c857b] dark:text-[#a1998f] font-mono leading-none capitalize">{user.role} role</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-600 dark:text-rose-400 transition-colors"
              title="Terminate workspace session"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Structural Layout (Fluid sidebar + main canvas content block) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar desktop menu */}
        <aside className={`bg-[#fcfbfa] dark:bg-[#141210] border-r border-[#e4dfd5] dark:border-[#272421] hidden md:flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
          <div className="p-3.5 border-b border-[#f5f2eb]/70 dark:border-[#1d1b18]/70 bg-[#f5f2eb]/20 dark:bg-[#1d1b18]/20">
            {!sidebarCollapsed ? (
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#8c857b] dark:text-[#a1998f] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                <span>Console Sections</span>
              </div>
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-amber-500 mx-auto" />
            )}
          </div>

          <nav className="flex-1 p-2 space-y-1">
            {menuItems
              .filter(item => item.roles.includes(user.role))
              .map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setTab(item.tab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#2e2c29] dark:bg-[#f5f2eb] text-[#fcfbfa] dark:text-[#141210] shadow-xs font-bold' 
                        : 'text-[#5c564f] dark:text-[#a1998f] hover:bg-[#f5f2eb] dark:hover:bg-[#201d1a] hover:text-[#2e2c29] dark:hover:text-[#f4f3f1]'
                    }`}
                  >
                    <IconComp className="h-4.5 w-4.5 shrink-0" />
                    {!sidebarCollapsed && <span className="font-semibold text-xs">{item.label}</span>}
                  </button>
                );
              })}
          </nav>

          {/* Quick guide widget in collapsible sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3.5 m-3.5 bg-[#f5f2eb] dark:bg-[#1b1916] border border-[#e4dfd5] dark:border-[#272421] rounded-xl space-y-1">
              <span className="text-[9px] font-extrabold text-[#8c857b] dark:text-[#a1998f] uppercase">Quick Action Tip</span>
              <p className="text-[10px] text-[#5c564f] dark:text-[#a1998f] leading-normal font-sans">
                Type <kbd className="font-bold border border-[#cbc6bb] dark:border-[#3a3733] px-1 rounded bg-[#fcfbfa] dark:bg-[#141210] text-[9px]">ctrl+k</kbd> to execute commands.
              </p>
            </div>
          )}
        </aside>

        {/* Middle Main Scrollable Working Canvas Area */}
        <main className={`flex-1 overflow-y-auto transition-all duration-150 ${density === 'compact' ? 'p-3 md:p-4 space-y-3.5' : 'p-4 md:p-6 space-y-5'}`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600"></span>
              </span>
              <p className="text-xs text-[#8c857b] dark:text-[#a1998f] font-medium font-mono">Querying data ledgers...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </main>
      </div>

      {/* Sticky Bottom Actions navbar for mobile responsiveness (Bottom navigation in mobile) */}
      <footer className="sticky bottom-0 z-40 bg-[#fcfbfa]/95 border-t border-[#e4dfd5] md:hidden px-4 py-2.5 flex items-center justify-around shadow-lg">
        <button 
          onClick={() => setTab('dashboard')} 
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold uppercase ${activeTab === 'dashboard' ? 'text-[#2e2c29]' : 'text-[#8c857b]'}`}
        >
          <Layers className="h-4.5 w-4.5" />
          <span>Overview</span>
        </button>

        <button 
          onClick={() => setTab('campaigns')} 
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold uppercase ${activeTab === 'campaigns' ? 'text-[#2e2c29]' : 'text-[#8c857b]'}`}
        >
          <FolderSync className="h-4.5 w-4.5" />
          <span>Campaigns</span>
        </button>

        <button 
          onClick={() => setTab('wallets')} 
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold uppercase ${activeTab === 'wallets' ? 'text-[#2e2c29]' : 'text-[#8c857b]'}`}
        >
          <Wallet className="h-4.5 w-4.5" />
          <span>Wallets</span>
        </button>

        <button 
          onClick={() => setTab('tasks')} 
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold uppercase ${activeTab === 'tasks' ? 'text-[#2e2c29]' : 'text-[#8c857b]'}`}
        >
          <CheckSquare className="h-4.5 w-4.5" />
          <span>Tasks</span>
        </button>

        <button 
          onClick={() => setTab('settings')} 
          className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold uppercase ${activeTab === 'settings' ? 'text-[#2e2c29]' : 'text-[#8c857b]'}`}
        >
          <Settings className="h-4.5 w-4.5" />
          <span>Proxies</span>
        </button>
      </footer>
    </div>
  );
}
