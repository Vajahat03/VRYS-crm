import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Deal, DealStage } from '../../types';
import { Briefcase, Plus, Search, Sparkles, X, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DealsModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [selectedPipelineId, setSelectedPipelineId] = useState('pipe_default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [lostDeal, setLostDeal] = useState<Deal | null>(null);
  const [lostReason, setLostReason] = useState('Price Competitor');

  // Drag & drop state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  // New Deal State
  const [dealTitle, setDealTitle] = useState('');
  const [dealCustId, setDealCustId] = useState('');
  const [dealValue, setDealValue] = useState('25000');
  const [dealStage, setDealStage] = useState<DealStage>('Discovery');
  const [dealProbability, setDealProbability] = useState('50');

  const deals = dataStore.getDeals(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);

  const pipelines = [
    { id: 'pipe_default', name: 'Retail & Government Services Pipeline' },
    { id: 'pipe_b2b', name: 'B2B Corporate Compliance & Retainers' },
    { id: 'pipe_digital', name: 'Digital & Software Solutions' }
  ];

  const stages: DealStage[] = [
    'Discovery',
    'Proposal Sent',
    'Negotiation',
    'Contract Sent',
    'Closed Won',
    'Closed Lost'
  ];

  const filteredDeals = deals.filter(d => d.pipelineId === selectedPipelineId || selectedPipelineId === 'pipe_default');

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === dealCustId);
    if (!cust) {
      addToast('error', 'Validation Error', 'Please select a customer.');
      return;
    }

    dataStore.createDeal({
      organizationId: activeOrg.id,
      customerId: cust.id,
      customerName: cust.name,
      title: dealTitle,
      pipelineId: selectedPipelineId,
      stage: dealStage,
      value: Number(dealValue) || 0,
      probability: Number(dealProbability) || 50,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      source: 'Direct Opportunity'
    });

    addToast('success', 'Deal Created', `Added ${dealTitle} to pipeline.`);
    setShowAddModal(false);
    setDealTitle('');
    triggerRefresh();
  };

  const handleStageChange = (dealId: string, nextStage: DealStage) => {
    if (nextStage === 'Closed Lost') {
      const d = deals.find(item => item.id === dealId);
      if (d) {
        setLostDeal(d);
        return;
      }
    }

    dataStore.updateDeal(dealId, {
      stage: nextStage,
      probability: nextStage === 'Closed Won' ? 100 : 70
    });
    addToast('info', 'Stage Moved', `Deal moved to ${nextStage}`);
    triggerRefresh();
  };

  const handleConfirmLost = () => {
    if (!lostDeal) return;
    dataStore.updateDeal(lostDeal.id, {
      stage: 'Closed Lost',
      probability: 0,
      lostReason
    });
    addToast('warning', 'Deal Closed Lost', `Recorded lost reason: "${lostReason}"`);
    setLostDeal(null);
    triggerRefresh();
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      handleStageChange(dealId, targetStage);
    }
    setDraggedDealId(null);
  };

  const totalPipelineValue = filteredDeals.reduce((s, d) => s + (d.stage !== 'Closed Lost' ? d.value : 0), 0);
  const weightedValue = filteredDeals.reduce((s, d) => s + (d.stage !== 'Closed Lost' ? (d.value * d.probability) / 100 : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Metric & Pipeline Switcher Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Pipeline Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Sales Pipeline:
            </span>
            <select
              value={selectedPipelineId}
              onChange={e => setSelectedPipelineId(e.target.value)}
              className="input-glass"
              style={{ width: '280px', height: '36px', fontSize: '0.8rem', fontWeight: 600 }}
            >
              {pipelines.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="glass-card" style={{ padding: '0.4rem 0.85rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Total Active Value</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-highlight)' }}>
                {activeOrg.currency} {totalPipelineValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass-card" style={{ padding: '0.4rem 0.85rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Weighted Forecast</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--emerald)' }}>
                {activeOrg.currency} {Math.round(weightedValue).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> New Sales Deal
        </button>
      </div>

      {/* Multi-Stage HTML5 Drag-and-Drop Kanban */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '1rem'
      }}>
        {stages.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage);
          const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              onDragOver={e => handleDragOver(e, stage)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={e => handleDrop(e, stage)}
              className="glass-panel"
              style={{
                background: isOver ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-1)',
                borderColor: isOver ? 'var(--primary)' : 'var(--border-glass)',
                boxShadow: isOver ? '0 0 25px var(--primary-glow)' : 'var(--shadow-md)',
                padding: '1rem',
                minHeight: '460px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-glass-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.825rem' }}>{stage}</span>
                  <span className="badge badge-indigo" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>{stageDeals.length}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  {activeOrg.currency}{stageTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={e => handleDragStart(e, deal.id)}
                    className="glass-card"
                    style={{ padding: '0.85rem', cursor: 'grab' }}
                  >
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                      {deal.title}
                    </h4>
                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{deal.customerName}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-glass-subtle)' }}>
                      <strong style={{ color: 'var(--emerald)', fontSize: '0.825rem' }}>
                        {activeOrg.currency} {deal.value.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {deal.probability}% Prob
                      </span>
                    </div>

                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <select
                        value={deal.stage}
                        onChange={e => handleStageChange(deal.id, e.target.value as DealStage)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '4px',
                          color: 'var(--text-dim)',
                          fontSize: '0.675rem',
                          padding: '2px 4px'
                        }}
                      >
                        {stages.map(st => (
                          <option key={st} value={st} style={{ background: '#0f172a' }}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loss Reason Prompt Modal */}
      {lostDeal && (
        <div className="modal-backdrop" onClick={() => setLostDeal(null)}>
          <div className="modal-content" style={{ padding: '1.5rem', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <AlertCircle size={22} color="var(--rose)" />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Record Closed Lost Reason</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lostDeal.title} (₹{lostDeal.value.toLocaleString('en-IN')})</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Why was this deal lost? *</label>
              <select
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                className="input-glass"
                style={{ marginTop: '4px' }}
              >
                <option value="Price Too High / Competitor Lower" style={{ background: '#0f172a' }}>Price Too High / Competitor Lower</option>
                <option value="Client Postponed Requirement" style={{ background: '#0f172a' }}>Client Postponed Requirement</option>
                <option value="Budget Constraint" style={{ background: '#0f172a' }}>Budget Constraint</option>
                <option value="Unresponsive to Follow-ups" style={{ background: '#0f172a' }}>Unresponsive to Follow-ups</option>
                <option value="Document Requirements Unmet" style={{ background: '#0f172a' }}>Document Requirements Unmet</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-glass" onClick={() => setLostDeal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmLost}>Confirm Closed Lost</button>
            </div>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Create New Sales Deal</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddDeal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Compliance Retainer 2026-27"
                  value={dealTitle}
                  onChange={e => setDealTitle(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Customer *</label>
                <select
                  required
                  value={dealCustId}
                  onChange={e => setDealCustId(e.target.value)}
                  className="input-glass"
                >
                  <option value="" style={{ background: '#0f172a' }}>-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name} ({c.customerCode})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Deal Value ({activeOrg.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={dealValue}
                    onChange={e => setDealValue(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Stage</label>
                  <select
                    value={dealStage}
                    onChange={e => setDealStage(e.target.value as DealStage)}
                    className="input-glass"
                  >
                    {stages.map(st => (
                      <option key={st} value={st} style={{ background: '#0f172a' }}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
