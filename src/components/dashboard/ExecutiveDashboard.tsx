import React from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import {
  TrendingUp,
  CreditCard,
  Layers,
  UserCheck,
  Store,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Users
} from 'lucide-react';

interface ExecutiveDashboardProps {
  onOpenQuickModal: (type: 'lead' | 'customer' | 'job' | 'payment' | 'kirkol') => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onOpenQuickModal }) => {
  const { activeOrg, setCurrentRoute, setSelectedCustomerId } = useApp();
  const metrics = dataStore.getFinancialMetrics(activeOrg.id);
  const leads = dataStore.getLeads(activeOrg.id);
  const jobs = dataStore.getJobs(activeOrg.id);
  const tasks = dataStore.getTasks(activeOrg.id).filter(t => t.status !== 'Completed');
  const activities = dataStore.getActivities(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);

  const pendingJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
  const wonLeads = leads.filter(l => l.status === 'Converted');
  const conversionRate = leads.length > 0 ? ((wonLeads.length / leads.length) * 100).toFixed(0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top AI Proactive Intelligence Banner */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>VRYS AI Autonomous Intelligence</h3>
              <span className="badge badge-emerald">Live Insights</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Monthly Net Profit margin is healthy at <strong>{metrics.businessIncome > 0 ? ((metrics.netProfit / metrics.businessIncome) * 100).toFixed(1) : 0}%</strong>.
              ₹{metrics.totalOutstanding.toLocaleString('en-IN')} in customer balances is ready for 1-click WhatsApp collection.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setCurrentRoute('ai')}>
            <Sparkles size={14} /> Ask VRYS AI
          </button>
          <button className="btn btn-glass btn-sm" onClick={() => setCurrentRoute('payments')}>
            View Receivables
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Net Profit Card */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Net Business Profit
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-xs)', background: 'rgba(16, 185, 129, 0.15)' }}>
              <TrendingUp size={18} color="var(--emerald)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald)' }}>
            {activeOrg.currency} {metrics.netProfit.toLocaleString('en-IN')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <span>Income: {activeOrg.currency}{metrics.businessIncome.toLocaleString('en-IN')}</span>
            <span>•</span>
            <span>Spending: {activeOrg.currency}{metrics.businessSpending.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Customer Service Profit */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Service Profit
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-xs)', background: 'rgba(99, 102, 241, 0.15)' }}>
              <DollarSign size={18} color="var(--indigo)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-highlight)' }}>
            {activeOrg.currency} {metrics.customerServiceProfit.toLocaleString('en-IN')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <span>Jobs Vol: {activeOrg.currency}{metrics.totalJobAmount.toLocaleString('en-IN')}</span>
            <span>•</span>
            <span>Cost: {activeOrg.currency}{metrics.totalWorkExpense.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Kirkol / Counter Sales */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Counter Sales (Kirkol)
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-xs)', background: 'rgba(6, 182, 212, 0.15)' }}>
              <Store size={18} color="var(--secondary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {activeOrg.currency} {metrics.kirkolRevenue.toLocaleString('en-IN')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <span>Printing, Xerox, Tickets</span>
            <span>•</span>
            <button
              onClick={() => onOpenQuickModal('kirkol')}
              style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
            >
              + Quick Add
            </button>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Outstanding Balance
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-xs)', background: 'rgba(244, 63, 94, 0.15)' }}>
              <AlertTriangle size={18} color="var(--rose)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--rose)' }}>
            {activeOrg.currency} {metrics.totalOutstanding.toLocaleString('en-IN')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <span>Collected: {activeOrg.currency}{metrics.totalCollected.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Operational Pipeline + Today's Agenda */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Active Jobs & Operational Status */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>In-Flight Operations & Jobs</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live status of customer jobs & services</p>
            </div>
            <button className="btn btn-glass btn-sm" onClick={() => setCurrentRoute('jobs')}>
              View All ({jobs.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.slice(0, 4).map(j => {
              const isUrgent = j.priority === 'urgent';
              const isReady = j.status === 'Ready';

              return (
                <div key={j.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: isReady ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Layers size={18} color={isReady ? 'var(--emerald)' : 'var(--primary)'} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
                        {j.title}
                      </p>
                      <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {j.customerName} • <strong>{j.jobNumber}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${isReady ? 'badge-emerald' : isUrgent ? 'badge-rose' : 'badge-amber'}`}>
                      {j.status}
                    </span>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>
                      {activeOrg.currency} {j.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Tasks & Urgent Follow-ups */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Today's Follow-ups & Agenda</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tasks.length} pending actionable items</p>
            </div>
            <button className="btn btn-glass btn-sm" onClick={() => setCurrentRoute('tasks')}>
              View Calendar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.slice(0, 4).map(t => (
              <div key={t.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clock size={18} color="var(--rose)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
                      {t.title}
                    </p>
                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Assigned: {t.assignedToName} • Priority: <span style={{ color: 'var(--rose)', textTransform: 'capitalize' }}>{t.priority}</span>
                    </p>
                  </div>
                </div>

                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    dataStore.updateTask(t.id, { status: 'Completed', completedAt: new Date().toISOString() });
                  }}
                  title="Mark Completed"
                >
                  <CheckCircle2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High-Value Customers & Quick Actions */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>High-Value VIP Customers</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customers with highest lifetime value & repeat engagements</p>
          </div>
          <button className="btn btn-glass btn-sm" onClick={() => setCurrentRoute('customers')}>
            View All ({customers.length})
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {customers.map(c => (
            <div
              key={c.id}
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedCustomerId(c.id);
                setCurrentRoute('customers');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{c.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.companyName || 'Personal'}</p>
                </div>
                <span className={`badge ${c.status === 'vip' ? 'badge-indigo' : c.status === 'at_risk' ? 'badge-rose' : 'badge-emerald'}`}>
                  {c.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass-subtle)', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Lifetime Revenue</span>
                  <p style={{ fontWeight: 700, color: 'var(--emerald)' }}>{activeOrg.currency} {c.lifetimeValue.toLocaleString('en-IN')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Outstanding</span>
                  <p style={{ fontWeight: 700, color: c.outstandingAmount > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                    {activeOrg.currency} {c.outstandingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
