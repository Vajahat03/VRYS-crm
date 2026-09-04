import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 1000,
      maxWidth: '360px',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="glass-panel"
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              pointerEvents: 'auto',
              borderLeft: `4px solid ${isSuccess ? 'var(--emerald)' : isError ? 'var(--rose)' : 'var(--primary)'}`,
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {isSuccess && <CheckCircle2 size={18} color="var(--emerald)" style={{ marginTop: '2px' }} />}
            {isError && <AlertCircle size={18} color="var(--rose)" style={{ marginTop: '2px' }} />}
            {!isSuccess && !isError && <Info size={18} color="var(--primary)" style={{ marginTop: '2px' }} />}

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
                {toast.title}
              </p>
              {toast.message && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
