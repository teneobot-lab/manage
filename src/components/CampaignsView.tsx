import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { 
  FolderSync, Plus, Trash2, Calendar, Award, ShieldAlert, Tag, 
  HelpCircle, ChevronRight, Edit3, X, Check, Save, ExternalLink 
} from 'lucide-react';

export default function CampaignsView() {
  const { campaigns, addCampaign, deleteCampaign, updateCampaign, density, theme } = useAirdropStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // Create state
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [category, setCategory] = useState<'L1' | 'L2' | 'DeFi' | 'DePIN' | 'GameFi' | 'AI'>('L2');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [rewardEstimation, setRewardEstimation] = useState(500);
  const [deadline, setDeadline] = useState('2026-09-30');
  const [notesString, setNotesString] = useState('');
  const [tagsInput, setTagsInput] = useState('Testnet, Ecosystem');
  const [targetUrl, setTargetUrl] = useState('');

  // Edit Campaign values status
  const [editNotes, setEditNotes] = useState('');
  const [editTargetUrl, setEditTargetUrl] = useState('');

  const handleOpenEdit = (campaign: any) => {
    setSelectedCampaign(campaign);
    setEditNotes(campaign.notesString || '');
    setEditTargetUrl(campaign.targetUrl || '');
  };

  const handleSaveChanges = async () => {
    if (!selectedCampaign) return;
    await updateCampaign(selectedCampaign.id, {
      notesString: editNotes,
      targetUrl: editTargetUrl
    });
    setSelectedCampaign(null);
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

  // Filter state
  const [catFilter, setCatFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const splitTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    await addCampaign({
      name,
      difficulty,
      category,
      priority,
      rewardEstimation: Number(rewardEstimation) || 100,
      deadline: new Date(deadline).toISOString(),
      notesString,
      tags: splitTags.length > 0 ? splitTags : ['Ecosystem'],
      targetUrl
    });

    setName('');
    setNotesString('');
    setTagsInput('Ecosystem');
    setTargetUrl('');
    setShowAddModal(false);
  };

  const handleUpdateStatus = async (id: string, stat: any) => {
    await updateCampaign(id, { status: stat });
  };

  const filtered = campaigns.filter(c => {
    const matchesCat = catFilter === 'All' || c.category === catFilter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40';
      case 'medium': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
      case 'dark':
      case 'hard': return 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900/40';
      default: return 'bg-neutral-50 dark:bg-[#1a1816]/30 text-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800';
    }
  };

  const getPriorityIcon = (prio: string) => {
    switch (prio) {
      case 'high': return <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse" />;
      case 'medium': return <Calendar className="h-4.5 w-4.5 text-amber-500" />;
      default: return <HelpCircle className="h-4.5 w-4.5 text-blue-500" />;
    }
  };

  const pClass = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2.5';
  const gapClass = density === 'compact' ? 'gap-2.5' : 'gap-4';

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Search and Filters Deck */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center ${gapClass} bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] p-3 rounded-xl shadow-3xs`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'L1', 'L2', 'DeFi', 'DePIN', 'GameFi', 'AI'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all duration-150 cursor-pointer ${
                catFilter === cat 
                  ? 'bg-[#2e2c29] dark:bg-[#eae6db] text-[#fcfbfa] dark:text-neutral-900 border-[#2e2c29] dark:border-zinc-300 shadow-3xs' 
                  : 'bg-[#fcfbfa] dark:bg-[#1c1a17] text-[#5c564f] dark:text-[#a1998f] border-[#e4dfd5] dark:border-[#272421] hover:bg-[#f5f2eb] dark:hover:bg-[#201d1a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search campaigns..."
            className="flex-1 sm:w-56 px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#0c0a09] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs outline-hidden"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaigns Listing - Bento Cards layout */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapClass}`}>
        {filtered.map((campaign) => {
          const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const progress = campaign.totalTasksCount > 0 
            ? Math.round((campaign.completedTasksCount / campaign.totalTasksCount) * 100) 
            : 0;

          return (
            <div 
              key={campaign.id}
              className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl overflow-hidden hover:border-[#cbc6bb] dark:hover:border-[#383430] transition-all flex flex-col justify-between"
            >
              <div className="p-4 space-y-3.5">
                {/* Header categories */}
                <div className="flex items-start justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold bg-[#f5f2eb] dark:bg-[#1b1916] px-2 py-0.5 rounded border border-[#e4dfd5] dark:border-[#272421] text-[#5c564f] dark:text-[#a1998f] uppercase tracking-wider">{campaign.category}</span>
                    <span className={`font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(campaign.difficulty)}`}>
                      {campaign.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">
                    {getPriorityIcon(campaign.priority)}
                    <span>{campaign.priority}</span>
                  </div>
                </div>

                {/* Campaign Info block */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-extrabold text-[#2e2c29] dark:text-[#f4f3f1] line-clamp-1 flex-1">{campaign.name}</h3>
                    {campaign.targetUrl && (
                      <a 
                        href={campaign.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold transition-all cursor-pointer"
                        title="Open campaign panel"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Link</span>
                      </a>
                    )}
                  </div>
                  <div className="text-[11px] text-[#8c857b] dark:text-[#a1998f] line-clamp-2 min-h-8 leading-relaxed">
                    {campaign.notesString ? renderTextWithLinks(campaign.notesString) : <span className="text-[#a1998f] dark:text-[#524d46] italic">No guidelines saved.</span>}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#5c564f] dark:text-[#a1998f] uppercase">
                    <span>Task Milestones</span>
                    <span>{campaign.completedTasksCount}/{campaign.totalTasksCount} items ({progress}%)</span>
                  </div>
                  <div className="w-full bg-[#f5f2eb] dark:bg-[#1b1916] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Tag badges */}
                <div className="flex flex-wrap gap-1">
                  {campaign.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-0.5 text-[9px] font-bold text-[#8c857b] dark:text-[#a1998f] bg-[#f5f2eb] dark:bg-[#1a1816]/50 px-2 py-0.5 rounded border border-[#e4dfd5]/40 dark:border-[#272421]/40">
                      <Tag className="h-2 w-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer row */}
              <div className="border-t border-[#e4dfd5] dark:border-[#272421] bg-[#fdfdfd] dark:bg-[#141210]/40 px-4 py-2.5 flex items-center justify-between text-xs text-[#5c564f] dark:text-[#a1998f]">
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <Calendar className="h-3.5 w-3.5 text-[#8c857b] dark:text-[#a1998f]" />
                  <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Finished / Target met'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEdit(campaign)}
                    className="p-1 px-1.5 rounded hover:bg-[#f5f2eb] dark:hover:bg-[#1a1816] text-[#8c857b] dark:text-[#a1998f] hover:text-[#2e2c29] dark:hover:text-white cursor-pointer"
                    title="Edit Guidelines & Info"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-1 px-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <select
                    className="bg-[#fcfbfa] dark:bg-[#13110f] border border-[#e4dfd5] dark:border-[#272421] rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer"
                    value={campaign.status}
                    onChange={(e) => handleUpdateStatus(campaign.id, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Campaign Modal Box */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17]">
              <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider flex items-center gap-1.5">
                <FolderSync className="h-4 w-4 text-emerald-700" />
                <span>Create New Campaign Target</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-[#e4dfd5] dark:hover:bg-[#1c1a17]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Campaign Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Monad Testnet Campaign"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Difficulty</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden cursor-pointer"
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Category</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden cursor-pointer"
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                  >
                    <option value="L1">Layer-1 (L1)</option>
                    <option value="L2">Layer-2 (L2)</option>
                    <option value="DeFi">DeFi Quests</option>
                    <option value="DePIN">DePIN Farms</option>
                    <option value="GameFi">GameFi Quest</option>
                    <option value="AI">AI Ecosystems</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Priority Level</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden cursor-pointer"
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Est Reward (USD)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] font-mono outline-hidden"
                    value={rewardEstimation}
                    onChange={(e) => setRewardEstimation(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Deadline date</label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] font-mono outline-hidden cursor-pointer"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Tags (comma split)</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Target URL / Direct Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://testnet.monad.xyz"
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase tracking-wider block">Campaign notes & strategy</label>
                <textarea
                  rows={2}
                  placeholder="Paste strategy guides, faucets link, or points mechanisms here..."
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] dark:text-[#f4f3f1] outline-hidden"
                  value={notesString}
                  onChange={(e) => setNotesString(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] dark:border-[#272421] pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white dark:bg-[#1a1816] border border-[#e4dfd5] dark:border-[#272421] text-xs font-bold text-[#5c564f] dark:text-[#a1998f] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  <span>Create Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit campaign overlay dialog */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-xl w-full max-w-sm shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] dark:border-[#272421] px-4 py-3 bg-[#f5f2eb] dark:bg-[#1c1a17]">
              <h3 className="text-xs font-bold text-[#2e2c29] dark:text-[#f4f3f1] uppercase tracking-wider">Configure Guidelines</h3>
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="p-1 rounded hover:bg-[#eae6db] dark:hover:bg-[#1a1816]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Guidelines URL Link</label>
                <input
                  type="url"
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
                  value={editTargetUrl}
                  onChange={(e) => setEditTargetUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] dark:text-[#a1998f] uppercase">Instruction Guidelines content</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-1.5 bg-[#fcfbfa] dark:bg-[#141210] border border-[#e4dfd5] dark:border-[#272421] rounded-lg text-xs"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] dark:border-[#272421] pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="px-4 py-2 border border-[#e4dfd5] dark:border-[#272421] text-xs font-semibold rounded-lg hover:bg-[#f5f2eb]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 cursor-pointer"
                >
                  Save Guidelines
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
