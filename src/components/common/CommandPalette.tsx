import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import {
  Search,
  UserCheck,
  Users,
  Layers,
  ReceiptText,
  Briefcase,
  Store,
  Plus,
  Bot,
  ArrowRight,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  onOpenQuickModal: (type: 'lead' | 'customer' | 'job' | 'payment' | 'kirkol') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onOpenQuickModal }) => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, activeOrg, setCurrentRoute, setSelectedCustomerId } = useApp();
  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const leads = dataStore.getLeads(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);
  const jobs = dataStore.getJobs(activeOrg.id);
  const invoices = dataStore.getInvoices(activeOrg.id);

  const q = query.toLowerCase().trim();

  const filteredLeads = q ? leads.filter(l => l.name.toLowerCase().includes(q) || l.mobile.includes(q) || l.interestedService.toLowerCase().includes(q)) : leads.slice(0, 2);
  const filteredCustomers = q ? customers.filter(c => c.name.toLowerCase().includes(q) || c.mobile.includes(q) || c.customerCode.toLowerCase().includes(q)) : customers.slice(0, 2);
  const filteredJobs = q ? jobs.filter(j => j.jobNumber.toLowerCase().includes(q) || j.title.toLowerCase().includes(q) || j.customerName.toLowerCase().includes(q)) : jobs.slice(0, 2);
  const filteredInvoices = q ? invoices.filter(i => i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)) : invoices.slice(0, 2);

  const handleSelectRoute = (route: any) => {
    setCurrentRoute(route);
    setIsCommandPaletteOpen(false);
  };

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    setCurrentRoute('customers');
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsCommandPaletteOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '620px', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid var(--border-glass-highlight)'
        }}>
          <Search size={20} color="var(--primary)" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search customers, leads, jobs, invoices..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-highlight)',
              fontSize: '1rem',
              fontFamily: 'var(--font-main)'
            }}
          />
          <button
            className="btn btn-glass btn-icon btn-sm"
            onClick={() => setIsCommandPaletteOpen(false)}
            style={{ borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem' }}>
          {/* Quick Actions */}
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.675rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0.25rem 0.5rem' }}>
              Quick Actions
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <button
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => { setIsCommandPaletteOpen(false); onOpenQuickModal('lead'); }}
              >
                <Plus size={14} color="var(--primary)" /> New Lead
              </button>
              <button
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => { setIsCommandPaletteOpen(false); onOpenQuickModal('job'); }}
              >
                <Plus size={14} color="var(--amber)" /> New Job / Order
              </button>
              <button
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => { setIsCommandPaletteOpen(false); onOpenQuickModal('payment'); }}
              >
                <Plus size={14} color="var(--rose)" /> Record Payment
              </button>
              <button
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => handleSelectRoute('ai')}
              >
                <Bot size={14} color="var(--emerald)" /> Ask VRYS AI
              </button>
            </div>
          </div>

          {/* Customers Section */}
          {filteredCustomers.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.675rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0.25rem 0.5rem' }}>
                Customers
              </p>
              {filteredCustomers.map(c => (
                <div
                  key={c.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    marginBottom: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectCustomer(c.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Users size={16} color="var(--emerald)" />
                    <div>
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-highlight)' }}>{c.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.customerCode} • {c.mobile}</p>
                    </div>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>View 360°</span>
                </div>
              ))}
            </div>
          )}

          {/* Leads Section */}
          {filteredLeads.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.675rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0.25rem 0.5rem' }}>
                Leads
              </p>
              {filteredLeads.map(l => (
                <div
                  key={l.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    marginBottom: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectRoute('leads')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <UserCheck size={16} color="var(--indigo)" />
                    <div>
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-highlight)' }}>{l.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.interestedService} • {l.mobile}</p>
                    </div>
                  </div>
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{l.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Jobs Section */}
          {filteredJobs.length > 0 && (
            <div>
              <p style={{ fontSize: '0.675rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0.25rem 0.5rem' }}>
                Jobs & Orders
              </p>
              {filteredJobs.map(j => (
                <div
                  key={j.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    marginBottom: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectRoute('jobs')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Layers size={16} color="var(--amber)" />
                    <div>
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-highlight)' }}>{j.jobNumber} — {j.title}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Customer: {j.customerName} • Bal: ₹{j.balanceAmount}</p>
                    </div>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{j.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Shortcut hint */}
        <div style={{
          padding: '0.6rem 1rem',
          background: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid var(--border-glass-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: 'var(--text-dim)'
        }}>
          <span>Press <kbd style={{ padding: '1px 4px', background: 'var(--bg-glass)', borderRadius: '3px' }}>ESC</kbd> to exit</span>
          <span>VRYS Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};
