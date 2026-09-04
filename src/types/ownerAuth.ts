/**
 * VRYS CRM — Platform Owner Authentication & PostgreSQL RLS Types
 * Defines models for platform_admins, owner_recovery_tokens, and owner_security_events
 */

export interface PlatformAdmin {
  userId: string;
  role: 'SUPER_ADMIN';
  primaryEmail: string;
  recoveryEmail?: string;
  isActive: boolean;
  mfaRequired: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type OwnerSecurityEventType =
  | 'OWNER_LOGIN_SUCCESS'
  | 'OWNER_LOGIN_FAILURE'
  | 'OWNER_LOGOUT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_CHANGED'
  | 'MFA_CHALLENGE_ISSUED'
  | 'MFA_VERIFIED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'RECOVERY_EMAIL_CHANGED'
  | 'OWNER_ACCOUNT_DISABLED'
  | 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT';

export interface OwnerSecurityEvent {
  id: string;
  userId?: string;
  eventType: OwnerSecurityEventType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  timestamp?: number;
}

export interface OwnerAuthState {
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  adminProfile: PlatformAdmin | null;
  mfaPending: boolean;
  mfaFactorId?: string;
  mfaChallengeId?: string;
  loading: boolean;
  error: string | null;
}

export interface RecoveryRequestResponse {
  success: boolean;
  message: string;
  dev_preview?: {
    recovery_destination: string;
    simulated_link: string;
    raw_token: string;
    expires_in_seconds: number;
  };
}

export interface TokenVerificationResponse {
  valid: boolean;
  primary_email: string;
  expires_in_seconds: number;
}
