import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Building2,
  User,
  Shield,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Zap,
  CreditCard,
  UserPlus,
  Layers,
  Store,
  LogOut
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';

interface TopNavbarProps {
  onOpenQuickModal: (type: 'lead' | 'customer' | 'job' | 'payment' | 'kirkol') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenQuickModal }) => {
  const {
    activeOrg,
    setActiveOrg,
    currentUser,
    setCurrentUser,
    theme,
    toggleTheme,
    setIsCommandPaletteOpen,
    currentRoute,
    setCurrentRoute,
    logout
  } = useApp();

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const orgs = isSuperAdmin ? dataStore.getOrganizations() : [activeOrg];
  const availableUsers = isSuperAdmin ? dataStore.getUsers('ALL') : dataStore.getUsers(activeOrg.id);
  const notifications = dataStore.getNotifications(activeOrg.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const getPageTitle = () => {
    switch (currentRoute) {
      case 'dashboard': return 'Executive Command Center';
      case 'leads': return 'Leads & Inquiries Pipeline';
      case 'customers': return 'Customer 360° Management';
      case 'deals': return 'Sales Deals & Pipelines';
      case 'jobs': return 'Operations & Job Tracking';
      case 'products': return 'Products & Services Catalog';
      case 'invoices': return 'Invoices & Billing';
      case 'payments': return 'Payments & Receipts';
      case 'kirkol': return 'Counter Sales (Kirkol Fast-Entry)';
      case 'expenses': return 'Business Expenses';
      case 'tasks': return 'Tasks & Follow-up Agenda';
      case 'calendar': return 'Interactive Calendar';
      case 'communications': return 'WhatsApp & Communications';
      case 'tickets': return 'Support Tickets';
      case 'automation': return 'Workflow Automation Engine';
      case 'ai': return 'VRYS AI Multi-Agent Copilot';
      case 'analytics': return 'Financial & Sales Analytics';
      case 'admin': return 'VRYS SaaS Platform Admin';
      case 'settings': return 'System Settings';
      default: return 'VRYS CRM';
    }
  };

  return (
    <header className="glass-nav" style={{
      height: '68px',
      padding: '0 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 15,
      position: 'relative'
    }}>
      {/* Page Title & Route */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getPageTitle()}
        </h1>
        <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          Workspace: <strong style={{ color: 'var(--text-main)' }}>{activeOrg.name}</strong> • City: {activeOrg.city}
        </p>
      </div>

      {/* Global Search Command Bar Trigger */}
      <div style={{ flex: 1, maxWidth: '420px', margin: '0 2rem' }}>
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
            padding: '0.5rem 1rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.825rem',
            backdropFilter: 'var(--backdrop-blur-light)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Search size={16} color="var(--primary)" />
            <span>Search leads, customers, jobs, invoices...</span>
          </div>
          <kbd style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-glass)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)'
          }}>
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Action Controls & Profile Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Quick Add Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 0.95rem' }}
          >
            <Plus size={16} />
            <span>Quick Action</span>
            <ChevronDown size={14} />
          </button>

          {showQuickMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '210px',
              padding: '0.5rem',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <button
                className="btn btn-glass btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '4px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('lead'); }}
              >
                <UserPlus size={15} color="var(--indigo)" /> New Lead
              </button>
              <button
                className="btn btn-glass btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '4px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('customer'); }}
              >
                <User size={15} color="var(--emerald)" /> New Customer
              </button>
              <button
                className="btn btn-glass btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '4px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('job'); }}
              >
                <Layers size={15} color="var(--amber)" /> New Job / Order
              </button>
              <button
                className="btn btn-glass btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '4px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('payment'); }}
              >
                <CreditCard size={15} color="var(--rose)" /> Record Payment
              </button>
              <button
                className="btn btn-glass btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('kirkol'); }}
              >
                <Store size={15} color="var(--secondary)" /> Quick Kirkol Sale
              </button>
            </div>
          )}
        </div>

        {/* Multi-Tenant Org Indicator / SuperAdmin Switcher */}
        {isSuperAdmin ? (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-glass btn-sm"
              onClick={() => setShowOrgMenu(!showOrgMenu)}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 0.85rem' }}
              title="SuperAdmin: Switch Tenant Context"
            >
              <Building2 size={15} color="var(--secondary)" />
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeOrg.name}</span>
              <ChevronDown size={13} />
            </button>

            {showOrgMenu && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '240px',
                padding: '0.5rem',
                zIndex: 100
              }}>
                <p style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-dim)', padding: '4px 8px', textTransform: 'uppercase' }}>
                  SuperAdmin: Switch Tenant
                </p>
                {orgs.map(o => (
                  <button
                    key={o.id}
                    className="btn btn-glass btn-sm"
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      border: 'none',
                      marginBottom: '4px',
                      background: o.id === activeOrg.id ? 'var(--bg-glass-active)' : 'transparent'
                    }}
                    onClick={() => {
                      setActiveOrg(o);
                      setShowOrgMenu(false);
                    }}
                  >
                    <span style={{ fontWeight: o.id === activeOrg.id ? 700 : 500 }}>{o.name}</span>
                    {o.id === activeOrg.id && <CheckCircle2 size={14} color="var(--emerald)" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className="btn btn-glass btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.45rem 0.85rem',
              cursor: 'default',
              opacity: 0.95
            }}
            title="Your Active Business Workspace"
          >
            <Building2 size={15} color="var(--secondary)" />
            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{activeOrg.name}</span>
          </div>
        )}

        {/* User Account / Role Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-glass btn-sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 0.85rem' }}
            title="User Account & Role"
          >
            <Shield size={15} color="var(--primary)" />
            <span>{currentUser.name} ({currentUser.roleName})</span>
            <ChevronDown size={13} />
          </button>

          {showUserMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '260px',
              padding: '0.5rem',
              zIndex: 100
            }}>
              <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-glass-subtle)', marginBottom: '6px' }}>
                <p style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-highlight)' }}>{currentUser.name}</p>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{currentUser.email}</p>
                <p style={{ fontSize: '0.675rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
                  Workspace: {activeOrg.name}
                </p>
              </div>

              {availableUsers.length > 1 && (
                <>
                  <p style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-dim)', padding: '4px 8px', textTransform: 'uppercase' }}>
                    {isSuperAdmin ? 'Switch Persona' : 'Team Members'}
                  </p>
                  {availableUsers.map(u => (
                    <button
                      key={u.id}
                      className="btn btn-glass btn-sm"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        border: 'none',
                        marginBottom: '4px',
                        background: u.id === currentUser.id ? 'var(--bg-glass-active)' : 'transparent'
                      }}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{u.name}</p>
                        <p style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{u.roleName}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              <div style={{ borderTop: '1px solid var(--border-glass-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  className="btn btn-glass btn-sm"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    border: 'none',
                    color: 'var(--rose)',
                    gap: '0.5rem'
                  }}
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out of Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-glass btn-icon"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{ borderRadius: '50%', position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--rose)',
                boxShadow: '0 0 6px var(--rose)'
              }} />
            )}
          </button>

          {showNotifMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '320px',
              padding: '0.75rem',
              zIndex: 100
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 4px' }}>
                <p style={{ fontSize: '0.825rem', fontWeight: 700 }}>Notifications</p>
                <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>{unreadCount} New</span>
              </div>
              {notifications.slice(0, 4).map(n => (
                <div key={n.id} className="glass-card" style={{ padding: '0.5rem 0.65rem', marginBottom: '4px', fontSize: '0.775rem' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-highlight)' }}>{n.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          className="btn btn-glass btn-icon"
          onClick={toggleTheme}
          style={{ borderRadius: '50%' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Glass`}
        >
          {theme === 'dark' ? <Sun size={18} color="#fcd34d" /> : <Moon size={18} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
};
