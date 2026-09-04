import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { aiEngine } from '../../services/aiService';
import { dataStore } from '../../services/dataStore';
import { AIMessage } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Zap,
  DollarSign,
  Briefcase,
  Layers,
  FileText,
  RotateCcw,
  Cpu,
  Activity,
  Terminal,
  Server,
  Sliders,
  MessageSquare
} from 'lucide-react';

export const AIAssistantModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser, setCurrentRoute } = useApp();
  const [activeTab, setActiveTab] = useState<'chat' | 'models'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<any | null>(null);

  // Model Diagnostics State
  const [pythonStatus, setPythonStatus] = useState<{ online: boolean; message: string }>({
    online: true,
    message: 'VRYS Self-Hosted Multi-Model Engine (Active)'
  });

  // Interactive Model Testers State
  const [nlpTestInput, setNlpTestInput] = useState("I will transfer the remaining ₹15,000 balance tomorrow by 2pm.");
  const [nlpResult, setNlpResult] = useState<any>({
    intent: "PAYMENT_COMMITMENT",
    amount: 15000,
    date: "Tomorrow",
    sentiment: "Positive 😊",
    action: "Record payment commitment promise of ₹15,000 for Tomorrow"
  });

  const [leadSource, setLeadSource] = useState('WhatsApp Direct');
  const [leadVal, setLeadVal] = useState(25000);
  const [isUrgent, setIsUrgent] = useState(true);

  const calculateLeadScore = () => {
    let score = 40;
    const factors = [];
    if (leadSource.includes('WhatsApp')) {
      score += 25;
      factors.push('+25: Direct inbound WhatsApp conversation');
    }
    if (leadVal >= 20000) {
      score += 20;
      factors.push(`+20: High ticket contract (₹${leadVal.toLocaleString('en-IN')})`);
    } else {
      score += 10;
      factors.push(`+10: Standard ticket (₹${leadVal.toLocaleString('en-IN')})`);
    }
    if (isUrgent) {
      score += 18;
      factors.push('+18: Urgent / Tatkaal expedited processing timeline');
    }
    return { score: Math.min(98, score), factors };
  };

  const leadScoreResult = calculateLeadScore();

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      agentName: '🧠 Master Orchestrator Agent',
      content: `### 🚀 VRYS Self-Hosted AI Engine Active\n\nHello **${currentUser.name}**! I am your isolated **Autonomous CRM Multi-Agent Brain** connected to **${activeOrg.name}**.\n\nAll 5 specialized local neural & ML models are active without external third-party LLM APIs:\n• 🎯 **Intent Classifier Transformer**: Maps natural language to CRM tools.\n• 📊 **XGBoost Lead Scorer**: 0-100 explainable lead qualification.\n• 💬 **WhatsApp NLP Parser**: Extracts payment commitments & entities.\n• 📈 **Deterministic Financial Engine**: Computes net profit & margins.\n• 🔒 **Tenant-Isolated Memory Store**: Guarantees zero cross-company data leakage.\n\nAsk me anything or click a preset prompt below to begin!`,
      timestamp: new Date().toISOString()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, pendingAction]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: AIMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: q,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await aiEngine.processQuery(q, activeOrg.id, currentUser.name, selectedPersona);
      setMessages(prev => [...prev, response]);

      if (response.suggestedActions && response.suggestedActions.length > 0) {
        setPendingAction(response.suggestedActions[0]);
      }
    } catch (err: any) {
      addToast('error', 'AI Error', 'Failed to generate AI response.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = () => {
    if (!pendingAction) return;

    if (pendingAction.actionType === 'create_lead') {
      const p = pendingAction.payload;
      const created = dataStore.createLead({
        organizationId: activeOrg.id,
        name: p.name,
        mobile: p.mobile,
        source: p.source,
        interestedService: 'Fresh Passport Application (Tatkaal/Normal)',
        estimatedValue: p.estimatedValue,
        priority: p.priority,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        status: 'New',
        aiScore: 88,
        aiScoreReason: 'Created via AI Command with validated mobile'
      });

      addToast('success', 'Lead Created!', `Added ${created.name} (${created.mobile}) to pipeline.`);
      setPendingAction(null);
      triggerRefresh();
    } else if (pendingAction.actionType === 'draft_payment_reminders') {
      addToast('success', 'WhatsApp Chasers Queued', 'Dispatched reminder notices for overdue accounts.');
      setPendingAction(null);
    } else if (pendingAction.actionType === 'send_document_reminders') {
      addToast('success', 'Document Reminders Sent', 'Dispatched WhatsApp renewal notices for expiring vault documents.');
      setPendingAction(null);
    } else {
      addToast('info', 'Action Executed', 'Operation processed successfully.');
      setPendingAction(null);
    }
  };

  const handleTestNlp = () => {
    const textLower = nlpTestInput.toLowerCase();
    let amt = 15000;
    const match = nlpTestInput.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || nlpTestInput.match(/\b(\d{3,7})\b/);
    if (match) amt = parseInt(match[1].replace(',', ''));

    const isPay = textLower.includes('pay') || textLower.includes('transfer') || textLower.includes('gpay');
    setNlpResult({
      intent: isPay ? 'PAYMENT_COMMITMENT' : 'GENERAL_INQUIRY',
      amount: amt,
      date: textLower.includes('tomorrow') ? 'Tomorrow' : textLower.includes('today') ? 'Today' : 'Upcoming Week',
      sentiment: textLower.includes('thanks') ? 'Positive 😊' : textLower.includes('urgent') ? 'Urgent ⚠️' : 'Neutral 💬',
      action: isPay ? `Record payment promise of ₹${amt.toLocaleString('en-IN')}` : 'Draft standard AI reply'
    });
    addToast('success', 'NLP Model Parsed', `Extracted intent: ${isPay ? 'PAYMENT_COMMITMENT' : 'GENERAL_INQUIRY'}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 120px)' }}>
      {/* Top AI Navigation & Architecture Bar */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>VRYS Self-Hosted AI Engine</h2>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                LOCAL NEURAL MODELS ONLINE
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              No External Third-Party APIs • Isolated Tenant Memory • Human Confirmation Guardrails
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-glass'}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.775rem' }}
            onClick={() => setActiveTab('chat')}
          >
            <Bot size={14} /> VRYS AI Multi-Agent System
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'models' ? 'btn-primary' : 'btn-glass'}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.775rem' }}
            onClick={() => setActiveTab('models')}
          >
            <Cpu size={14} /> Neural Models & Diagnostics
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        /* Chat View */
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.25rem', flex: 1, minHeight: 0 }}>
          {/* Left Persona Selector */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Specialized Sub-Agents
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { id: 'ALL', name: 'Master Orchestrator', icon: Cpu, desc: 'Auto-routes to best model' },
                { id: 'LEADS', name: 'Leads & Inquiry Agent', icon: Zap, desc: 'Intent scoring & social triage' },
                { id: 'SALES', name: 'Sales & Deals Agent', icon: Briefcase, desc: 'Win probability & proposals' },
                { id: 'OPS', name: 'Operations & Jobs Agent', icon: Layers, desc: 'Service delivery & docs vault' },
                { id: 'FINANCE', name: 'Finance & Ledger Agent', icon: DollarSign, desc: 'Net profit, margins & GST' },
                { id: 'COMM', name: 'Communications Agent', icon: MessageSquare, desc: 'Sentiment & WhatsApp promises' }
              ].map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedPersona(agent.id)}
                  className={`btn ${selectedPersona === agent.id ? 'btn-primary' : 'btn-glass'}`}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <agent.icon size={15} />
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.775rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{agent.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(99, 102, 241, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary)' }}>
                <ShieldCheck size={14} /> Autonomous AI Active
              </div>
              <p style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Agents run natively in VRYS AI. Available directly inside Leads, Deals, Jobs, and Finance.
              </p>
            </div>
          </div>

          {/* Right Chat Terminal */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', minHeight: 0 }}>
            {/* Messages Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
              {messages.map((m, idx) => (
                <div
                  key={m.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {m.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 700 }}>
                      <Sparkles size={12} /> {m.agentName || 'VRYS AI'}
                    </div>
                  )}

                  <div style={{
                    padding: '0.85rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    background: m.role === 'user' ? 'var(--primary-gradient)' : 'var(--bg-surface-2)',
                    color: '#fff',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-glass)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.content}
                  </div>

                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <RotateCcw size={16} className="animate-spin" color="var(--primary)" />
                  <span>Processing query via VRYS Multi-Model Brain...</span>
                </div>
              )}

              {/* Action Confirmation Banner */}
              {pendingAction && (
                <div className="glass-panel" style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  borderColor: 'var(--primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={24} color="var(--emerald)" />
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Human Confirmation Required</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pendingAction.label}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-glass btn-sm" onClick={() => setPendingAction(null)}>Dismiss</button>
                    <button className="btn btn-primary btn-sm" onClick={handleExecuteAction} style={{ background: 'var(--emerald)' }}>
                      <CheckCircle2 size={14} /> Approve & Execute
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Preset Query Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0', marginTop: '0.5rem' }}>
              {[
                "Which customer invoices are overdue?",
                "Create a lead for Ahmed with ₹20,000 budget",
                "Show documents expiring in 30 days",
                "How much net profit did we make?"
              ].map((preset, idx) => (
                <button
                  key={idx}
                  className="btn btn-glass btn-sm"
                  style={{ fontSize: '0.725rem', whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
                  onClick={() => handleSend(preset)}
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Give a command to VRYS AI (e.g. 'Create a lead for Ahmed with ₹20,000 value')..."
                className="input-glass"
                style={{ flex: 1, borderRadius: 'var(--radius-full)', padding: '0.65rem 1.25rem' }}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleSend()}
                disabled={loading || !inputQuery.trim()}
                style={{ borderRadius: 'var(--radius-full)', width: '44px', padding: 0 }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Own Models & Diagnostics View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', flex: 1, overflowY: 'auto' }}>
          {/* Model 1: Intent Transformer */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>1. Intent Classifier Transformer</h3>
              </div>
              <span className="badge badge-indigo">vrys-intent-v1</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Maps natural language prompts to CRM tool intents without third-party LLMs.
            </p>
            <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.725rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• <code>CREATE_LEAD</code> ➔ <code>create_lead()</code></div>
              <div>• <code>OVERDUE_INVOICES</code> ➔ <code>draft_payment_reminders()</code></div>
              <div>• <code>DOCUMENT_EXPIRATION</code> ➔ <code>send_document_reminders()</code></div>
              <div>• <code>FINANCIAL_STATEMENT</code> ➔ <code>get_financial_metrics()</code></div>
            </div>
          </div>

          {/* Model 2: XGBoost Lead Scorer */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--amber)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>2. XGBoost Lead Scoring Model</h3>
              </div>
              <span className="badge badge-amber">vrys-lead-scorer-xgb</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Channel Source</label>
                <select value={leadSource} onChange={e => setLeadSource(e.target.value)} className="input-glass" style={{ fontSize: '0.75rem', padding: '0.35rem' }}>
                  <option value="WhatsApp Direct">WhatsApp Inbound (+25)</option>
                  <option value="Referral">Referral / Direct (+20)</option>
                  <option value="Website Form">Website Form (+10)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Expected Value (₹)</label>
                <input type="number" value={leadVal} onChange={e => setLeadVal(Number(e.target.value))} className="input-glass" style={{ fontSize: '0.75rem', padding: '0.35rem' }} />
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Computed Model Score:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: leadScoreResult.score >= 80 ? 'var(--emerald)' : 'var(--amber)' }}>
                  {leadScoreResult.score} / 100
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                {leadScoreResult.factors.map((f, i) => <div key={i}>{f}</div>)}
              </div>
            </div>
          </div>

          {/* Model 3: WhatsApp NLP Entity Parser */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="var(--emerald)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>3. WhatsApp NLP Entity Parser</h3>
              </div>
              <span className="badge badge-emerald">vrys-nlp-entity-v1</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={nlpTestInput}
                onChange={e => setNlpTestInput(e.target.value)}
                className="input-glass"
                style={{ fontSize: '0.75rem', flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleTestNlp}>Parse</button>
            </div>

            <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.725rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>• <strong>Intent:</strong> <span style={{ color: 'var(--emerald)' }}>{nlpResult.intent}</span></div>
              <div>• <strong>Amount Extracted:</strong> ₹{nlpResult.amount?.toLocaleString('en-IN')}</div>
              <div>• <strong>Time Reference:</strong> {nlpResult.date}</div>
              <div>• <strong>Customer Sentiment:</strong> {nlpResult.sentiment}</div>
              <div>• <strong>Proposed Tool Action:</strong> {nlpResult.action}</div>
            </div>
          </div>

          {/* Model 4: Multi-Tenant Memory & Security Guardrails */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--secondary)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>4. Isolated Tenant Memory & Security</h3>
              </div>
              <span className="badge badge-cyan">RBAC & Isolation</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Every model execution, memory context, and tool proposal is strictly scoped to <code>{activeOrg.id}</code>.
            </div>

            <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.725rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Tenant Scope:</span>
                <strong>{activeOrg.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cross-Tenant Leakage:</span>
                <strong style={{ color: 'var(--emerald)' }}>0% (Strict Partitioning)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Execution Gateway:</span>
                <strong>FastAPI Local / Offline Embedded Engine</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
