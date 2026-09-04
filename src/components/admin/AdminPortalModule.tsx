import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Organization, PreApprovedUser, AuditLog } from '../../types';
import { ownerAuthService } from '../../services/ownerAuthService';
import { PlatformAdmin } from '../../types/ownerAuth';
import { OwnerLogin } from './OwnerLogin';
import { OwnerForgotPassword } from './OwnerForgotPassword';
import { OwnerResetPassword } from './OwnerResetPassword';
import { OwnerSecurityEventsView } from './OwnerSecurityEventsView';
import {
  ShieldCheck,
  Building,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  CreditCard,
  History,
  Sparkles,
  Zap,
  DollarSign,
  X,
  Check,
  QrCode,
  LogOut,
  Shield,
  KeyRound
} from 'lucide-react';

export const AdminPortalModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  
  // Owner Authentication State
  const [adminProfile, setAdminProfile] = useState<PlatformAdmin | null>(ownerAuthService.getAdminProfile());
  const [isAuthorized, setIsAuthorized] = useState<boolean>(ownerAuthService.isAuthorizedSuperAdmin());
  const [authView, setAuthView] = useState<'login' | 'forgot_password' | 'reset_password'>('login');
  const [recoveryToken, setRecoveryToken] = useState<string>('');

  // Portal Tabs
  const [activeTab, setActiveTab] = useState<'orgs' | 'preapproved' | 'plans' | 'audit' | 'security_events'>('orgs');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = ownerAuthService.subscribe((profile) => {
      setAdminProfile(profile);
      setIsAuthorized(ownerAuthService.isAuthorizedSuperAdmin());
    });
    return () => unsubscribe();
  }, []);

  // Modals
  const [selectedOrgForTrial, setSelectedOrgForTrial] = useState<Organization | null>(null);
  const [showAddPreApprovedModal, setShowAddPreApprovedModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState<{ plan: 'monthly' | 'yearly'; price: number; name: string } | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // New Pre-Approved Form State
  const [preName, setPreName] = useState('');
  const [preMobile, setPreMobile] = useState('');
  const [preEmail, setPreEmail] = useState('');
  const [preCompany, setPreCompany] = useState('');
  const [preDays, setPreDays] = useState('30');
  const [preNotes, setPreNotes] = useState('Authorized VIP partner access');

  const orgs = dataStore.getOrganizations();
  const preApprovedUsers = dataStore.getPreApprovedUsers();
  const auditLogs = dataStore.getAuditLogs('ALL');

  const handleExtendTrial = (days: number) => {
    if (!selectedOrgForTrial) return;
    dataStore.extendTrial(selectedOrgForTrial.id, days, currentUser);
    addToast('success', 'Trial Extended!', `Added +${days} days to ${selectedOrgForTrial.name}'s trial.`);
    setSelectedOrgForTrial(null);
    triggerRefresh();
  };

  const handleToggleFreeAccess = (org: Organization) => {
    const isFree = org.plan === 'free_granted';
    const nextState = !isFree;
    dataStore.grantFreeAccess(org.id, nextState, currentUser);
    addToast(nextState ? 'success' : 'info', 'Free Access Updated', `${nextState ? 'Granted' : 'Revoked'} permanent free access for ${org.name}`);
    triggerRefresh();
  };

  const handleAddPreApproved = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preName || !preMobile) {
      addToast('error', 'Validation Error', 'Name and mobile are required.');
      return;
    }

    dataStore.addPreApprovedUser({
      name: preName,
      mobile: preMobile,
      email: preEmail || undefined,
      companyName: preCompany || undefined,
      accessDays: Number(preDays) || 30,
      notes: preNotes
    });

    addToast('success', 'User Whitelisted', `Whitelisted ${preName} (${preMobile}) for ${preDays} days.`);
    setShowAddPreApprovedModal(false);
    setPreName('');
    setPreMobile('');
    setPreEmail('');
    setPreCompany('');
    triggerRefresh();
  };

  const handleExecuteRazorpayUpgrade = () => {
    if (!showRazorpayModal) return;

    const paymentRef = 'pay_' + Date.now().toString(36).toUpperCase();
    dataStore.upgradeSubscription(activeOrg.id, showRazorpayModal.plan, paymentRef);

    addToast('success', 'Subscription Activated! 🚀', `Upgraded to ${showRazorpayModal.name} (Payment ID: ${paymentRef})`);
    setShowRazorpayModal(null);
    triggerRefresh();
  };

  const handleSignOut = async () => {
    await ownerAuthService.signOut();
    setIsAuthorized(false);
    setAdminProfile(null);
    setAuthView('login');
    addToast('info', 'Owner Session Terminated', 'Signed out of Super Admin Owner Console.');
  };

  // If user is not authenticated as SUPER_ADMIN, show dedicated Owner Portal authentication views
  if (!isAuthorized) {
    if (authView === 'forgot_password') {
      return (
        <OwnerForgotPassword
          onBackToLogin={() => setAuthView('login')}
          onOpenResetWithToken={(tok) => {
            setRecoveryToken(tok);
            setAuthView('reset_password');
          }}
        />
      );
    }

    if (authView === 'reset_password') {
      return (
        <OwnerResetPassword
          token={recoveryToken}
          onSuccess={() => {
            setAuthView('login');
            addToast('success', 'Password Updated', 'Please sign in with your new credentials.');
          }}
          onCancel={() => setAuthView('login')}
        />
      );
    }

    return (
      <OwnerLogin
        onSuccess={(profile) => {
          setAdminProfile(profile);
          setIsAuthorized(true);
          addToast('success', 'SUPER_ADMIN Authorized', `Welcome, ${profile.primaryEmail}`);
        }}
        onForgotPassword={() => setAuthView('forgot_password')}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* SaaS Owner Banner */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
        borderColor: 'var(--primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
            color: '#fff'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>VRYS SaaS Platform Owner Console</h2>
              <span className="badge badge-indigo">SUPER_ADMIN</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>RLS ACTIVE</span>
              <span style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontFamily: 'monospace'
              }}>
                {adminProfile?.primaryEmail || 'owner@vrys.com'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Multi-Tenant Governance • 7-Day Trial Manager • Pre-Approved Whitelist • Razorpay Subscriptions • Postgres RLS
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '0.4rem 0.85rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Total Tenants</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-highlight)' }}>{orgs.length}</p>
          </div>
          <div className="glass-card" style={{ padding: '0.4rem 0.85rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Active Whitelist</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald)' }}>{preApprovedUsers.length}</p>
          </div>
          <button
            className="btn btn-glass btn-sm"
            onClick={handleSignOut}
            title="Sign out of Owner Console"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-surface-2)', padding: '4px', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap' }}>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'orgs' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'orgs' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('orgs')}
          >
            <Building size={15} /> Organizations ({orgs.length})
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'preapproved' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'preapproved' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('preapproved')}
          >
            <Unlock size={15} /> Pre-Approved Whitelist ({preApprovedUsers.length})
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'plans' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'plans' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('plans')}
          >
            <CreditCard size={15} /> Subscription Plans (Razorpay)
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'audit' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'audit' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('audit')}
          >
            <History size={15} /> Global Tenant Audit ({auditLogs.length})
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'security_events' ? '#4f46e5' : 'transparent',
              color: activeTab === 'security_events' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('security_events')}
          >
            <Shield size={15} /> Owner Security Audit Trail
          </button>
        </div>

        {activeTab === 'preapproved' && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddPreApprovedModal(true)}>
            <Plus size={16} /> Whitelist User
          </button>
        )}
      </div>

      {/* 1. Organizations & Trial Management View */}
      {activeTab === 'orgs' && (
        <div className="table-container">
          <table className="vrys-table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Subdomain / ID</th>
                <th>Plan Tier</th>
                <th>Status</th>
                <th>7-Day Trial Status</th>
                <th>Free VIP Access</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => {
                const isTrial = org.plan === 'trial';
                const isFree = org.plan === 'free_granted';
                const daysLeft = org.trialEndDate
                  ? Math.ceil((new Date(org.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <tr key={org.id}>
                    <td>
                      <p style={{ fontWeight: 700 }}>{org.name}</p>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{org.city}, {org.state}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)' }}>
                        {org.id.replace('org_', '')}.vrys.in
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${org.plan === 'yearly' ? 'badge-indigo' : org.plan === 'monthly' ? 'badge-emerald' : org.plan === 'free_granted' ? 'badge-cyan' : 'badge-amber'}`}>
                        {org.plan.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${org.plan !== 'expired' ? 'badge-emerald' : 'badge-rose'}`}>
                        {org.plan !== 'expired' ? 'ACTIVE' : 'EXPIRED'}
                      </span>
                    </td>
                    <td>
                      {isFree ? (
                        <span className="badge badge-emerald">Permanent VIP</span>
                      ) : isTrial ? (
                        <span className={`badge ${daysLeft <= 2 ? 'badge-rose' : 'badge-amber'}`}>
                          <Clock size={11} /> {daysLeft > 0 ? `${daysLeft} Days Left` : 'Trial Expired'}
                        </span>
                      ) : (
                        <span className="badge badge-emerald">Active Paid ({org.plan.toUpperCase()})</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${isFree ? 'btn-success' : 'btn-glass'}`}
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        onClick={() => handleToggleFreeAccess(org)}
                      >
                        {isFree ? 'VIP Free Granted' : 'Grant Free Access'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.725rem', padding: '3px 8px' }}
                        onClick={() => setSelectedOrgForTrial(org)}
                      >
                        Extend Trial →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Pre-Approved Users Whitelist View */}
      {activeTab === 'preapproved' && (
        <div className="table-container">
          <table className="vrys-table">
            <thead>
              <tr>
                <th>Whitelisted Contact</th>
                <th>Mobile Number</th>
                <th>Email</th>
                <th>Company</th>
                <th>Granted Free Days</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {preApprovedUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <p style={{ fontWeight: 700 }}>{u.name}</p>
                  </td>
                  <td><strong>{u.mobile}</strong></td>
                  <td>{u.email || '—'}</td>
                  <td>{u.companyName || '—'}</td>
                  <td><span className="badge badge-emerald">{u.accessDays} Days</span></td>
                  <td><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.notes || 'VIP Access'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-indigo">Pre-Approved</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Subscription Plans & Razorpay Simulator */}
      {activeTab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* Starter Plan */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="badge badge-cyan">Starter Tier</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>Starter Business</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ideal for micro service shops & single operators.</p>
              </div>

              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-highlight)' }}>
                  ₹999 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span>
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Up to 3 User Logins</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Leads & Customer 360°</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Invoices & PDF Receipts</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Kirkol Counter POS</span>
              </div>

              <button
                className="btn btn-glass"
                style={{ marginTop: 'auto' }}
                onClick={() => setShowRazorpayModal({ plan: 'monthly', price: 999, name: 'Starter Business (Monthly)' })}
              >
                Upgrade to Starter
              </button>
            </div>

            {/* Professional Plan */}
            <div className="glass-panel" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderColor: 'var(--primary)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-indigo">Most Popular</span>
                  <Sparkles size={16} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>Professional Pro</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>For growing agencies with multiple technicians.</p>
              </div>

              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                  ₹2,499 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span>
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Up to 10 Operators</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> 8-Stage Operational Kanban</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Document Vault & Expiry Alerts</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> WhatsApp CRM & AI Smart Replies</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: 'auto' }}
                onClick={() => setShowRazorpayModal({ plan: 'monthly', price: 2499, name: 'Professional Pro (Monthly)' })}
              >
                Upgrade to Professional
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="badge badge-emerald">Enterprise</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>Enterprise AI</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full autonomous AI Multi-Agent orchestration.</p>
              </div>

              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--emerald)' }}>
                  ₹59,999 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ year</span>
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Unlimited Operators & Roles</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Autonomous AI Multi-Agent Copilot</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Trigger-Condition-Action Automations</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="var(--emerald)" /> Dedicated Priority Account Manager</span>
              </div>

              <button
                className="btn btn-glass"
                style={{ marginTop: 'auto' }}
                onClick={() => setShowRazorpayModal({ plan: 'yearly', price: 59999, name: 'Enterprise AI (Annual)' })}
              >
                Upgrade to Enterprise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Global Audit Trail View */}
      {activeTab === 'audit' && (
        <div className="table-container">
          <table className="vrys-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action Event</th>
                <th>Entity Target</th>
                <th>Event Description</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <strong>{log.userName}</strong>
                  </td>
                  <td>
                    <span className="badge badge-indigo">{log.action}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{log.entityType} ({log.entityId})</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{log.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Owner Security Events Audit Trail */}
      {activeTab === 'security_events' && (
        <OwnerSecurityEventsView />
      )}

      {/* Extend Trial Modal */}
      {selectedOrgForTrial && (
        <div className="modal-backdrop" onClick={() => setSelectedOrgForTrial(null)}>
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Extend Trial Access</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedOrgForTrial.name}</p>
              </div>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setSelectedOrgForTrial(null)}><X size={16} /></button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Select duration to extend the trial access for this tenant organization:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button className="btn btn-glass" onClick={() => handleExtendTrial(7)}>+7 Days</button>
              <button className="btn btn-glass" onClick={() => handleExtendTrial(14)}>+14 Days</button>
              <button className="btn btn-primary" onClick={() => handleExtendTrial(30)}>+30 Days</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-glass" onClick={() => setSelectedOrgForTrial(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Pre-Approved Modal */}
      {showAddPreApprovedModal && (
        <div className="modal-backdrop" onClick={() => setShowAddPreApprovedModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Whitelist Pre-Approved Access</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddPreApprovedModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddPreApproved} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Authorized Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farooq Merchant"
                  value={preName}
                  onChange={e => setPreName(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={preMobile}
                    onChange={e => setPreMobile(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="partner@domain.com"
                    value={preEmail}
                    onChange={e => setPreEmail(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Company Name</label>
                  <input
                    type="text"
                    placeholder="Merchant Enterprises"
                    value={preCompany}
                    onChange={e => setPreCompany(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Granted Access Days</label>
                  <select
                    value={preDays}
                    onChange={e => setPreDays(e.target.value)}
                    className="input-glass"
                  >
                    <option value="30" style={{ background: '#0f172a' }}>30 Days</option>
                    <option value="60" style={{ background: '#0f172a' }}>60 Days</option>
                    <option value="90" style={{ background: '#0f172a' }}>90 Days</option>
                    <option value="365" style={{ background: '#0f172a' }}>365 Days (1 Year)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddPreApprovedModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Whitelist User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Subscription Checkout Simulator Modal */}
      {showRazorpayModal && (
        <div className="modal-backdrop" onClick={() => setShowRazorpayModal(null)}>
          <div className="modal-content" style={{ padding: '2rem', maxWidth: '480px', background: '#090d16', border: '1px solid rgba(59, 130, 246, 0.4)' }} onClick={e => e.stopPropagation()}>
            {/* Razorpay Header Branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '6px 10px', background: '#3b82f6', borderRadius: '4px', fontWeight: 900, color: '#fff', fontSize: '0.9rem', letterSpacing: '1px' }}>
                  RAZORPAY
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure Checkout</span>
              </div>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowRazorpayModal(null)}><X size={16} /></button>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{showRazorpayModal.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization: {activeOrg.name}</p>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#60a5fa' }}>
                  ₹{showRazorpayModal.price.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div
                className="glass-card"
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderColor: checkoutPaymentMethod === 'upi' ? '#3b82f6' : 'var(--border-glass-subtle)',
                  background: checkoutPaymentMethod === 'upi' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => setCheckoutPaymentMethod('upi')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <QrCode size={18} color="#60a5fa" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>UPI Instant QR (GPay / PhonePe / Paytm)</span>
                </div>
                {checkoutPaymentMethod === 'upi' && <CheckCircle2 size={16} color="#60a5fa" />}
              </div>

              <div
                className="glass-card"
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderColor: checkoutPaymentMethod === 'card' ? '#3b82f6' : 'var(--border-glass-subtle)',
                  background: checkoutPaymentMethod === 'card' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => setCheckoutPaymentMethod('card')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CreditCard size={18} color="#60a5fa" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                </div>
                {checkoutPaymentMethod === 'card' && <CheckCircle2 size={16} color="#60a5fa" />}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', fontWeight: 800, fontSize: '0.95rem' }}
              onClick={handleExecuteRazorpayUpgrade}
            >
              Pay ₹{showRazorpayModal.price.toLocaleString('en-IN')} & Activate Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
