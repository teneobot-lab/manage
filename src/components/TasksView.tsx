import React, { useState, useEffect } from 'react';
import { useAirdropStore } from '../store';
import { 
  CheckSquare, Plus, Trash2, ShieldAlert, Sparkles, Clock, 
  HelpCircle, RefreshCw, Zap, Server, ChevronDown, Check, Loader2, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TasksView() {
  const { tasks, campaigns, wallets, addTask, deleteTask, addSubmission, updateTask } = useAirdropStore();
  const [showAdd, setShowAdd] = useState(false);
  const [loadingTipsId, setLoadingTipsId] = useState<string | null>(null);
  const [aiTipsCache, setAiTipsCache] = useState<Record<string, string>>({});
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Selection states for Bulk Actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  // Timer States
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Form inputs
  const [campaignId, setCampaignId] = useState('');
  const [name, setName] = useState('');
  const [priorityScore, setPriorityScore] = useState(80);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurIntervalDays, setRecurIntervalDays] = useState(1);
  const [dueReminderDate, setDueReminderDate] = useState('2026-06-01');
  const [manualVerification, setManualVerification] = useState(false);
  const [automationReady, setAutomationReady] = useState(true);
  const [aiTips, setAiTips] = useState('');
  const [checklistInput, setChecklistInput] = useState('Connect wallet, Swap tokens, Confirm balance');
  const [targetUrl, setTargetUrl] = useState('');

  // Interactive Checklist tracking
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Active wallet trigger for submissions
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState('');

  // Helper helper function to parse and render text with clickable links
  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 underline break-all font-semibold inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
            <ExternalLink className="h-2.5 w-2.5 inline shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimerId && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && activeTimerId) {
      setActiveTimerId(null);
    }
    return () => clearInterval(interval);
  }, [activeTimerId, secondsLeft]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId || !name) return;

    const list = checklistInput.split(',').map(v => v.trim()).filter(Boolean);

    await addTask({
      campaignId,
      name,
      priorityScore: Number(priorityScore),
      isRecurring,
      recurIntervalDays: Number(recurIntervalDays),
      dueReminderDate: new Date(dueReminderDate).toISOString(),
      manualVerification,
      automationReady,
      aiTips: aiTips || 'Double check target transaction confirmation headers.',
      checklist: list.length > 0 ? list : ['Quest signup', 'Bridge proof'],
      targetUrl
    });

    setName('');
    setAiTips('');
    setChecklistInput('');
    setTargetUrl('');
    setShowAdd(false);
  };

  const handleQueryTips = async (task: any) => {
    setLoadingTipsId(task.id);
    const associatedCampaign = campaigns.find(c => c.id === task.campaignId);
    const campaignNameStr = associatedCampaign ? associatedCampaign.name : 'Web3 Airdrop Quests';

    try {
      const res = await fetch('/api/gemini/generate-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: campaignNameStr,
          taskName: task.name
        })
      });

      if (res.ok) {
        const body = await res.json();
        setAiTipsCache(prev => ({ ...prev, [task.id]: body.tips }));
      } else {
        setAiTipsCache(prev => ({ ...prev, [task.id]: 'Check transaction has more than 5 confirmations. Fallback Tip safe.' }));
      }
    } catch (e) {
      console.error(e);
      setAiTipsCache(prev => ({ ...prev, [task.id]: 'Tip load failed. Verify Gemini process env keys setting.' }));
    } finally {
      setLoadingTipsId(null);
    }
  };

  const startTaskTimer = (taskId: string) => {
    setActiveTimerId(taskId);
    setSecondsLeft(30); // 30 seconds task timer
  };

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleConfirmSubmit = async (taskId: string) => {
    if (!selectedWalletId) return;
    await addSubmission({
      taskId,
      walletId: selectedWalletId,
      comment: 'Verification passed securely. Bypassed sybil trace.'
    });
    setSubmittingTaskId(null);
    setSelectedWalletId('');
  };

  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(t => t.id));
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    if (!confirm(`Are you sure you want to delete ${count} task(s)?`)) return;
    
    await Promise.all(selectedTaskIds.map(id => deleteTask(id)));
    setSelectedTaskIds([]);
    setToast({
      message: `Successfully deleted ${count} task(s) with smooth fade-out!`,
      type: 'success'
    });
  };

  const handleBulkMarkVerified = async () => {
    if (selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    
    await Promise.all(selectedTaskIds.map(id => updateTask(id, { manualVerification: true })));
    setSelectedTaskIds([]);
    setToast({
      message: `Successfully updated and verified ${count} task(s) in bulk!`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#8c857b] uppercase tracking-wider">Dynamic Tasks Hub & Worker Schedules</h2>
          <p className="text-xs text-[#a1998f]">Manage checklist completion metrics. Fetch on-chain task tips powered by Gemini 3.5 Flash.</p>
        </div>
        <button
          onClick={() => {
            if (campaigns.length === 0) {
              alert('Please create an active campaign first before adding custom tasks!');
              return;
            }
            setShowAdd(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2e2c29] text-white rounded-lg text-xs font-semibold hover:bg-[#45423f] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Task Agenda</span>
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-8 text-center bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl text-xs text-[#8c857b] space-y-1">
          <p className="font-semibold text-sm">No Campaigns Configured yet</p>
          <p className="text-[#a1998f]">Go to the Campaigns view to initialize on-chain targets, and task trackers will enable here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bulk Actions controls console */}
          {tasks.length > 0 && (
            <div className="bg-[#f5f2eb] border border-[#e4dfd5] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-3xs animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2.5">
                <label className="flex items-center gap-2 font-semibold text-[#2e2c29] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[#d3cbbe] text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Select All Task Items ({tasks.length})</span>
                </label>
                {selectedTaskIds.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {selectedTaskIds.length} Selected
                  </span>
                )}
              </div>

              {selectedTaskIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkMarkVerified}
                    className="px-3 py-1.5 bg-[#2e2c29] hover:bg-[#45423f] text-white rounded-lg text-[11px] font-bold transition-all shadow-3xs flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark Verified</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-3xs flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Bulk Delete</span>
                  </button>
                  <button
                    onClick={() => setSelectedTaskIds([])}
                    className="px-2 py-1.5 border border-[#e4dfd5] hover:bg-[#eae6db] text-[#5c564f] rounded-lg text-[11px] font-semibold transition-all"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Task Lists Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => {
                const campaign = campaigns.find(c => c.id === task.campaignId);
                const activeTip = aiTipsCache[task.id] || task.aiTips;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, y: -15, transition: { duration: 0.22 } }}
                    transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                    key={task.id}
                    className={`bg-[#fcfbfa] border rounded-xl p-4 space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${
                      selectedTaskIds.includes(task.id) ? 'border-emerald-600 ring-1 ring-emerald-600/30 bg-emerald-50/10' : 'border-[#e4dfd5]'
                    }`}
                  >
                  <div className="space-y-2.5">
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => toggleSelectTask(task.id)}
                          className="h-3.5 w-3.5 rounded border-[#d3cbbe] text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Select for bulk actions"
                        />
                        <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                          {campaign ? campaign.name : 'Quest Root'}
                        </span>
                        {task.isRecurring && (
                          <span className="text-[9px] font-semibold text-blue-800 bg-blue-50 px-1 rounded">
                            Every {task.recurIntervalDays}d
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-[#8c857b]">Priority Score: <strong className="font-semibold text-[#2e2c29]">{task.priorityScore}</strong></span>
                      </div>
                    </div>

                  {/* Task Title with Optional Direct Link */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-[#2e2c29] flex-1">{task.name}</h3>
                    {task.targetUrl && (
                      <a
                        href={task.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold transition-all shadow-3xs"
                        title="Buka Link Tugas / Task"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Buka Link</span>
                      </a>
                    )}
                  </div>

                  {/* Checklist Sub-Items */}
                  <div className="bg-[#f5f2eb]/60 rounded-lg p-2.5 space-y-1 md:space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8c857b] block mb-1">Interactive Checklist</span>
                    {task.checklist.map((item, idx) => {
                      const uid = `${task.id}-${idx}`;
                      const isDone = checkedItems[uid];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleCheck(uid)}
                          className="w-full flex items-center gap-2 text-left text-xs py-1 transition-colors hover:bg-black/[0.02]"
                        >
                          <div className={`h-3.5 w-3.5 border rounded flex items-center justify-center cursor-pointer transition-colors ${isDone ? 'bg-emerald-600 border-emerald-600' : 'border-[#d3cbbe]'}`}>
                            {isDone && <Check className="h-2.5 w-2.5 text-white stroke-[3.5]" />}
                          </div>
                          <span className={`flex-1 font-medium select-none ${isDone ? 'line-through text-[#a1998f]' : 'text-[#4d4a45]'}`}>{item}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* AI Generated strategic advice / tip */}
                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-2.5 space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                        <span>Gemini Strategy Insight</span>
                      </div>
                      <button
                        onClick={() => handleQueryTips(task)}
                        disabled={loadingTipsId === task.id}
                        className="flex items-center gap-1 text-[9px] font-semibold text-amber-900 bg-amber-100/50 border border-amber-200 px-2 py-0.5 rounded hover:bg-amber-100 disabled:opacity-50 transition-colors"
                      >
                        {loadingTipsId === task.id ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-2.5 w-2.5" />
                        )}
                        <span>Fetch Live Strategy</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#5c564f] leading-relaxed whitespace-pre-line">
                      {renderTextWithLinks(activeTip)}
                    </p>
                  </div>
                </div>

                {/* Automation Timer & Submit Actions */}
                <div className="border-t border-[#e4dfd5] pt-3 mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8c857b]">
                    {task.automationReady ? (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold text-[10px] uppercase">
                        <Zap className="h-3 w-3" />
                        Bot Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#8c857b] bg-[#f5f2eb] px-1.5 py-0.5 rounded text-[10px] uppercase">
                        <Server className="h-3 w-3" />
                        Manual Check
                      </span>
                    )}
                    
                    {/* Timer component */}
                    {activeTimerId === task.id ? (
                      <span className="font-mono text-rose-600 bg-rose-50 px-1 rounded flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        0:{secondsLeft < 10 ? '0' + secondsLeft : secondsLeft}
                      </span>
                    ) : (
                      <button 
                        onClick={() => startTaskTimer(task.id)}
                        className="text-[10px] text-zinc-600 font-semibold hover:underline"
                      >
                        Start Timer
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 px-1.5 hover:bg-rose-50 rounded text-rose-600 font-semibold text-xs transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSubmittingTaskId(task.id)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <span>Complete Quests</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
    )}

      {/* Task Submissions Dialog overlay */}
      {submittingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl w-full max-w-sm shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] px-4 py-3 bg-[#f5f2eb]">
              <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider">Confirm On-Chain Verification</h3>
              <button 
                onClick={() => setSubmittingTaskId(null)}
                className="p-1 rounded hover:bg-[#e4dfd5]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase">Assign Wallet to Submit Quest</label>
                {wallets.length === 0 ? (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">Specify dynamic wallets in Wallets ledger first before completing tasks!</p>
                ) : (
                  <select
                    className="w-full px-2.5 py-1.5 bg-[#fcfbfa] border border-[#e4dfd5] rounded-lg text-xs"
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                  >
                    <option value="">-- Choose verified active wallet --</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.label} (${w.balanceUsd})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] pt-3">
                <button
                  type="button"
                  onClick={() => setSubmittingTaskId(null)}
                  className="px-4 py-2 border border-[#e4dfd5] text-xs font-semibold rounded-lg hover:bg-[#f5f2eb]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmSubmit(submittingTaskId)}
                  disabled={!selectedWalletId}
                  className="px-4 py-2 bg-emerald-700 text-white disabled:opacity-55 text-xs font-semibold rounded-lg hover:bg-emerald-800"
                >
                  Apply Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Agenda Overlay Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] px-4 py-3.5 bg-[#f5f2eb]">
              <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider">Configure Quest Objective</h3>
              <button 
                onClick={() => setShowAdd(false)}
                className="p-1 rounded hover:bg-[#e4dfd5]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Select Target Campaign *</label>
                <select
                  required
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all cursor-pointer"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                >
                  <option value="">-- Choose Campaign map --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Task Objective Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Stake 10 USDT to Berachain Swap"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Priority Weight (1-100)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] font-mono outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                    value={priorityScore}
                    onChange={(e) => setPriorityScore(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Due Reminder Date</label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] font-mono outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                    value={dueReminderDate}
                    onChange={(e) => setDueReminderDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 py-1.5 px-3 bg-[#f5f2eb]/40 border border-[#e4dfd5] rounded-xl text-xs">
                <label className="flex items-center gap-2 font-semibold text-[#5c564f] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-[#e4dfd5] h-3.5 w-3.5 accent-[#2e2c29]"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <span>Is Recurring</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-[#5c564f] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-[#e4dfd5] h-3.5 w-3.5 accent-[#2e2c29]"
                    checked={automationReady}
                    onChange={(e) => setAutomationReady(e.target.checked)}
                  />
                  <span>Bot Executable</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Sub-Checklist (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Approve token spend, Deposit BERA, Claim receipt"
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Task Target URL / Direct Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://faucet.monad.xyz"
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 bg-white border border-[#e4dfd5] hover:bg-[#f5f2eb] text-[#5c564f] text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2e2c29] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Append Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Action Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-[#2e2c29] border border-[#e4dfd5]/20 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold"
          >
            <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:bg-white/10 rounded-sm p-0.5 text-white/50 hover:text-white transition-colors"
              title="Close notification"
            >
              <Plus className="h-3.5 w-3.5 rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
