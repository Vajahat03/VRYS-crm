import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Briefcase,
  Layers,
  Globe
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, registerTenant, addToast } = useApp();

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Registration State
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');

  // Sample quick personas for instant evaluation & demonstration
  const samplePersonas = [
    {
      name: 'Ahmed Khan',
      role: 'Al Uzer Services (Owner)',
      email: 'ahmed@aluzer.com',
      badge: 'Tenant A',
      badgeColor: 'badge-indigo',
      desc: 'Owner of Al Uzer CSC & Digital Center'
    },
    {
      name: 'Apex Digital Team',
      role: 'Apex Logistics (Tenant)',
      email: 'contact@apexlogistics.in',
      badge: 'Tenant B',
      badgeColor: 'badge-cyan',
      desc: 'Smart Logistics & Courier Company'
    },
    {
      name: 'VRYS System Owner',
      role: 'Platform Super Admin',
      email: 'vrys.crm@gmail.com',
      badge: 'Super Admin',
      badgeColor: 'badge-purple',
      desc: 'SaaS Platform Owner & License Control'
    }
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await login(signInEmail.trim(), signInPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
      } else {
        addToast('success', 'Welcome back!', 'Successfully signed in to your business workspace.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (email: string) => {
    setSignInEmail(email);
    setSignInPassword('password123');
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await login(email, 'password123');
      if (res.success) {
        addToast('success', 'Logged In!', `Authenticated workspace session for ${email}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !ownerName.trim() || !regEmail.trim()) {
      setErrorMessage('Company Name, Owner Name, and Email are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await registerTenant(
        companyName.trim(),
        ownerName.trim(),
        regEmail.trim(),
        regPhone.trim() || '+91 98000 00000',
        regCity.trim() || 'Mumbai'
      );

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed.');
      } else {
        addToast('success', 'Workspace Created!', `Welcome to VRYS CRM, ${companyName}!`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating company workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      zIndex: 20
    }}>
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        {/* Top Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '1rem',
            backdropFilter: 'blur(8px)'
          }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
              Tenant-Isolated Multi-Tenant Security Architecture
            </span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 0.5rem 0'
          }}>
            VRYS <span className="gradient-text">CRM Operating System</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '560px', margin: '0 auto' }}>
            Sign in to access your company's isolated customer records, pipelines, invoices, and AI automation.
          </p>
        </div>

        {/* Main Glassmorphic Auth Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'stretch'
        }}>
          {/* Left Form Panel */}
          <div className="glass-card" style={{
            padding: '2rem',
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-glass-subtle)',
            boxShadow: 'var(--shadow-glass-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '4px',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-glass-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => { setTab('signin'); setErrorMessage(''); }}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    background: tab === 'signin' ? 'var(--primary-gradient)' : 'transparent',
                    color: tab === 'signin' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMessage(''); }}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    background: tab === 'register' ? 'var(--primary-gradient)' : 'transparent',
                    color: tab === 'register' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  Register Company
                </button>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fda4af',
                  fontSize: '0.825rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tab 1: Sign In Form */}
              {tab === 'signin' ? (
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                      Work Email / Account ID
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        required
                        className="input"
                        placeholder="you@company.com or vrys.crm@gmail.com"
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        style={{ paddingLeft: '38px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                        Password
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>
                        Default: Any or password123
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input"
                        placeholder="••••••••••••"
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        style={{ paddingLeft: '38px', paddingRight: '38px', width: '100%' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? 'Authenticating Workspace...' : 'Sign In to Workspace'}
                    <ArrowRight size={17} />
                  </button>
                </form>
              ) : (
                /* Tab 2: Register Company Workspace */
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                      Company / Business Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="e.g. Star Enterprises"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        style={{ paddingLeft: '36px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                        Owner Full Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          required
                          className="input"
                          placeholder="Your Name"
                          value={ownerName}
                          onChange={e => setOwnerName(e.target.value)}
                          style={{ paddingLeft: '36px', width: '100%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                        City / Location
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          className="input"
                          placeholder="Mumbai"
                          value={regCity}
                          onChange={e => setRegCity(e.target.value)}
                          style={{ paddingLeft: '36px', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                      Work Email (Primary Login) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        required
                        className="input"
                        placeholder="owner@company.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        style={{ paddingLeft: '36px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                      Phone / Mobile Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="tel"
                        className="input"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        style={{ paddingLeft: '36px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      marginTop: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? 'Provisioning Workspace...' : 'Launch 14-Day Free Trial Workspace'}
                    <Sparkles size={16} />
                  </button>
                </form>
              )}
            </div>

            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-glass-subtle)',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              Protected by Enterprise Postgres Row Level Security (RLS) & Encryption.
            </div>
          </div>

          {/* Right Info & Quick Sandbox Evaluation Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Demo Logins */}
            <div className="glass-card" style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-glass-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Zap size={18} color="var(--amber)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Instant Demo Personas (1-Click Test)
                </h3>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Click any test profile below to test tenant isolation and role permissions instantly:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {samplePersonas.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPersona(p.email)}
                    className="btn btn-glass"
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      border: '1px solid var(--border-glass-subtle)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</span>
                        <span className={`badge ${p.badgeColor}`} style={{ fontSize: '0.65rem' }}>{p.badge}</span>
                      </div>
                      <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.desc}</p>
                    </div>
                    <ArrowRight size={15} color="var(--primary)" />
                  </button>
                ))}
              </div>
            </div>

            {/* Strict Multi-Tenant Guarantees Box */}
            <div className="glass-card" style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-2xl)',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-highlight)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--emerald)" />
                Strict Tenant Isolation Guarantees
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={14} color="var(--emerald)" />
                  <span><strong>Zero Cross-Tenant Leakage:</strong> Company A can never view Company B's customers, deals, or finance.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={14} color="var(--emerald)" />
                  <span><strong>Database-Level RLS:</strong> Enforced at PostgreSQL layer via authenticated tenant claims.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={14} color="var(--emerald)" />
                  <span><strong>Role-Based Access:</strong> Granular permissions for Owners, Sales, Operations, and Accountants.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
