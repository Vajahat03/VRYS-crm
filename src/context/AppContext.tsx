import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, User, InAppNotification, NavRoute } from '../types';
import { dataStore } from '../services/dataStore';

export type { NavRoute };

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerTenant: (companyName: string, ownerName: string, email: string, phone: string, city: string) => Promise<{ success: boolean; error?: string }>;
  activeOrg: Organization;
  setActiveOrg: (org: Organization) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentRoute: NavRoute;
  setCurrentRoute: (route: NavRoute) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (type: Toast['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  selectedCustomerId?: string;
  setSelectedCustomerId: (id?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const orgs = dataStore.getOrganizations();
  const allUsers = dataStore.getUsers('ALL');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vrys_auth_session') !== null;
    } catch {
      return false;
    }
  });

  const [activeOrg, setActiveOrg] = useState<Organization>(() => {
    try {
      const sessionStr = localStorage.getItem('vrys_auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const org = dataStore.getOrganizationById(session.orgId);
        if (org) return org;
      }
    } catch {
      // Fallback
    }
    return orgs[0] || {
      id: 'org_aluzer',
      name: 'Al Uzer Common Services',
      email: 'info@aluzer.com',
      phone: '+91 98765 43210',
      address: 'Main Bazaar Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      currency: '₹',
      timezone: 'Asia/Kolkata',
      plan: 'yearly',
      maxUsers: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const sessionStr = localStorage.getItem('vrys_auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const user = dataStore.getUserById(session.userId);
        if (user) return user;
      }
    } catch {
      // Fallback
    }
    const defaultUser = dataStore.getUsers('org_aluzer')[0];
    return defaultUser || {
      id: 'user_aluzer_owner',
      organizationId: 'org_aluzer',
      name: 'Ahmed Khan',
      email: 'ahmed@aluzer.com',
      phone: '+91 98765 43210',
      role: 'COMPANY_OWNER',
      roleName: 'Business Owner',
      status: 'active',
      createdAt: new Date().toISOString()
    };
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();

  // Login handler
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Super Admin Platform Login
    const isSuperAdminEmail =
      cleanEmail === 'vrys.crm@gmail.com' ||
      cleanEmail === 'shaikhvajahat47@gmail.com' ||
      cleanEmail === 'owner@vrys.com' ||
      cleanEmail === 'vajahat@vrys.io';

    if (isSuperAdminEmail) {
      const superAdminUser: User = {
        id: 'user_super_admin',
        organizationId: 'system',
        name: 'Vajahat Shaikh (VRYS Owner)',
        email: cleanEmail,
        phone: '+91 99999 00001',
        role: 'SUPER_ADMIN',
        roleName: 'VRYS System Owner',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2026-01-01T00:00:00Z'
      };

      setCurrentUser(superAdminUser);
      setIsAuthenticated(true);
      localStorage.setItem('vrys_auth_session', JSON.stringify({
        userId: superAdminUser.id,
        orgId: activeOrg.id || 'org_aluzer',
        email: cleanEmail
      }));
      return { success: true };
    }

    // 2. Multi-Tenant Business Staff / Owner Login
    const allRegisteredUsers = dataStore.getUsers('ALL');
    const matchedUser = allRegisteredUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      const userOrg = dataStore.getOrganizationById(matchedUser.organizationId);
      if (userOrg) {
        setActiveOrg(userOrg);
      }
      setCurrentUser(matchedUser);
      setIsAuthenticated(true);
      setCurrentRoute('dashboard');
      localStorage.setItem('vrys_auth_session', JSON.stringify({
        userId: matchedUser.id,
        orgId: matchedUser.organizationId,
        email: matchedUser.email
      }));
      return { success: true };
    }

    // 3. Check if an organization exists with this email
    const allRegisteredOrgs = dataStore.getOrganizations();
    const matchedOrg = allRegisteredOrgs.find(o => o.email?.toLowerCase() === cleanEmail);
    if (matchedOrg) {
      const newOwnerUser = dataStore.createUser({
        organizationId: matchedOrg.id,
        name: `${matchedOrg.name} Admin`,
        email: cleanEmail,
        phone: matchedOrg.phone || '',
        role: 'COMPANY_OWNER',
        roleName: 'Business Owner',
        status: 'active'
      });
      setActiveOrg(matchedOrg);
      setCurrentUser(newOwnerUser);
      setIsAuthenticated(true);
      setCurrentRoute('dashboard');
      localStorage.setItem('vrys_auth_session', JSON.stringify({
        userId: newOwnerUser.id,
        orgId: matchedOrg.id,
        email: cleanEmail
      }));
      return { success: true };
    }

    return {
      success: false,
      error: 'No business account found for this email address. Please register your company workspace first.'
    };
  };

  // Register New Tenant Workspace
  const registerTenant = async (
    companyName: string,
    ownerName: string,
    email: string,
    phone: string,
    city: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const newOrg = dataStore.createOrganization({
        name: companyName,
        tagline: 'Smart Business Operations',
        email,
        phone,
        address: 'Commercial Business Center',
        city,
        state: 'Maharashtra',
        country: 'India',
        currency: '₹',
        timezone: 'Asia/Kolkata',
        plan: 'trial',
        trialStartDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        maxUsers: 10
      });

      const newUser = dataStore.createUser({
        organizationId: newOrg.id,
        name: ownerName,
        email,
        phone,
        role: 'COMPANY_OWNER',
        roleName: 'Business Owner',
        status: 'active'
      });

      setActiveOrg(newOrg);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setCurrentRoute('dashboard');

      localStorage.setItem('vrys_auth_session', JSON.stringify({
        userId: newUser.id,
        orgId: newOrg.id,
        email: newUser.email
      }));

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create workspace.' };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('vrys_auth_session');
    setIsAuthenticated(false);
    setCurrentRoute('dashboard');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const addToast = (type: Toast['type'], title: string, message?: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Keyboard shortcut listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        registerTenant,
        activeOrg,
        setActiveOrg,
        currentUser,
        setCurrentUser,
        theme,
        toggleTheme,
        currentRoute,
        setCurrentRoute,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toasts,
        addToast,
        removeToast,
        refreshTrigger,
        triggerRefresh,
        selectedCustomerId,
        setSelectedCustomerId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
