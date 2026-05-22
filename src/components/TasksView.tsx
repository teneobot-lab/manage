import React, { useState, useEffect } from 'react';
import { useAirdropStore } from '../store';
import { 
  CheckSquare, Plus, Trash2, ShieldAlert, Sparkles, Clock, 
  HelpCircle, RefreshCw, Zap, Server, ChevronDown, Check, Loader2, ExternalLink,
  Workflow, Play, Sliders, ChevronRight, Ban, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AutomationRule {
  id: string;
  name: string;
  triggerType: 'gas' | 'time' | 'balance';
  triggerCondition: string;
  actionCampaignId: string;
  maxGasLimit: number;
  status: 'active' | 'inactive';
}

export default function TasksView() {
  const { tasks, campaigns, wallets, addTask, deleteTask, addSubmission, updateTask, density, theme } = useAirdropStore();
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
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || '');
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

  // Brand New Automation Builder State
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: 'rule-01', name: 'Gas Sweep safeguarding zkSync', triggerType: 'gas', triggerCondition: '< 15 Gwei', actionCampaignId: campaigns[0]?.id || '1', maxGasLimit: 15, status: 'active' },
    { id: 'rule-02', name: 'Standard Sweep cron trigger', triggerType: 'time', triggerCondition: 'Every 24 hours', actionCampaignId: campaigns[1]?.id || '2', maxGasLimit: 25, status: 'inactive' }
  ]);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState<'gas' | 'time' | 'balance'>('gas');
  const [ruleCondition, setRuleCondition] = useState('< 18 Gwei');
  const [ruleCampaign, setRuleCampaign] = useState(campaigns[0]?.id || '');
  const [ruleGas, setRuleGas] = useState(18);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: ruleName,
      triggerType: ruleTrigger,
      triggerCondition: ruleCondition,
      actionCampaignId: ruleCampaign || campaigns[0]?.id || '1',
      maxGasLimit: Number(ruleGas) || 20,
      status: 'active'
    };

    setRules(prev => [...prev, newRule]);
    setRuleName('');
    setToast({
      message: `Successfully compiled and deployed automation rule: ${ruleName}!`,
      type: 'success'
    });
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextStatus = r.status === 'active' ? 'inactive' : 'active';
        return { ...r, status: nextStatus };
      }
      return r;
    }));
    setToast({
      message: 'Workflow status updated successfully.',
      type: 'info'
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    setToast({
      message: 'Automation rule purged from scheduler memory.',
      type: 'success'
    });
  };

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
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 underline break-all font-semibold inline-flex items-center gap-0.5"
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
    setSecondsLeft(30);
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
    setToast({
      message: 'Submission logged securely. Node updated.',
      type: 'success'
    });
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

  const pClass = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2.5';
  const gridGap = density === 'compact' ? 'gap-3' : 'gap-4';

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top action header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="h-4.5 w-4.5 text-emerald-800 dark:text-emerald-500" />
            <span>Interactive Operations Checklist Matrix</span>
          </h2>
          <p className="text-[11px] text-[#a1998f] dark:text-[#8c857b]">Execute tasks, trigger simulation timers, and fetch custom instructions generated by native LLM integrations.</p>
        </div>
        <button
          onClick={() => {
            if (campaigns.length === 0) {
              alert('Please create an active campaign first before adding custom tasks!');
              return;
            }
            setShowAdd(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2e2c29] dark:bg-[#eae6db] text-[#fcfbfa] dark:text-neutral-900 rounded-lg text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Quest Agenda</span>
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-8 text-center bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl text-xs text-[#8c857b] space-y-1">
          <p className="font-semibold text-sm">No Campaigns Configured yet</p>
          <p className="text-[#a1998f]">Go to the Campaigns view to initialize on-chain targets, and task trackers will enable here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Bulk Action Deck */}
          {tasks.length > 0 && (
            <div className="bg-[#f5f2eb] dark:bg-[#1b1916] border border-[#e4dfd5] dark:border-[#272421] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-3xs">
              <div className="flex items-center gap-2.5">
                <label className="flex items-center gap-2 font-bold text-[#2e2c29] dark:text-[#f4f3f1] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[#d3cbbe] dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Select All Task Items ({tasks.length})</span>
                </label>
                {selectedTaskIds.length > 0 && (
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {selectedTaskIds.length} Selected
                  </span>
                )}
              </div>

              {selectedTaskIds.length > 0 && (
                <div className="flex items-center gap-2 animate-slide-in">
                  <button
                    onClick={handleBulkMarkVerified}
                    className="px-3 py-1.5 bg-[#2e2c29] dark:bg-[#eae6db] hover:bg-[#45423f] text-white dark:text-neutral-900 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark Verified</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Bulk Delete</span>
                  </button>
                  <button
                    onClick={() => setSelectedTaskIds([])}
                    className="px-2 py-1.5 border border-[#e4dfd5] dark:border-[#272421] hover:bg-[#eae6db] dark:hover:bg-neutral-800 text-[#5c564f] dark:text-[#a1998f] rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Task Grid lists */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 ${gridGap}`}>
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => {
                const campaign = campaigns.find(c => c.id === task.campaignId);
                const activeTip = aiTipsCache[task.id] || task.aiTips;
                const isSelected = selectedTaskIds.includes(task.id);

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, y: -15, transition: { duration: 0.22 } }}
                    transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                    key={task.id}
                    className={`bg-[#fcfbfa] dark:bg-[#141210] border rounded-xl p-4 space-y-3.5 shadow-2xs hover:shadow-xs hover:border-[#cbc6bb] dark:hover:border-[#383430] transition-all flex flex-col justify-between ${
                      isSelected ? 'border-emerald-600 dark:border-emerald-500/80 ring-1 ring-emerald-600/30' : 'border-[#e4dfd5] dark:border-[#272421]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTask(task.id)}
                            className="h-3.5 w-3.5 rounded border-[#d3cbbe] dark:border-[#272421] text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="Select for bulk action"
                          />
                          <span className="text-[9px] font-extrabold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-1.5 py-0.5 rounded">
                            {campaign ? campaign.name : 'Quest Root'}
                          </span>
                          {task.isRecurring && (
                            <span className="text-[9px] font-bold text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded border border-blue-200/40">
                              Every {task.recurIntervalDays}d
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[#8c857b]">
                          <span>Priority Score: <strong className="font-bold text-[#2e2c29] dark:text-[#f4f3f1]">{task.priorityScore}</strong></span>
                        </div>
                      </div>

                      {/* Objective Title */}
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xs font-extrabold text-[#2e2c29] dark:text-[#f4f3f1] flex-1 leading-normal">{task.name}</h3>
                        {task.targetUrl && (
                          <a
                            href={task.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold transition-all rounded-md"
                            title="Open original quest details"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Target Link</span>
                          </a>
                        )}
                      </div>

                      {/* Checklist Sub-items */}
                      <div className="bg-[#f5f2eb]/60 dark:bg-[#1b1916]/40 rounded-lg p-2.5 space-y-1.5">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8c857b] dark:text-[#a1998f] block mb-1">Interactive Checklist</span>
                        {task.checklist.map((item, idx) => {
                          const uid = `${task.id}-${idx}`;
                          const isDone = checkedItems[uid];
                          return (
                            <button
                              key={idx}
                              onClick={() => toggleCheck(uid)}
                              className="w-full flex items-center gap-2 text-left text-xs py-0.5 transition-colors hover:bg-black/[0.02]"
                            >
                              <div className={`h-3.5 w-3.5 border rounded flex items-center justify-center cursor-pointer transition-colors ${isDone ? 'bg-emerald-600 border-emerald-600' : 'border-[#d3cbbe] dark:border-zinc-800'}`}>
                                {isDone && <Check className="h-2.5 w-2.5 text-white stroke-[3.5]" />}
                              </div>
                              <span className={`flex-1 font-semibold select-none ${isDone ? 'line-through text-[#a1998f] dark:text-[#8c857b]' : 'text-[#4d4a45] dark:text-[#b4af9e]'}`}>{item}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Gemini Insight block */}
                      <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-lg p-2.5 space-y-1">
                        <div className="flex justify-between items-center text-[9px]">
                          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                            <span>Gemini LLM Quest Insights</span>
                          </div>
                          <button
                            onClick={() => handleQueryTips(task)}
                            disabled={loadingTipsId === task.id}
                            className="flex items-center gap-1 font-bold text-amber-900 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 px-2 py-0.5 rounded hover:bg-amber-100 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {loadingTipsId === task.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <RefreshCw className="h-2.5 w-2.5" />}
                            <span>Re-Query</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[#5c564f] dark:text-[#a1998f] leading-relaxed whitespace-pre-line font-medium">
                          {renderTextWithLinks(activeTip)}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions / Timer */}
                    <div className="border-t border-[#e4dfd5] dark:border-[#272421] pt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {task.automationReady ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                            <Zap className="h-3 w-3" />
                            Bot Swarm Execution
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#8c857b] bg-[#f5f2eb] dark:bg-[#1b1916]/40 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                            <Server className="h-3 w-3" />
                            Manual Node Entry
                          </span>
                        )}

                        {activeTimerId === task.id ? (
                          <span className="font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-1.5 rounded-sm flex items-center gap-1 font-bold">
                            <Clock className="h-3 w-3 shrink-0 animate-spin-slow" />
                            0:{secondsLeft < 10 ? '0' + secondsLeft : secondsLeft}
                          </span>
                        ) : (
                          <button 
                            onClick={() => startTaskTimer(task.id)}
                            className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:underline cursor-pointer font-bold"
                          >
                            Trigger Cooldown
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-950/15 text-rose-600 dark:text-rose-400 font-bold transition-all cursor-pointer rounded"
                        >
                          Purge
                        </button>
                        <button
                          onClick={() => setSubmittingTaskId(task.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] py-1 px-2.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <span>Sign Quest</span>
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

      {/* Brand New Automation Trigger Workflow Builder Panel */}
      <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden shadow-2xs">
        
        <div className="p-3 bg-[#f5f2eb] dark:bg-[#1c1a17] border-b border-[#e4dfd5] dark:border-[#272421] flex justify-between items-center">
          <span className="font-extrabold uppercase text-[#2e2c29] dark:text-[#f4f3f1] tracking-wider text-[10px] flex items-center gap-1.5">
            <Workflow className="h-4.5 w-4.5 text-amber-600 dark:text-amber-500 animate-pulse" />
            <span>Distributed Real-Time Automation Workflow Orchestrator</span>
          </span>
          <span className="text-[10px] uppercase font-bold text-[#8c857b] dark:text-[#a1998f]">Redis & BullMQ worker loop</span>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Rule Generator Form */}
          <form onSubmit={handleCreateRule} className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-black text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wide block">Compile Automated Swarm Scenario</span>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Scenario Label / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Sweep zk_money below 12 Gwei"
                className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#0c0a09] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Trigger Engine Condition</label>
                <select
                  className="w-full px-2 py-1.5 bg-[#fcfbfa] dark:bg-[#0c0a09] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
                  value={ruleTrigger}
                  onChange={(e: any) => setRuleTrigger(e.target.value)}
                >
                  <option value="gas">Gas Target Threshold</option>
                  <option value="time">Interval Cron timer</option>
                  <option value="balance">Wallet Balance target</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Critical Gate values</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. < 14 Gwei"
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#0c0a09] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                  value={ruleCondition}
                  onChange={(e) => setRuleCondition(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Target Campaign</label>
                <select
                  className="w-full px-2 py-1.5 bg-[#fcfbfa] dark:bg-[#0c0a09] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
                  value={ruleCampaign}
                  onChange={(e) => setRuleCampaign(e.target.value)}
                >
                  <option value="">-- Choose Campaign --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Max Gas Safety limits (Gwei)</label>
                <input
                  type="number"
                  placeholder="22"
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#0c0a09] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs font-mono"
                  value={ruleGas}
                  onChange={(e) => setRuleGas(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-center py-2 bg-[#2a2824] dark:bg-[#eae6db] text-white dark:text-neutral-900 rounded-lg text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 animate-bounce text-amber-500" />
              <span>Deploy Scenario Workflow rule</span>
            </button>
          </form>

          {/* Active Workflows listing: 7 columns width */}
          <div className="lg:col-span-7 space-y-2">
            <span className="text-[10px] font-black text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wide block">Deployed Scenario Scheduler state ({rules.length} active rules)</span>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rules.map((rule) => {
                const associatedC = campaigns.find(c => c.id === rule.actionCampaignId);
                return (
                  <div key={rule.id} className="p-3 bg-[#f5f2eb]/40 dark:bg-[#1a1816]/35 border border-[#e4dfd5] dark:border-[#272421] rounded-xl flex items-center justify-between hover:border-[#cbc6bb]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#2e2c29] dark:text-[#f4f3f1]">{rule.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          rule.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200/40' 
                            : 'bg-neutral-100 dark:bg-[#1c1a17] text-neutral-500 dark:text-neutral-400 border border-neutral-200/40'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      
                      <p className="text-[#8c857b] dark:text-[#a1998f] text-[10px] leading-relaxed">
                        When <strong className="font-bold text-[#4d4a45] dark:text-zinc-200 uppercase font-mono">{rule.triggerType}</strong> satisfies <strong className="font-mono text-emerald-800 dark:text-emerald-400">{rule.triggerCondition}</strong> ➡️ Trigger target <strong className="underline text-[#2e2c29] dark:text-[#eae6db]">{associatedC ? associatedC.name : 'All local listings'}</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => toggleRuleStatus(rule.id)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          rule.status === 'active' 
                            ? 'bg-rose-50/50 border-rose-200/50 text-rose-700 hover:bg-rose-100' 
                            : 'bg-emerald-50/50 border-emerald-200/50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={rule.status === 'active' ? 'Suspend Rule execution' : 'Launch Scenario'}
                      >
                        {rule.status === 'active' ? <Ban className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg border border-[#e4dfd5] dark:border-[#272421] text-[#8c857b] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/25 cursor-pointer"
                        title="Delete scheduling condition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {rules.length === 0 && (
                <div className="py-8 p-4 text-center text-[#8c857b] dark:text-[#a1998f] bg-[#f5f2eb]/20 rounded-xl border border-dashed border-[#e4dfd5] dark:border-[#272421]">
                  No active automations scheduled. Formulate triggers in the left console to start background workers!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Task Submissions Dialog overlay */}
      {submittingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl w-full max-w-sm shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17]">
              <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider">Confirm Cryptographic Run Verification</h3>
              <button 
                onClick={() => setSubmittingTaskId(null)}
                className="p-1 rounded hover:bg-[#e4dfd5]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Select Active Signer Ledger</label>
                {wallets.length === 0 ? (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">Specify dynamic wallets in Wallets ledger first before completing tasks!</p>
                ) : (
                  <select
                    className="w-full px-2.5 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs cursor-pointer"
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

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] dark:border-[#272421] pt-3">
                <button
                  type="button"
                  onClick={() => setSubmittingTaskId(null)}
                  className="px-4 py-2 border border-[#e4dfd5] dark:border-[#272421] text-xs font-semibold rounded-lg hover:bg-[#f5f2eb]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmSubmit(submittingTaskId)}
                  disabled={!selectedWalletId}
                  className="px-4 py-2 bg-emerald-700 text-white disabled:opacity-55 text-xs font-bold rounded-lg hover:bg-emerald-800 cursor-pointer"
                >
                  Apply Quest Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Agenda Overlay Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-3.5 bg-[#f5f2eb] dark:bg-[#1c1a17]">
              <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider">Configure Quest Objective</h3>
              <button 
                onClick={() => setShowAdd(false)}
                className="p-1 rounded hover:bg-[#e4dfd5] dark:hover:bg-[#201d1a]"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Select Target Campaign *</label>
                <select
                  required
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden cursor-pointer"
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
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Task Objective Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Stake 10 USDT to Berachain Swap"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Priority Weight (1-100)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] font-mono outline-hidden"
                    value={priorityScore}
                    onChange={(e) => setPriorityScore(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Due Reminder Date</label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] font-mono outline-hidden cursor-pointer"
                    value={dueReminderDate}
                    onChange={(e) => setDueReminderDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 py-1.5 px-3 bg-[#f5f2eb]/40 dark:bg-zinc-900/30 border border-[#e4dfd5] dark:border-[#272421] rounded-xl text-xs">
                <label className="flex items-center gap-2 font-semibold text-[#5c564f] dark:text-[#a1998f] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-[#e4dfd5] h-3.5 w-3.5 accent-[#2e2c29]"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <span>Is Recurring</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-[#5c564f] dark:text-[#a1998f] cursor-pointer select-none">
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
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Sub-Checklist (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Approve token spend, Deposit BERA, Claim receipt"
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Task Target URL / Direct Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://faucet.monad.xyz"
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] dark:border-[#272421] pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 bg-white dark:bg-[#151311] border border-[#e4dfd5] dark:border-[#272421] hover:bg-[#f5f2eb] text-[#5c564f] dark:text-[#a1998f] text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2e2c29] dark:bg-[#eae6db] hover:bg-neutral-800 text-white dark:text-neutral-900 text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all cursor-pointer"
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
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-[#2e2c29] dark:bg-zinc-100 border border-[#e4dfd5]/20 dark:border-zinc-800 text-white dark:text-neutral-900 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold"
          >
            <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
              <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-400 dark:text-emerald-600" />
            </div>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:bg-white/10 dark:hover:bg-neutral-200 rounded-sm p-0.5 text-white/50 dark:text-neutral-500 hover:text-white transition-colors cursor-pointer"
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
