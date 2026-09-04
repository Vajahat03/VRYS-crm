import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Users,
  DollarSign,
  ArrowUpRight,
  Layers,
  Download,
  Calendar,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';

export const AnalyticsModule: React.FC = () => {
  const { activeOrg, addToast } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | 'month' | 'quarter' | 'year'>('month');

  const metrics = dataStore.getFinancialMetrics(activeOrg.id);
  const leads = dataStore.getLeads(activeOrg.id);
  const jobs = dataStore.getJobs(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);
  const products = dataStore.getProducts(activeOrg.id);
  const users = dataStore.getUsers(activeOrg.id);
  const tickets = dataStore.getTickets(activeOrg.id);

  // Performance calculations
  const completedJobs = jobs.filter(j => j.status === 'Completed' || j.status === 'Delivered');
  const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(0) : '0';
  const totalMarginPercent = metrics.businessIncome > 0 ? ((metrics.netProfit / metrics.businessIncome) * 100).toFixed(1) : '0';
  const avgJobValue = completedJobs.length > 0 ? (metrics.customerServiceProfit / completedJobs.length).toFixed(0) : '0';

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Organization', activeOrg.name],
      ['Customer Service Profit', `INR ${metrics.customerServiceProfit}`],
      ['Kirkol / Counter Revenue', `INR ${metrics.kirkolRevenue}`],
      ['Total Business Income', `INR ${metrics.businessIncome}`],
      ['Total Business Expenses', `INR ${metrics.businessSpending}`],
      ['Net Profit', `INR ${metrics.netProfit}`],
      ['Net Margin', `${totalMarginPercent}%`],
      ['Total Customers', customers.length],
      ['Total Jobs', jobs.length],
      ['Conversion Rate', `${conversionRate}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vrys_analytics_report_${activeOrg.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Report Exported', 'Downloaded Executive Analytics CSV summary.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Range Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Business Intelligence & Performance Analytics</h2>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Executive KPI tracking, profit margin matrix, operator throughput, and lead conversion health.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
            {(['today', 'month', 'quarter', 'year'] as const).map(range => (
              <button
                key={range}
                className="btn btn-sm"
                style={{
                  background: timeRange === range ? 'var(--primary)' : 'transparent',
                  color: timeRange === range ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  textTransform: 'capitalize'
                }}
                onClick={() => setTimeRange(range)}
              >
                {range === 'month' ? 'This Month' : range === 'today' ? 'Today' : range === 'quarter' ? 'Q3 2026' : 'FY 2026-27'}
              </button>
            ))}
          </div>

          <button className="btn btn-glass btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Net Business Profit */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Business Profit</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-highlight)' }}>
            ₹{metrics.netProfit.toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 700 }}>
            {totalMarginPercent}% Net Margin
          </span>
        </div>

        {/* Total Cash Collected */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Cash Collected</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>
            ₹{metrics.totalCollected.toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Across Invoices & Counter POS
          </span>
        </div>

        {/* Lead Conversion Rate */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lead Win Rate</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)' }}>
              <Award size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--secondary)' }}>
            {conversionRate}%
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>
            {leads.length} Total Opportunities
          </span>
        </div>

        {/* Average Profit Per Job */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Profit / Job</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)' }}>
              <Layers size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--amber)' }}>
            ₹{Number(avgJobValue).toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {completedJobs.length} Completed Operations
          </span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Service Profitability Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <BarChart3 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Service Profitability Matrix</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {products.map(p => {
              const margin = p.sellingPrice > 0 ? ((p.profit / p.sellingPrice) * 100).toFixed(0) : 0;

              return (
                <div key={p.id} className="glass-card" style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</p>
                    <span className="badge badge-emerald">{margin}% Margin</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span>Price: ₹{p.sellingPrice.toLocaleString('en-IN')}</span>
                    <span>Cost: ₹{p.internalCost.toLocaleString('en-IN')}</span>
                    <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>Profit: ₹{p.profit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operator Throughput & Efficiency Leaderboard */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Award size={20} color="var(--amber)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Operator Efficiency & SLA Leaderboard</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {users.map((u, uIdx) => {
              const userJobs = jobs.filter(j => j.assignedTo === u.id);
              const userCompleted = userJobs.filter(j => j.status === 'Completed' || j.status === 'Delivered').length;
              const userProfit = userJobs.reduce((sum, j) => sum + (j.totalAmount - j.workExpense), 0);

              return (
                <div key={u.id} className="glass-card" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: uIdx === 0 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'var(--bg-surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      color: '#fff'
                    }}>
                      #{uIdx + 1}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{u.name}</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.roleName} • {userCompleted} Completed Jobs</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--emerald)' }}>
                      ₹{userProfit.toLocaleString('en-IN')}
                    </span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Margin Generated</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Source Funnel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <PieChart size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Lead Acquisition Channels</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { source: 'WhatsApp Inquiries', count: 2, share: '50%', color: 'var(--emerald)' },
              { source: 'Website Demo Requests', count: 1, share: '25%', color: 'var(--secondary)' },
              { source: 'Walk-in Counter', count: 1, share: '25%', color: 'var(--primary)' }
            ].map((ch, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{ch.source}</span>
                  <span style={{ fontWeight: 700, color: ch.color }}>{ch.share}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: ch.share, background: ch.color, borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
