import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Lead, LeadStatus, LeadSource } from '../../types';
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
  Info
} from 'lucide-react';

export const LeadsModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [inspectScoreLead, setInspectScoreLead] = useState<Lead | null>(null);

  // Drag-and-drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newService, setNewService] = useState('Fresh Passport Application (Tatkaal/Normal)');
  const [newSource, setNewSource] = useState<LeadSource>('WhatsApp');
  const [newEstValue, setNewEstValue] = useState('2000');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newNotes, setNewNotes] = useState('');

  const leads = dataStore.getLeads(activeOrg.id);
  const products = dataStore.getProducts(activeOrg.id);

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.mobile.includes(searchQuery) ||
      (lead.companyName && lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;
    return matchesSearch && matchesSource && matchesPriority;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile) {
      addToast('error', 'Validation Error', 'Name and mobile number are required.');
      return;
    }

    // Dynamic AI Lead Scoring simulation
    let aiScore = 60;
    if (newSource === 'WhatsApp' || newSource === 'Website') aiScore += 15;
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
      interestedService: newService,
      estimatedValue: Number(newEstValue) || 0,
      priority: newPriority,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      status: 'New',
      aiScore,
      aiScoreReason: `High initial intent from ${newSource} with estimated value ₹${Number(newEstValue).toLocaleString('en-IN')}`,
      notes: newNotes
    });

    addToast('success', 'Lead Captured', `Successfully created lead for ${newName} (AI Score: ${aiScore}/100)`);
    setShowAddModal(false);
    setNewName('');
    setNewMobile('');
    setNewEmail('');
    setNewCompany('');
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
      tags: ['Converted Lead', convertLead.source],
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
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.8rem' }}
            />
          </div>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="input-glass"
            style={{ width: '140px', height: '36px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Sources</option>
            <option value="Walk-in">Walk-in</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="input-glass"
            style={{ width: '130px', height: '36px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="urgent">Urgent 🔥</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* View Switcher */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
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

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> New Lead
          </button>
        </div>
      </div>

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
                          borderLeft: isUrgent ? '3px solid var(--rose)' : undefined
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                              {lead.name}
                            </h4>
                            {lead.companyName && (
                              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{lead.companyName}</p>
                            )}
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
                          <p style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} /> {lead.mobile}
                          </p>
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
                <th>Lead Name</th>
                <th>Service & Est. Value</th>
                <th>Source</th>
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
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{lead.mobile} • {lead.companyName || 'Individual'}</span>
                  </td>
                  <td>
                    <p style={{ fontWeight: 500 }}>{lead.interestedService}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 700 }}>
                      {activeOrg.currency} {lead.estimatedValue.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-indigo">{lead.source}</span>
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
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lead Source</label>
                  <select
                    value={newSource}
                    onChange={e => setNewSource(e.target.value as LeadSource)}
                    className="input-glass"
                  >
                    <option value="WhatsApp" style={{ background: '#0f172a' }}>WhatsApp</option>
                    <option value="Walk-in" style={{ background: '#0f172a' }}>Walk-in</option>
                    <option value="Website" style={{ background: '#0f172a' }}>Website</option>
                    <option value="Instagram" style={{ background: '#0f172a' }}>Instagram</option>
                    <option value="Referral" style={{ background: '#0f172a' }}>Referral</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Estimated Value ({activeOrg.currency})</label>
                  <input
                    type="number"
                    value={newEstValue}
                    onChange={e => setNewEstValue(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="input-glass"
                  >
                    <option value="low" style={{ background: '#0f172a' }}>Low</option>
                    <option value="medium" style={{ background: '#0f172a' }}>Medium</option>
                    <option value="high" style={{ background: '#0f172a' }}>High</option>
                    <option value="urgent" style={{ background: '#0f172a' }}>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Notes / Requirements</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="input-glass"
                  placeholder="Customer requirements, deadline or specifics..."
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
                <span style={{ fontSize: '0.825rem' }}>Retain full audit history & AI lead scoring context</span>
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
