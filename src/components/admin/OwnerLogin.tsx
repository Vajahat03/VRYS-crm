import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ownerAuthService } from '../../services/ownerAuthService';
import { PlatformAdmin } from '../../types/ownerAuth';

interface OwnerLoginProps {
  onSuccess: (admin: PlatformAdmin) => void;
  onForgotPassword: () => void;
}

export const OwnerLogin: React.FC<OwnerLoginProps> = ({ onSuccess, onForgotPassword }) => {
  const [email, setEmail] = useState('owner@vrys.com');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA State
  const [mfaPending, setMfaPending] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<PlatformAdmin | null>(null);

  const handleInitialSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your primary email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await ownerAuthService.signIn(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials or unauthorized access.');
      return;
    }

    if (res.requireMfa && res.profile) {
      setMfaPending(true);
      setPendingProfile(res.profile);
    } else if (res.profile) {
      onSuccess(res.profile);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingProfile || mfaCode.length !== 6) {
      setError('Please enter the 6-digit MFA security token.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await ownerAuthService.verifyMfaCode(pendingProfile, mfaCode);
    setLoading(false);

    if (res.success) {
      onSuccess(pendingProfile);
    } else {
      setError(res.error || 'Invalid MFA code.');
    }
  };

  return (
    <div style={{
      maxWidth: '460px',
      margin: '2rem auto',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '1rem',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)'
        }}>
          <Shield size={36} color="#818cf8" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0 0 0.4rem 0' }}>
          VRYS Owner Portal
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            borderRadius: '100px',
            fontWeight: '600',
            letterSpacing: '0.05em'
          }}>
            SUPER_ADMIN ONLY
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            borderRadius: '100px',
            fontWeight: '600'
          }}>
            RLS ENFORCED
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '0.8rem 1rem',
          borderRadius: '12px',
          color: '#f87171',
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {!mfaPending ? (
        <form onSubmit={handleInitialSignIn}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '500' }}>
              Primary Login Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@vrys.com"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                Password
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Authenticating with Supabase Auth...</span>
              </>
            ) : (
              <>
                <span>Sign In as Platform Owner</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyMfa}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <KeyRound size={28} color="#818cf8" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ color: '#fff', margin: '0 0 0.3rem 0', fontSize: '1rem' }}>MFA Security Verification</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
              Enter the 6-digit TOTP authenticator code for <strong style={{ color: '#e2e8f0' }}>{pendingProfile?.primaryEmail}</strong>
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
              required
              style={{
                width: '100%',
                padding: '0.9rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: '700',
                letterSpacing: '0.4em',
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => { setMfaPending(false); setMfaCode(''); setError(null); }}
              style={{
                flex: 1,
                padding: '0.85rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              style={{
                flex: 2,
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: (loading || mfaCode.length !== 6) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              <span>Verify & Authorize</span>
            </button>
          </div>
        </form>
      )}

      {/* Security Architecture Tag */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.75rem',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        Protected by PostgreSQL Row Level Security (RLS) & Supabase Auth.
      </div>
    </div>
  );
};
