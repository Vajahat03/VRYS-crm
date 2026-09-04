import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Lead, LeadStatus, LeadSource, SocialQuery, SocialPlatform } from '../../types';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Sparkles,
  Phone,
  Mail,
  Building,
  ArrowRight,
  MoreVertical,
  Calendar,
  CheckCircle2,
  X,
  Zap,
  Flame,
  Info,
  Instagram,
  Facebook,
  MessageSquare,
  Globe,
  Store,
  Send,
  User,
  Clock,
  CheckCheck,
  AtSign,
  TrendingUp,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const LeadsModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'social_queries'>('pipeline');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<SocialPlatform | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [inspectScoreLead, setInspectScoreLead] = useState<Lead | null>(null);

  // Social Query Reply & Convert State
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [convertingQueryId, setConvertingQueryId] = useState<string | null>(null);
  const [queryEstimatedValue, setQueryEstimatedValue] = useState<string>('5000');
  const [queryPriority, setQueryPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  // Drag-and-drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSocialHandle, setNewSocialHandle] = useState('');
  const [newService, setNewService] = useState('Fresh Passport Application (Tatkaal/Normal)');
  const [newSource, setNewSource] = useState<LeadSource>('Instagram');
  const [newEstValue, setNewEstValue] = useState('5000');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newNotes, setNewNotes] = useState('');

  const leads = dataStore.getLeads(activeOrg.id);
  const products = dataStore.getProducts(activeOrg.id);
  const socialQueries = dataStore.getSocialQueries(activeOrg.id);

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];

  // Calculate Channel Metrics
  const instagramLeads = leads.filter(l => l.source === 'Instagram');
  const facebookLeads = leads.filter(l => l.source === 'Facebook');
  const whatsappLeads = leads.filter(l => l.source === 'WhatsApp');
  const websiteLeads = leads.filter(l => l.source === 'Website');
  const walkinLeads = leads.filter(l => l.source === 'Walk-in');

  const newIgQueries = socialQueries.filter(q => q.platform === 'Instagram' && q.status === 'new').length;
  const newFbQueries = socialQueries.filter(q => q.platform === 'Facebook' && q.status === 'new').length;
  const newWaQueries = socialQueries.filter(q => q.platform === 'WhatsApp' && q.status === 'new').length;

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.mobile.includes(searchQuery) ||
      (lead.socialHandle && lead.socialHandle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.companyName && lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;
    return matchesSearch && matchesSource && matchesPriority;
  });

  const filteredQueries = socialQueries.filter(query => {
    const matchesPlatform = selectedPlatformTab === 'ALL' || query.platform.toLowerCase() === selectedPlatformTab.toLowerCase();
    const matchesSearch = query.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (query.customerHandle && query.customerHandle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (query.customerMobile && query.customerMobile.includes(searchQuery)) ||
      query.queryText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.interestedService.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const handleCardClick = (source: string, switchToQueries: boolean = false) => {
    setSourceFilter(source);
    if (switchToQueries) {
      setActiveTab('social_queries');
      if (source === 'Instagram') setSelectedPlatformTab('Instagram');
      else if (source === 'Facebook') setSelectedPlatformTab('Facebook');
      else if (source === 'WhatsApp') setSelectedPlatformTab('WhatsApp');
      else setSelectedPlatformTab('ALL');
    } else {
      setActiveTab('pipeline');
    }
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile) {
      addToast('error', 'Validation Error', 'Name and mobile number are required.');
      return;
    }

    // Dynamic AI Lead Scoring simulation
    let aiScore = 60;
    if (newSource === 'Instagram' || newSource === 'WhatsApp' || newSource === 'Facebook') aiScore += 15;
    if (Number(newEstValue) > 10000) aiScore += 15;
    if (newPriority === 'urgent' || newPriority === 'high') aiScore += 10;
    aiScore = Math.min(aiScore, 98);

    dataStore.createLead({
      organizationId: activeOrg.id,
      name: newName,
      mobile: newMobile,
      email: newEmail,
      companyName: newCompany,
      source: newSource,
      socialHandle: newSocialHandle,
      interestedService: newService,
      estimatedValue: Number(newEstValue) || 0,
      priority: newPriority,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      status: 'New',
      aiScore,
      aiScoreReason: `High intent from ${newSource} (${newSocialHandle || newName}) for ${newService}`,
      notes: newNotes
    });

    addToast('success', 'Lead Captured', `Successfully created lead for ${newName} (AI Score: ${aiScore}/100)`);
    setShowAddModal(false);
    setNewName('');
    setNewMobile('');
    setNewEmail('');
    setNewCompany('');
    setNewSocialHandle('');
    setNewNotes('');
    triggerRefresh();
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    dataStore.updateLead(leadId, { status: newStatus });
    addToast('info', 'Status Updated', `Moved lead to ${newStatus}`);
    triggerRefresh();
  };

  // Drag-and-Drop Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      handleStatusChange(leadId, targetStatus);
    }
    setDraggedLeadId(null);
  };

  const handleSendQueryReply = (queryId: string) => {
    const text = replyTextMap[queryId];
    if (!text || !text.trim()) {
      addToast('error', 'Empty Reply', 'Please write a message before sending.');
      return;
    }

    dataStore.replyToSocialQuery(queryId, text.trim(), 'user');
    setReplyTextMap(prev => ({ ...prev, [queryId]: '' }));
    addToast('success', 'Reply Sent', 'Dispatched reply to customer on social channel.');
    triggerRefresh();
  };

  const handleExecuteQueryConversion = (queryId: string) => {
    const query = socialQueries.find(q => q.id === queryId);
    if (!query) return;

    dataStore.convertSocialQueryToLead(queryId, {
      organizationId: activeOrg.id,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      estimatedValue: Number(queryEstimatedValue) || 5000,
      priority: queryPriority
    });

    addToast('success', 'Lead Generated!', `Converted ${query.customerName} (${query.platform}) into an active sales lead!`);
    setConvertingQueryId(null);
    triggerRefresh();
  };

  const handleExecuteConversion = () => {
    if (!convertLead) return;

    const newCustomer = dataStore.createCustomer({
      organizationId: activeOrg.id,
      name: convertLead.name,
      mobile: convertLead.mobile,
      email: convertLead.email,
      companyName: convertLead.companyName,
      category: convertLead.companyName ? 'Commercial' : 'Individual',
      lifetimeValue: convertLead.estimatedValue,
      outstandingAmount: 0,
      totalRevenue: 0,
      tags: ['Converted Lead', convertLead.source, convertLead.socialHandle || ''].filter(Boolean),
      ownerId: currentUser.id,
      status: 'active'
    });

    dataStore.createDeal({
      organizationId: activeOrg.id,
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      title: `${convertLead.interestedService} - ${newCustomer.name}`,
      pipelineId: 'pipe_default',
      stage: 'Proposal Sent',
      value: convertLead.estimatedValue,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      source: convertLead.source
    });

    dataStore.updateLead(convertLead.id, { status: 'Converted' });

    addToast('success', 'Lead Converted!', `Created Customer ${newCustomer.name} (${newCustomer.customerCode}) and new sales deal.`);
    setConvertLead(null);
    triggerRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner: Channel Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        {/* All Leads Card */}
        <div
          onClick={() => handleCardClick('ALL', false)}
          className="glass-panel"
          style={{
            padding: '1rem 1.15rem',
            cursor: 'pointer',
            border: sourceFilter === 'ALL' && activeTab === 'pipeline' ? '1.5px solid var(--primary)' : '1px solid var(--border-glass)',
            background: sourceFilter === 'ALL' && activeTab === 'pipeline' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-1)',
            boxShadow: sourceFilter === 'ALL' && activeTab === 'pipeline' ? '0 0 20px -5px var(--primary-glow)' : 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              All Leads
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={16} color="#fff" />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{leads.length}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              ({leads.filter(l => l.status !== 'Converted' && l.status !== 'Lost').length} active)
            </span>
          </div>
          <p style={{ fontSize: '0.725rem', color: 'var(--emerald)', marginTop: '4px', fontWeight: 600 }}>
            Pipeline: {activeOrg.currency}{leads.reduce((s, l) => s + l.estimatedValue, 0).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Instagram Leads Card */}
        <div
          onClick={() => handleCardClick('Instagram', true)}
          className="glass-panel"
          style={{
            padding: '1rem 1.15rem',
            cursor: 'pointer',
            border: (sourceFilter === 'Instagram' || selectedPlatformTab === 'Instagram') ? '1.5px solid #E1306C' : '1px solid var(--border-glass)',
            background: (sourceFilter === 'Instagram' || selectedPlatformTab === 'Instagram') ? 'rgba(225, 48, 108, 0.12)' : 'var(--bg-surface-1)',
            boxShadow: (sourceFilter === 'Instagram' || selectedPlatformTab === 'Instagram') ? '0 0 20px -5px rgba(225, 48, 108, 0.4)' : 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E1306C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instagram Leads
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Instagram size={16} color="#fff" />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{instagramLeads.length}</h3>
            {newIgQueries > 0 && (
              <span className="badge badge-rose" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
                {newIgQueries} New DMs
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Click to view Instagram DMs & Queries →
          </p>
        </div>

        {/* Facebook Leads Card */}
        <div
          onClick={() => handleCardClick('Facebook', true)}
          className="glass-panel"
          style={{
            padding: '1rem 1.15rem',
            cursor: 'pointer',
            border: (sourceFilter === 'Facebook' || selectedPlatformTab === 'Facebook') ? '1.5px solid #1877F2' : '1px solid var(--border-glass)',
            background: (sourceFilter === 'Facebook' || selectedPlatformTab === 'Facebook') ? 'rgba(24, 119, 242, 0.12)' : 'var(--bg-surface-1)',
            boxShadow: (sourceFilter === 'Facebook' || selectedPlatformTab === 'Facebook') ? '0 0 20px -5px rgba(24, 119, 242, 0.4)' : 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Facebook Leads
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1877F2, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Facebook size={16} color="#fff" />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{facebookLeads.length}</h3>
            {newFbQueries > 0 && (
              <span className="badge badge-cyan" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
                {newFbQueries} Ad Inquiries
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Click to view Facebook Lead Ads & Forms →
          </p>
        </div>

        {/* WhatsApp Card */}
        <div
          onClick={() => handleCardClick('WhatsApp', false)}
          className="glass-panel"
          style={{
            padding: '1rem 1.15rem',
            cursor: 'pointer',
            border: sourceFilter === 'WhatsApp' ? '1.5px solid #10b981' : '1px solid var(--border-glass)',
            background: sourceFilter === 'WhatsApp' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-1)',
            boxShadow: sourceFilter === 'WhatsApp' ? '0 0 20px -5px rgba(16, 185, 129, 0.4)' : 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              WhatsApp Leads
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={16} color="#fff" />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{whatsappLeads.length}</h3>
            <span className="badge badge-emerald" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
              Instant Chat
            </span>
          </div>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            ₹{whatsappLeads.reduce((s, l) => s + l.estimatedValue, 0).toLocaleString('en-IN')} pipeline value
          </p>
        </div>

        {/* Website & Walk-ins Card */}
        <div
          onClick={() => handleCardClick('Website', false)}
          className="glass-panel"
          style={{
            padding: '1rem 1.15rem',
            cursor: 'pointer',
            border: (sourceFilter === 'Website' || sourceFilter === 'Walk-in') ? '1.5px solid var(--cyan)' : '1px solid var(--border-glass)',
            background: (sourceFilter === 'Website' || sourceFilter === 'Walk-in') ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-surface-1)',
            boxShadow: (sourceFilter === 'Website' || sourceFilter === 'Walk-in') ? '0 0 20px -5px rgba(6, 182, 212, 0.4)' : 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Website & Walk-ins
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#fff" />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{websiteLeads.length + walkinLeads.length}</h3>
            <span className="badge badge-cyan" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
              Direct
            </span>
          </div>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {websiteLeads.length} Web Forms • {walkinLeads.length} Counter
          </p>
        </div>
      </div>

      {/* VRYS AI Leads Agent Contextual Assistant */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>VRYS AI Leads Agent</h4>
              <span className="badge badge-indigo" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>Active Insight</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Identified <strong>{leads.filter(l => (l.aiScore || 0) >= 85).length} High-Intent Leads</strong> (Score &gt; 85) across Instagram, WhatsApp &amp; Web. <strong>Tatkaal Passport &amp; GST Filing</strong> have highest closing velocity.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-glass btn-sm"
            style={{ fontSize: '0.725rem', padding: '4px 10px' }}
            onClick={() => setPriorityFilter('urgent')}
          >
            🔥 Filter Urgent Leads
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.725rem', padding: '4px 10px' }}
            onClick={() => setActiveTab('social_queries')}
          >
            <Sparkles size={12} /> Review {socialQueries.filter(q => q.status === 'new').length} Inbound Queries
          </button>
        </div>
      </div>

      {/* Main Hub Tabs & Controls */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Navigation Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'pipeline' ? 'var(--primary-gradient)' : 'var(--bg-surface-2)',
              color: activeTab === 'pipeline' ? '#fff' : 'var(--text-main)',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)'
            }}
            onClick={() => setActiveTab('pipeline')}
          >
            <Layers size={15} /> Leads Pipeline ({filteredLeads.length})
          </button>

          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'social_queries' ? 'linear-gradient(135deg, #E1306C, #833ab4)' : 'var(--bg-surface-2)',
              color: activeTab === 'social_queries' ? '#fff' : 'var(--text-main)',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('social_queries')}
          >
            <Instagram size={15} />
            <span>Social Media Queries & DMs</span>
            {socialQueries.filter(q => q.status === 'new').length > 0 && (
              <span className="badge badge-rose" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                {socialQueries.filter(q => q.status === 'new').length} New
              </span>
            )}
          </button>
        </div>

        {/* Global Filters & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder={activeTab === 'pipeline' ? "Search leads or @handles..." : "Search queries or handles..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
            />
          </div>

          {activeTab === 'pipeline' && (
            <>
              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="input-glass"
                style={{ width: '135px', height: '34px', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Sources</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Referral">Referral</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="input-glass"
                style={{ width: '125px', height: '34px', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Priorities</option>
                <option value="urgent">Urgent 🔥</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* View Switcher */}
              <div style={{ background: 'var(--bg-surface-2)', padding: '2px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
                <button
                  className="btn btn-sm"
                  style={{
                    background: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'kanban' ? '#fff' : 'var(--text-muted)',
                    padding: '4px 8px'
                  }}
                  onClick={() => setViewMode('kanban')}
                  title="Kanban Board View (Drag & Drop)"
                >
                  <Kanban size={15} />
                </button>
                <button
                  className="btn btn-sm"
                  style={{
                    background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                    padding: '4px 8px'
                  }}
                  onClick={() => setViewMode('table')}
                  title="Data Table View"
                >
                  <TableIcon size={15} />
                </button>
              </div>
            </>
          )}

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> New Lead
          </button>
        </div>
      </div>

      {/* VIEW 1: SOCIAL QUERIES & DIRECT MESSAGES TAB */}
      {activeTab === 'social_queries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Social Platform Filter Sub-Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
              Filter Platform:
            </span>
            <button
              className="btn btn-sm"
              style={{
                background: selectedPlatformTab === 'ALL' ? 'var(--primary)' : 'var(--bg-surface-2)',
                color: selectedPlatformTab === 'ALL' ? '#fff' : 'var(--text-main)',
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)'
              }}
              onClick={() => setSelectedPlatformTab('ALL')}
            >
              All Channels ({socialQueries.length})
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: selectedPlatformTab === 'Instagram' ? 'linear-gradient(135deg, #833ab4, #fd1d1d)' : 'var(--bg-surface-2)',
                color: selectedPlatformTab === 'Instagram' ? '#fff' : 'var(--text-main)',
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => setSelectedPlatformTab('Instagram')}
            >
              <Instagram size={13} /> Instagram DMs ({socialQueries.filter(q => q.platform === 'Instagram').length})
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: selectedPlatformTab === 'Facebook' ? '#1877F2' : 'var(--bg-surface-2)',
                color: selectedPlatformTab === 'Facebook' ? '#fff' : 'var(--text-main)',
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => setSelectedPlatformTab('Facebook')}
            >
              <Facebook size={13} /> Facebook Lead Ads ({socialQueries.filter(q => q.platform === 'Facebook').length})
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: selectedPlatformTab === 'WhatsApp' ? '#10b981' : 'var(--bg-surface-2)',
                color: selectedPlatformTab === 'WhatsApp' ? '#fff' : 'var(--text-main)',
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => setSelectedPlatformTab('WhatsApp')}
            >
              <MessageSquare size={13} /> WhatsApp Inquiries ({socialQueries.filter(q => q.platform === 'WhatsApp').length})
            </button>
          </div>

          {/* Social Queries Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {filteredQueries.map(query => {
              const isInstagram = query.platform === 'Instagram';
              const isFacebook = query.platform === 'Facebook';
              const isWhatsApp = query.platform === 'WhatsApp';
              const replyText = replyTextMap[query.id] || '';

              return (
                <div
                  key={query.id}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    borderLeft: isInstagram ? '4px solid #E1306C' : isFacebook ? '4px solid #1877F2' : '4px solid #10b981',
                    background: 'var(--bg-surface-1)',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Header: Customer Name, Social Handle & Channel Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isInstagram
                            ? 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)'
                            : isFacebook
                            ? 'linear-gradient(135deg, #1877F2, #06b6d4)'
                            : 'linear-gradient(135deg, #10b981, #059669)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {isInstagram ? <Instagram size={18} /> : isFacebook ? <Facebook size={18} /> : <MessageSquare size={18} />}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                            {query.customerName}
                          </h4>
                          <p style={{ fontSize: '0.725rem', color: isInstagram ? '#E1306C' : isFacebook ? '#38bdf8' : '#10b981', fontWeight: 600 }}>
                            {query.customerHandle || query.customerMobile || query.platform}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span className={`badge ${query.status === 'new' ? 'badge-rose' : query.status === 'converted' ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                          {query.status === 'new' ? '● New Inquiry' : query.status === 'converted' ? '✓ Converted to Lead' : 'Replied'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                          {new Date(query.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(query.receivedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Customer Inquiry Text Bubble */}
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.45)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass-subtle)',
                      marginBottom: '0.75rem'
                    }}>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                        "{query.queryText}"
                      </p>
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Service Requested: <strong style={{ color: 'var(--text-highlight)' }}>{query.interestedService}</strong>
                        </span>
                        {query.customerMobile && (
                          <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={11} /> {query.customerMobile}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Previous Replies History (if any) */}
                    {query.replies && query.replies.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.75rem' }}>
                        {query.replies.map(rep => (
                          <div
                            key={rep.id}
                            style={{
                              padding: '0.45rem 0.65rem',
                              borderRadius: '6px',
                              background: rep.sender === 'user' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.75rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span><strong>{rep.sender === 'user' ? 'Agent:' : 'Customer:'}</strong> {rep.text}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                              {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Box */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder={`Quick reply to ${query.customerName}...`}
                        value={replyText}
                        onChange={e => setReplyTextMap(prev => ({ ...prev, [query.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleSendQueryReply(query.id)}
                        className="input-glass"
                        style={{ height: '34px', fontSize: '0.775rem', flex: 1 }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: '34px', padding: '0 0.75rem' }}
                        onClick={() => handleSendQueryReply(query.id)}
                        title="Send reply to social channel"
                      >
                        <Send size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Footer: Convert to Lead Action */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-glass-subtle)'
                  }}>
                    {query.status === 'converted' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <CheckCircle2 size={15} /> Lead in Sales Pipeline
                      </div>
                    ) : (
                      <button
                        className="btn btn-glass btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          color: 'var(--emerald)',
                          borderColor: 'rgba(16, 185, 129, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => setConvertingQueryId(query.id)}
                      >
                        <Sparkles size={13} /> Convert to Lead Deal →
                      </button>
                    )}

                    <button
                      className="btn btn-glass btn-sm"
                      style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                      onClick={() => {
                        setSourceFilter(query.platform);
                        setActiveTab('pipeline');
                      }}
                    >
                      View All {query.platform} Leads
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredQueries.length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Instagram size={42} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No social queries found</h3>
              <p style={{ fontSize: '0.825rem', marginTop: '4px' }}>Try switching the platform filter above or searching for another customer.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: LEADS PIPELINE KANBAN & TABLE */}
      {activeTab === 'pipeline' && (
        <>
          {/* Active Channel Filter Indicator if not ALL */}
          {sourceFilter !== 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Filtering leads by Source: <strong>{sourceFilter}</strong> ({filteredLeads.length} leads found)</span>
              </div>
              <button
                className="btn btn-glass btn-sm"
                style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                onClick={() => setSourceFilter('ALL')}
              >
                Clear Source Filter (Show All)
              </button>
            </div>
          )}

          {/* Kanban View with HTML5 Drag-and-Drop */}
          {viewMode === 'kanban' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '1rem'
            }}>
              {statuses.map(status => {
                const statusLeads = filteredLeads.filter(l => l.status === status);
                const totalStageValue = statusLeads.reduce((s, l) => s + l.estimatedValue, 0);
                const isOver = dragOverColumn === status;

                return (
                  <div
                    key={status}
                    onDragOver={e => handleDragOver(e, status)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={e => handleDrop(e, status)}
                    className="glass-panel"
                    style={{
                      background: isOver ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-1)',
                      borderColor: isOver ? 'var(--primary)' : 'var(--border-glass)',
                      boxShadow: isOver ? '0 0 25px var(--primary-glow)' : 'var(--shadow-md)',
                      padding: '1rem',
                      minHeight: '480px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {/* Column Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{status}</span>
                        <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{statusLeads.length}</span>
                      </div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {activeOrg.currency}{totalStageValue.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Cards List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                      {statusLeads.map(lead => {
                        const isUrgent = lead.priority === 'urgent';
                        const isInstagram = lead.source === 'Instagram';
                        const isFacebook = lead.source === 'Facebook';
                        const isWhatsApp = lead.source === 'WhatsApp';

                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={e => handleDragStart(e, lead.id)}
                            className="glass-card"
                            style={{
                              padding: '0.9rem',
                              cursor: 'grab',
                              position: 'relative',
                              borderLeft: isUrgent
                                ? '3px solid var(--rose)'
                                : isInstagram
                                ? '3px solid #E1306C'
                                : isFacebook
                                ? '3px solid #1877F2'
                                : isWhatsApp
                                ? '3px solid #10b981'
                                : undefined
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                                  {lead.name}
                                </h4>
                                {lead.socialHandle ? (
                                  <p style={{ fontSize: '0.725rem', color: isInstagram ? '#E1306C' : isFacebook ? '#38bdf8' : 'var(--text-muted)', fontWeight: 600 }}>
                                    {lead.socialHandle}
                                  </p>
                                ) : lead.companyName ? (
                                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{lead.companyName}</p>
                                ) : null}
                              </div>

                              {lead.aiScore && (
                                <button
                                  className="badge badge-emerald"
                                  style={{ fontSize: '0.675rem', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', border: 'none' }}
                                  onClick={() => setInspectScoreLead(lead)}
                                  title="Click to inspect AI Score Breakdown"
                                >
                                  <Sparkles size={11} /> {lead.aiScore}
                                </button>
                              )}
                            </div>

                            <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{lead.interestedService}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={12} /> {lead.mobile}
                                </span>
                                <span className={`badge ${isInstagram ? 'badge-rose' : isFacebook ? 'badge-cyan' : isWhatsApp ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                                  {lead.source}
                                </span>
                              </div>
                            </div>

                            <div style={{
                              marginTop: '0.75rem',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid var(--border-glass-subtle)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--emerald)' }}>
                                {activeOrg.currency} {lead.estimatedValue.toLocaleString('en-IN')}
                              </span>

                              <div style={{ display: 'flex', gap: '4px' }}>
                                {lead.status !== 'Converted' && (
                                  <button
                                    className="btn btn-glass btn-sm"
                                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                    onClick={() => setConvertLead(lead)}
                                    title="Convert to Customer & Deal"
                                  >
                                    Convert →
                                  </button>
                                )}

                                <select
                                  value={lead.status}
                                  onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '4px',
                                    color: 'var(--text-dim)',
                                    fontSize: '0.675rem',
                                    padding: '2px 4px'
                                  }}
                                >
                                  {statuses.map(st => (
                                    <option key={st} value={st} style={{ background: '#0f172a' }}>{st}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="table-container">
              <table className="vrys-table">
                <thead>
                  <tr>
                    <th>Lead Details</th>
                    <th>Service & Est. Value</th>
                    <th>Source / Handle</th>
                    <th>Priority</th>
                    <th>AI Score</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <p style={{ fontWeight: 600 }}>{lead.name}</p>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {lead.mobile} • {lead.companyName || 'Individual'}
                        </span>
                      </td>
                      <td>
                        <p style={{ fontWeight: 500 }}>{lead.interestedService}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 700 }}>
                          {activeOrg.currency} {lead.estimatedValue.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className={`badge ${lead.source === 'Instagram' ? 'badge-rose' : lead.source === 'Facebook' ? 'badge-cyan' : lead.source === 'WhatsApp' ? 'badge-emerald' : 'badge-indigo'}`}>
                            {lead.source}
                          </span>
                          {lead.socialHandle && (
                            <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>{lead.socialHandle}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${lead.priority === 'urgent' ? 'badge-rose' : lead.priority === 'high' ? 'badge-amber' : 'badge-indigo'}`}>
                          {lead.priority.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          className="badge badge-emerald"
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => setInspectScoreLead(lead)}
                        >
                          <Sparkles size={12} /> {lead.aiScore}/100
                        </button>
                      </td>
                      <td>{lead.ownerName}</td>
                      <td>
                        <span className="badge badge-amber">{lead.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {lead.status !== 'Converted' && (
                          <button className="btn btn-primary btn-sm" onClick={() => setConvertLead(lead)}>
                            Convert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Convert Social Query to Lead Modal */}
      {convertingQueryId && (
        <div className="modal-backdrop" onClick={() => setConvertingQueryId(null)}>
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Sparkles size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create Sales Lead from Query</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adds customer into CRM Lead Pipeline</p>
                </div>
              </div>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setConvertingQueryId(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Estimated Deal Value ({activeOrg.currency})</label>
                <input
                  type="number"
                  value={queryEstimatedValue}
                  onChange={e => setQueryEstimatedValue(e.target.value)}
                  className="input-glass"
                  placeholder="5000"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lead Urgency / Priority</label>
                <select
                  value={queryPriority}
                  onChange={e => setQueryPriority(e.target.value as any)}
                  className="input-glass"
                >
                  <option value="urgent" style={{ background: '#0f172a' }}>Urgent 🔥</option>
                  <option value="high" style={{ background: '#0f172a' }}>High</option>
                  <option value="medium" style={{ background: '#0f172a' }}>Medium</option>
                  <option value="low" style={{ background: '#0f172a' }}>Low</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-glass" onClick={() => setConvertingQueryId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleExecuteQueryConversion(convertingQueryId)}>
                <CheckCircle2 size={16} /> Confirm & Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Lead Scoring Inspection Modal */}
      {inspectScoreLead && (
        <div className="modal-backdrop" onClick={() => setInspectScoreLead(null)}>
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-gradient)' }}>
                  <Sparkles size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Lead Score Breakdown</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inspectScoreLead.name} • {inspectScoreLead.interestedService}</p>
                </div>
              </div>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setInspectScoreLead(null)}><X size={16} /></button>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Computed Intent Score</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--emerald)' }}>{inspectScoreLead.aiScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span></h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{inspectScoreLead.aiScoreReason}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.8rem' }}>Acquisition Channel: <strong>{inspectScoreLead.source}</strong></span>
                <span className="badge badge-emerald">+15 Pts</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.8rem' }}>Estimated Value: <strong>₹{inspectScoreLead.estimatedValue.toLocaleString('en-IN')}</strong></span>
                <span className="badge badge-emerald">{inspectScoreLead.estimatedValue > 10000 ? '+15 Pts' : '+10 Pts'}</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.8rem' }}>Urgency Level: <strong>{inspectScoreLead.priority.toUpperCase()}</strong></span>
                <span className={`badge ${inspectScoreLead.priority === 'urgent' ? 'badge-rose' : 'badge-amber'}`}>
                  {inspectScoreLead.priority === 'urgent' ? '+10 Pts (Urgent)' : '+5 Pts'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setInspectScoreLead(null)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Capture New Lead</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lead Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salim Merchant"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={newMobile}
                    onChange={e => setNewMobile(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="salim@example.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Company / Shop Name</label>
                  <input
                    type="text"
                    placeholder="Merchant Logistics"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lead Source Channel</label>
                  <select
                    value={newSource}
                    onChange={e => setNewSource(e.target.value as LeadSource)}
                    className="input-glass"
                  >
                    <option value="Instagram" style={{ background: '#0f172a' }}>Instagram (@DM / Reel)</option>
                    <option value="Facebook" style={{ background: '#0f172a' }}>Facebook (Lead Ads / Page)</option>
                    <option value="WhatsApp" style={{ background: '#0f172a' }}>WhatsApp</option>
                    <option value="Website" style={{ background: '#0f172a' }}>Website</option>
                    <option value="Walk-in" style={{ background: '#0f172a' }}>Walk-in</option>
                    <option value="Referral" style={{ background: '#0f172a' }}>Referral</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Social Handle / Profile (Optional)</label>
                  <input
                    type="text"
                    placeholder="@username or fb.com/profile"
                    value={newSocialHandle}
                    onChange={e => setNewSocialHandle(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Interested Service</label>
                  <select
                    value={newService}
                    onChange={e => setNewService(e.target.value)}
                    className="input-glass"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.name} style={{ background: '#0f172a' }}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Estimated Value ({activeOrg.currency})</label>
                  <input
                    type="number"
                    value={newEstValue}
                    onChange={e => setNewEstValue(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority Level</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  className="input-glass"
                >
                  <option value="urgent" style={{ background: '#0f172a' }}>Urgent 🔥</option>
                  <option value="high" style={{ background: '#0f172a' }}>High</option>
                  <option value="medium" style={{ background: '#0f172a' }}>Medium</option>
                  <option value="low" style={{ background: '#0f172a' }}>Low</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Notes / Initial Requirements</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="input-glass"
                  placeholder="Customer requirements, deadline or social query notes..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={16} /> Save & Calculate AI Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Convert Lead Modal */}
      {convertLead && (
        <div className="modal-backdrop" onClick={() => setConvertLead(null)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Convert Lead to Customer & Deal</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setConvertLead(null)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Converting <strong>{convertLead.name}</strong> will automatically:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--emerald)" />
                <span style={{ fontSize: '0.825rem' }}>Create official Customer Master Record with code</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--emerald)" />
                <span style={{ fontSize: '0.825rem' }}>Create Sales Deal for <strong>{convertLead.interestedService}</strong> (₹{convertLead.estimatedValue.toLocaleString('en-IN')})</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--emerald)" />
                <span style={{ fontSize: '0.825rem' }}>Retain social source ({convertLead.source}) and AI lead scoring context</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-glass" onClick={() => setConvertLead(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleExecuteConversion}>
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
