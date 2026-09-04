import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { AutomationRule } from '../../types';
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Mail,
  CheckSquare,
  Sparkles,
  X,
  Layers,
  Settings,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const AutomationModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [rules, setRules] = useState<AutomationRule[]>(dataStore.getAutomationRules(activeOrg.id));

  // New Rule Form
  const [ruleName, setRuleName] = useState('');
  const [triggerType, setTriggerType] = useState<any>('lead_created');
  const [actionType, setActionType] = useState<any>('send_whatsapp');
  const [templateText, setTemplateText] = useState('Hi {{name}}, thanks for contacting us! An executive has been assigned to your request.');

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r);
    setRules(updated);
    addToast('info', 'Rule Status Changed', 'Updated automation rule status.');
  };

  const handleTestRunRule = (rule: AutomationRule) => {
    // Increment execution count
    const updated = rules.map(r => r.id === rule.id ? { ...r, executionCount: r.executionCount + 1, lastExecutedAt: new Date().toISOString() } : r);
    setRules(updated);

    // Record system timeline event
    dataStore.recordActivity({
      organizationId: activeOrg.id,
      type: 'System Event',
      subject: `⚡ Automation Triggered: ${rule.name}`,
      description: `Executed action "${rule.actionType}" via trigger "${rule.trigger}"`,
      userId: currentUser.id,
      userName: 'VRYS Automation Engine',
      relatedType: 'lead',
      relatedId: 'rule_' + rule.id
    });

    addToast('success', 'Automation Executed! ⚡', `Successfully ran "${rule.name}" (Executions: ${rule.executionCount + 1})`);
    triggerRefresh();
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: AutomationRule = {
      id: 'auto_' + Date.now().toString(36),
      organizationId: activeOrg.id,
      name: ruleName,
      trigger: triggerType,
      actionType,
      actionConfig: {
        template: templateText
      },
      isActive: true,
      executionCount: 0
    };

    setRules([newRule, ...rules]);
    addToast('success', 'Automation Created', `Activated rule: ${ruleName}`);
    setShowAddModal(false);
    setRuleName('');
    triggerRefresh();
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'lead_created': return '📥 New Lead Arrives (WhatsApp/Web)';
      case 'payment_received': return '💰 Payment Transaction Received';
      case 'job_status_changed': return '📦 Job Marked "Ready" or "Delivered"';
      case 'invoice_overdue': return '🚨 Invoice Passes Due Date (>1 Day)';
      case 'document_expiring': return '⏳ Document Expires in < 30 Days';
      default: return trigger;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'send_whatsapp': return '💬 Send WhatsApp Notification';
      case 'send_email': return '📧 Dispatch Official Email';
      case 'create_task': return '📋 Auto-Create Operator Task';
      case 'ai_analysis': return '🧠 Trigger AI Qualification Scoring';
      default: return action;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Automations & Workflow Engine</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Autonomous 24/7 background event triggers, WhatsApp notifications, and task dispatchers.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> New Automation Rule
        </button>
      </div>

      {/* Rules Visual Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {rules.map(rule => (
          <div key={rule.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: rule.isActive ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-highlight)' }}>{rule.name}</h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    Total Executions: <strong style={{ color: 'var(--emerald)' }}>{rule.executionCount} times</strong>
                    {rule.lastExecutedAt && ` • Last ran ${new Date(rule.lastExecutedAt).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-glass btn-sm"
                  style={{ color: 'var(--emerald)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  onClick={() => handleTestRunRule(rule)}
                  title="Simulate rule execution right now"
                >
                  <Play size={13} fill="var(--emerald)" /> Test Run
                </button>

                <button
                  className={`btn btn-sm ${rule.isActive ? 'btn-success' : 'btn-glass'}`}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  onClick={() => handleToggleRule(rule.id)}
                >
                  {rule.isActive ? 'Active' : 'Paused'}
                </button>
              </div>
            </div>

            {/* Visual Workflow Path */}
            <div style={{
              background: 'var(--bg-surface-1)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              border: '1px solid var(--border-glass-subtle)'
            }}>
              {/* Trigger Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                  TRIGGER
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{getTriggerLabel(rule.trigger)}</span>
              </div>

              <ArrowRight size={18} color="var(--primary)" />

              {/* Condition Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                  CONDITION
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organization == Active Org</span>
              </div>

              <ArrowRight size={18} color="var(--emerald)" />

              {/* Action Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                  ACTION
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--emerald)' }}>{getActionLabel(rule.actionType)}</span>
              </div>
            </div>

            {/* Template Preview */}
            {rule.actionConfig?.template && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
                Message payload: "{rule.actionConfig.template}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Rule Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Zap size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create Workflow Automation</h3>
              </div>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instant WhatsApp Alert on Job Completed"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Trigger Event</label>
                  <select
                    value={triggerType}
                    onChange={e => setTriggerType(e.target.value)}
                    className="input-glass"
                  >
                    <option value="lead_created" style={{ background: '#0f172a' }}>New Lead Created</option>
                    <option value="payment_received" style={{ background: '#0f172a' }}>Payment Received</option>
                    <option value="job_status_changed" style={{ background: '#0f172a' }}>Job Status Marked Ready</option>
                    <option value="invoice_overdue" style={{ background: '#0f172a' }}>Invoice Overdue</option>
                    <option value="document_expiring" style={{ background: '#0f172a' }}>Document Expiring (&lt;30d)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Action to Execute</label>
                  <select
                    value={actionType}
                    onChange={e => setActionType(e.target.value as any)}
                    className="input-glass"
                  >
                    <option value="send_whatsapp" style={{ background: '#0f172a' }}>Send WhatsApp Message</option>
                    <option value="create_task" style={{ background: '#0f172a' }}>Create Operator Task</option>
                    <option value="ai_analysis" style={{ background: '#0f172a' }}>Run AI Intent Analysis</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Message / Task Template</label>
                <textarea
                  rows={3}
                  value={templateText}
                  onChange={e => setTemplateText(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Activate Automation Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
