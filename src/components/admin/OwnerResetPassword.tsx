import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import { ownerAuthService } from '../../services/ownerAuthService';

interface OwnerResetPasswordProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const OwnerResetPassword: React.FC<OwnerResetPasswordProps> = ({ token, onSuccess, onCancel }) => {
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [expiresInSeconds, setExpiresInSeconds] = useState(0);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    setTokenValidating(true);
    setError(null);
    try {
      const res = await ownerAuthService.verifyRecoveryToken(token);
      setTokenValid(true);
      setPrimaryEmail(res.primary_email);
      setExpiresInSeconds(res.expires_in_seconds);
    } catch (err: any) {
      setTokenValid(false);
      setError(err.message || 'The password reset link is invalid or has expired.');
    } finally {
      setTokenValidating(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await ownerAuthService.resetPasswordWithToken(token, newPassword);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(newPassword);

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
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '1rem'
        }}>
          <KeyRound size={32} color="#818cf8" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: '0 0 0.5rem 0' }}>
          Set New Password
        </h2>
        {primaryEmail && (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Resetting password for SUPER_ADMIN: <strong style={{ color: '#fff' }}>{primaryEmail}</strong>
          </p>
        )}
      </div>

      {tokenValidating ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#818cf8' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Validating Cryptographic Token Hash...</p>
        </div>
      ) : resetSuccess ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Password Successfully Updated</h3>
            <p style={{ color: '#a7f3d0', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
              Your new password has been established on Supabase Auth. All existing active sessions have been invalidated for security.
            </p>
          </div>
          <button
            onClick={onSuccess}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign In with New Password
          </button>
        </div>
      ) : !tokenValid ? (
        <div>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '1.25rem',
            borderRadius: '14px',
            marginBottom: '1.5rem',
            color: '#f87171'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.95rem', color: '#fff' }}>Invalid Token</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: '100%',
              padding: '0.85rem',
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
      ) : (
        <form onSubmit={handleResetPassword}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '500' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
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
            {/* Password strength bar */}
            {newPassword && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${strength}%`,
                    background: strength <= 25 ? '#ef4444' : strength <= 50 ? '#f59e0b' : strength <= 75 ? '#3b82f6' : '#10b981',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                  <span>Strength</span>
                  <span style={{ color: strength >= 75 ? '#34d399' : '#94a3b8' }}>
                    {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '500' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Updating Password & Invalidating Sessions...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Change Password & Revoke Old Sessions</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
