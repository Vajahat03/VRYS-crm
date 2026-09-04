import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavRoute } from '../../types';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  Layers,
  ShoppingBag,
  ReceiptText,
  CreditCard,
  TrendingDown,
  Store,
  CheckSquare,
  Calendar,
  MessageSquare,
  Bot,
  Zap,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  FileCheck,
  FolderOpen,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Database
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';

interface NavItem {
  id: NavRoute;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  adminOnly?: boolean;
}

export const Sidebar: React.FC = () => {
  const { currentRoute, setCurrentRoute, activeOrg, currentUser, refreshTrigger, logout } = useApp();

  const leads = dataStore.getLeads(activeOrg.id);
  const pendingJobs = dataStore.getJobs(activeOrg.id).filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
  const pendingTasks = dataStore.getTasks(activeOrg.id).filter(t => t.status !== 'Completed');
  const expiringDocs = dataStore.getExpiringDocuments(activeOrg.id, 30);
  const quotes = dataStore.getQuotes(activeOrg.id);
  const overdueInvoices = dataStore.getOverdueInvoices(activeOrg.id);

  const navItems: { group: string; items: NavItem[] }[] = [
    {
      group: 'Core CRM',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'leads', label: 'Leads Pipeline', icon: UserCheck, badge: leads.length, badgeColor: 'badge-indigo' },
        { id: 'contacts', label: 'Contacts & Accounts', icon: Users },
        { id: 'customers', label: 'Customer 360°', icon: Sparkles },
        { id: 'deals', label: 'Sales Deals', icon: Briefcase }
      ]
    },
    {
      group: 'Operations',
      items: [
        { id: 'jobs', label: 'Job Manager', icon: Layers, badge: pendingJobs.length, badgeColor: 'badge-amber' },
        { id: 'documents', label: 'Document Vault', icon: FolderOpen, badge: expiringDocs.length > 0 ? `${expiringDocs.length} Expiring` : undefined, badgeColor: 'badge-rose' },
        { id: 'products', label: 'Services Catalog', icon: ShoppingBag }
      ]
    },
    {
      group: 'Finance & Ledger',
      items: [
        { id: 'quotes', label: 'Quotes & Estimates', icon: FileCheck, badge: quotes.length, badgeColor: 'badge-indigo' },
        { id: 'invoices', label: 'Invoices & Billing', icon: ReceiptText, badge: overdueInvoices.length > 0 ? `${overdueInvoices.length} Due` : undefined, badgeColor: 'badge-rose' },
        { id: 'payments', label: 'Payment Receipts', icon: CreditCard },
        { id: 'kirkol', label: 'Counter Sales (Kirkol)', icon: Store, badge: 'Fast', badgeColor: 'badge-cyan' },
        { id: 'expenses', label: 'Expense Tracker', icon: TrendingDown }
      ]
    },
    {
      group: 'Productivity & AI',
      items: [
        { id: 'tasks', label: 'Tasks & Follow-ups', icon: CheckSquare, badge: pendingTasks.length, badgeColor: 'badge-rose' },
        { id: 'calendar', label: 'Calendar View', icon: Calendar },
        { id: 'communications', label: 'WhatsApp & Messages', icon: MessageSquare },
        { id: 'ai', label: 'VRYS AI Copilot', icon: Bot, badge: 'AI', badgeColor: 'badge-indigo' },
        { id: 'automation', label: 'Automation Rules', icon: Zap }
      ]
    },
    {
      group: 'System & Admin',
      items: [
        { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp },
        { id: 'cloud_sync', label: 'Cloud Database & Sync', icon: Database, badge: 'Supabase', badgeColor: 'badge-emerald' },
        { id: 'admin', label: 'VRYS Platform Admin', icon: ShieldCheck, badge: 'Owner', badgeColor: 'badge-amber' },
        { id: 'settings', label: 'Settings & Profile', icon: Settings }
      ]
    }
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      height: '100vh',
      background: 'var(--bg-surface-1)',
      backdropFilter: 'var(--backdrop-blur)',
      WebkitBackdropFilter: 'var(--backdrop-blur)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
      position: 'relative'
    }}>
      {/* Brand Logo Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        borderBottom: '1px solid var(--border-glass-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setCurrentRoute('dashboard')}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
              VRYS <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>OS</span>
            </h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Business Intelligence</p>
          </div>
        </div>

        <div className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
          v1.0
        </div>
      </div>

      {/* Organization Badge Card */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <div className="glass-card" style={{ padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {activeOrg.name.charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeOrg.name}
            </p>
            <p style={{ fontSize: '0.675rem', color: 'var(--emerald)' }}>
              ● {activeOrg.plan.toUpperCase()} PLAN
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links Scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {navItems.map((group, gIdx) => (
          <div key={gIdx}>
            <p style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-dim)',
              padding: '0.25rem 0.5rem',
              marginBottom: '0.25rem'
            }}>
              {group.group}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map(item => {
                const isActive = currentRoute === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentRoute(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--primary-gradient)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-main)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      fontWeight: isActive ? 600 : 500,
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      boxShadow: isActive ? '0 4px 15px -2px var(--primary-glow)' : 'none'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--bg-glass-hover)';
                        e.currentTarget.style.color = 'var(--text-highlight)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-main)';
                      }
                    }}
                  >
                    <IconComponent size={17} style={{ opacity: isActive ? 1 : 0.8 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`badge ${isActive ? 'badge-indigo' : item.badgeColor || 'badge-indigo'}`} style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        background: isActive ? 'rgba(255, 255, 255, 0.25)' : undefined,
                        color: isActive ? '#ffffff' : undefined
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile Card */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--border-glass-subtle)',
        background: 'rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#fff'
          }}>
            {currentUser.name.charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </p>
            <p style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              {currentUser.roleName}
            </p>
          </div>
          <button
            onClick={logout}
            className="btn btn-glass btn-icon"
            style={{ width: '32px', height: '32px', borderRadius: '50%', color: 'var(--rose)' }}
            title="Sign Out of Workspace"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
