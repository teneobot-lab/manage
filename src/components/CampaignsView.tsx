import React, { useState } from 'react';
import { useAirdropStore } from '../store';
import { 
  FolderSync, Plus, Trash2, Calendar, Award, ShieldAlert, Tag, 
  HelpCircle, ChevronRight, Edit3, X, Check, Save, ExternalLink 
} from 'lucide-react';

export default function CampaignsView() {
  const { campaigns, addCampaign, deleteCampaign, updateCampaign } = useAirdropStore();
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

    // Reset fields
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
      case 'easy': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'hard': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (prio: string) => {
    switch (prio) {
      case 'high': return <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse" />;
      case 'medium': return <Calendar className="h-4.5 w-4.5 text-amber-500" />;
      default: return <HelpCircle className="h-4.5 w-4.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fcfbfa] border border-[#e4dfd5] p-3 rounded-2xl shadow-3xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'L1', 'L2', 'DeFi', 'DePIN', 'GameFi', 'AI'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                catFilter === cat 
                  ? 'bg-[#2e2c29] text-[#fcfbfa] border-[#2e2c29] shadow-3xs' 
                  : 'bg-[#fcfbfa] text-[#5c564f] border-[#e4dfd5] hover:bg-[#f5f2eb] hover:text-[#2e2c29]'
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
            className="flex-1 sm:w-64 px-3.5 py-2 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden placeholder-[#a1998f] focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaigns Listing - Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((campaign) => {
          const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const progress = campaign.totalTasksCount > 0 
            ? Math.round((campaign.completedTasksCount / campaign.totalTasksCount) * 100) 
            : 0;

          return (
            <div 
              key={campaign.id}
              className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#d3cbbe] transition-all flex flex-col justify-between"
            >
              <div className="p-4 space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-[#f5f2eb] px-2 py-0.5 rounded border border-[#e4dfd5] text-[#5c564f] uppercase tracking-wider">{campaign.category}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(campaign.difficulty)}`}>
                      {campaign.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(campaign.priority)}
                    <span className="text-[10px] font-bold text-[#8c857b] uppercase">{campaign.priority} priority</span>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#2e2c29] line-clamp-1 flex-1">{campaign.name}</h3>
                    {campaign.targetUrl && (
                      <a 
                        href={campaign.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold transition-all shadow-3xs"
                        title="Buka Link Campaign"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Buka Link</span>
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-[#8c857b] line-clamp-2 min-h-8 whitespace-pre-line">
                    {campaign.notesString ? renderTextWithLinks(campaign.notesString) : <span className="text-[#a1998f]">No guidelines saved.</span>}
                  </div>
                </div>

                {/* Dynamic Progress indicator */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-medium text-[#5c564f]">
                    <span>Task Milestones</span>
                    <span>{campaign.completedTasksCount}/{campaign.totalTasksCount} completed ({progress}%)</span>
                  </div>
                  <div className="w-full bg-[#f5f2eb] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {campaign.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-0.5 text-[9px] font-medium text-[#8c857b] bg-[#f5f2eb] px-2 py-0.5 rounded-sm">
                      <Tag className="h-2 w-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="border-t border-[#e4dfd5] bg-[#fdfdfd] px-4 py-3 flex items-center justify-between text-xs text-[#5c564f]">
                <div className="flex items-center gap-1 text-[10px]">
                  <Calendar className="h-3.5 w-3.5 text-[#8c857b]" />
                  <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired / Completed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEdit(campaign)}
                    className="p-1.5 rounded-md hover:bg-[#f5f2eb] text-[#8c857b] hover:text-[#2e2c29]"
                    title="Edit Guidelines & Info"
                  >
                    <Edit3 className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                  <select
                    className="bg-[#fcfbfa] border border-[#e4dfd5] rounded px-1.5 py-0.5 text-[10px] font-medium"
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

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] px-4 py-3.5 bg-[#f5f2eb]">
              <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider flex items-center gap-1.5">
                <FolderSync className="h-4 w-4 text-emerald-700" />
                <span>Create New Campaign Target</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-[#e4dfd5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Campaign Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Monad Testnet Campaign"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Difficulty</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all cursor-pointer"
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Category</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all cursor-pointer"
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
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Priority Level</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all cursor-pointer"
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Est Reward (USD)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] font-mono outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                    value={rewardEstimation}
                    onChange={(e) => setRewardEstimation(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Deadline date</label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] font-mono outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Tags (comma split)</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Target URL / Direct Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://testnet.monad.xyz"
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Campaign notes & strategy</label>
                <textarea
                  rows={2}
                  placeholder="Paste strategy guides, faucets link, or points mechanisms here..."
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={notesString}
                  onChange={(e) => setNotesString(e.target.value)}
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e4dfd5] pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-[#e4dfd5] hover:bg-[#f5f2eb] text-[#5c564f] text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / Notes View Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfbfa] border border-[#e4dfd5] rounded-xl w-full max-w-md shadow-xl overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] px-4 py-3.5 bg-[#f5f2eb]">
              <div className="flex items-center gap-1.5">
                <Edit3 className="h-4 w-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-[#2e2c29] uppercase tracking-wider">Edit {selectedCampaign.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="p-1 rounded hover:bg-[#e4dfd5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Target URL / Direct Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://testnet.monad.xyz"
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={editTargetUrl}
                  onChange={(e) => setEditTargetUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Strategic Guidelines</label>
                <textarea
                  rows={4}
                  placeholder="Paste strategy guides, faucets link, or points mechanisms here..."
                  className="w-full px-3.5 py-2.5 bg-[#fcfbfa] border border-[#e4dfd5] hover:border-[#cbc6bb] rounded-xl text-xs text-[#2e2c29] outline-hidden focus:border-[#2e2c29] focus:ring-4 focus:ring-[#2e2c29]/5 transition-all"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-[#f5f2eb]/40 border border-[#e4dfd5] p-3 rounded-xl">
                <div>
                  <h4 className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Estimated Output</h4>
                  <p className="font-bold text-[#2e2c29] font-display text-sm mt-0.5">${selectedCampaign.rewardEstimation.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#8c857b] uppercase tracking-wider">Participants Status</h4>
                  <p className="font-bold text-[#2e2c29] font-sans text-sm mt-0.5">{selectedCampaign.participants} active nodes</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e4dfd5] pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="px-4 py-2 bg-white border border-[#e4dfd5] hover:bg-[#f5f2eb] text-[#5c564f] text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-5 py-2 bg-[#2e2c29] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
