import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, RefreshCw, Smartphone, Laptop, Globe, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ownerAuthService } from '../../services/ownerAuthService';
import { OwnerSecurityEvent, OwnerSecurityEventType } from '../../types/ownerAuth';

export const OwnerSecurityEventsView: React.FC = () => {
  const [events, setEvents] = useState<OwnerSecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AUTH' | 'RECOVERY' | 'MFA'>('ALL');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await ownerAuthService.getSecurityEvents();
    setEvents(data);
    setLoading(false);
  };

  const getEventBadge = (type: OwnerSecurityEventType) => {
    switch (type) {
      case 'OWNER_LOGIN_SUCCESS':
        return { label: 'Login Success', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', icon: CheckCircle2 };
      case 'OWNER_LOGIN_FAILURE':
        return { label: 'Login Failed', bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', icon: XCircle };
      case 'MFA_VERIFIED':
      case 'MFA_ENABLED':
        return { label: 'MFA Verified', bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', icon: KeyRound };
      case 'PASSWORD_RESET_REQUEST':
        return { label: 'Reset Requested', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', icon: ShieldAlert };
      case 'PASSWORD_RESET_SUCCESS':
      case 'PASSWORD_CHANGED':
        return { label: 'Password Changed', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', icon: ShieldCheck };
      case 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT':
        return { label: 'Unauthorized Attempt', bg: 'rgba(239, 68, 68, 0.25)', text: '#f87171', icon: ShieldAlert };
      default:
        return { label: type, bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', icon: ShieldCheck };
    }
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'AUTH') return e.eventType.includes('LOGIN') || e.eventType.includes('LOGOUT') || e.eventType.includes('UNAUTHORIZED');
    if (filter === 'RECOVERY') return e.eventType.includes('RESET') || e.eventType.includes('PASSWORD') || e.eventType.includes('RECOVERY');
    if (filter === 'MFA') return e.eventType.includes('MFA');
    return true;
  });

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.75rem',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={22} color="#818cf8" />
            <span>SUPER_ADMIN Security Audit Trail</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            PostgreSQL RLS-isolated audit events tracking all platform administrative access and credentials.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Filters */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {(['ALL', 'AUTH', 'MFA', 'RECOVERY'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  background: filter === tab ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  color: filter === tab ? '#fff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={loadEvents}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.8rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Audit Events Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#818cf8' }} />
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading security audit logs from Postgres...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          <ShieldCheck size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>No security events match the current filter.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Event</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Client IP</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>User Agent</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Metadata</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => {
                const badge = getEventBadge(evt.eventType);
                const IconComponent = badge.icon;
                return (
                  <tr
                    key={evt.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Event Type Badge */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.text,
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        <IconComponent size={13} />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* IP */}
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Globe size={13} color="#64748b" />
                        <span>{evt.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </td>

                    {/* User Agent */}
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evt.userAgent?.includes('Mobile') ? <Smartphone size={13} color="#64748b" /> : <Laptop size={13} color="#64748b" />}
                        <span title={evt.userAgent}>{evt.userAgent || 'VRYS Client Engine'}</span>
                      </div>
                    </td>

                    {/* Metadata */}
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                      {evt.metadata && Object.keys(evt.metadata).length > 0 ? (
                        <div style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          display: 'inline-block',
                          fontFamily: 'monospace'
                        }}>
                          {JSON.stringify(evt.metadata)}
                        </div>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>

                    {/* Time */}
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} color="#64748b" />
                        <span>{new Date(evt.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
