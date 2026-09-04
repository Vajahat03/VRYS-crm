import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldAlert, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';
import { ownerAuthService } from '../../services/ownerAuthService';
import { RecoveryRequestResponse } from '../../types/ownerAuth';

interface OwnerForgotPasswordProps {
  onBackToLogin: () => void;
  onOpenResetWithToken: (token: string) => void;
}

export const OwnerForgotPassword: React.FC<OwnerForgotPasswordProps> = ({ onBackToLogin, onOpenResetWithToken }) => {
  const [primaryEmail, setPrimaryEmail] = useState('owner@vrys.com');
  const [loading, setLoading] = useState(false);
  const [responseState, setResponseState] = useState<RecoveryRequestResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryEmail) return;

    setLoading(true);
    const res = await ownerAuthService.requestPasswordRecovery(primaryEmail);
    setLoading(false);
    setResponseState(res);
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '2rem auto',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)'
    }}>
      {/* Back Button */}
      <button
        onClick={onBackToLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          fontSize: '0.85rem',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Owner Sign In</span>
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '1rem'
        }}>
          <KeyRound size={32} color="#f87171" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: '0 0 0.5rem 0' }}>
          Owner Account Recovery
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
          Enter your primary login email. The password reset token will be securely dispatched to your <strong>linked personal recovery email</strong>.
        </p>
      </div>

      {!responseState ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '500' }}>
              Primary Login Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                value={primaryEmail}
                onChange={(e) => setPrimaryEmail(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Generating Cryptographic Token...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Recovery Instructions</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div>
          {/* Anti-Enumeration Confirmation Card */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '1.25rem',
            borderRadius: '14px',
            marginBottom: '1.5rem',
            color: '#a7f3d0'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={22} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#fff', fontSize: '0.95rem' }}>Recovery Dispatched</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#d1fae5', lineHeight: '1.4' }}>
                  {responseState.message}
                </p>
              </div>
            </div>
          </div>

          {/* Dev Mode Simulated Link preview */}
          {responseState.dev_preview && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px dashed rgba(99, 102, 241, 0.4)',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <ShieldAlert size={16} color="#818cf8" />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase' }}>
                  Simulated Recovery Link
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.75rem 0' }}>
                In production, delivered to <strong>{responseState.dev_preview.recovery_destination}</strong> (valid for 20 minutes).
              </p>
              <button
                type="button"
                onClick={() => onOpenResetWithToken(responseState.dev_preview!.raw_token)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(99, 102, 241, 0.25)',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Proceed to Reset Password</span>
                <ExternalLink size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => { setResponseState(null); onBackToLogin(); }}
            style={{
              width: '100%',
              padding: '0.8rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  );
};
