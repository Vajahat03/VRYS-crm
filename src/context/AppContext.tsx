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
  const users = dataStore.getUsers('org_aluzer');

  const [activeOrg, setActiveOrg] = useState<Organization>(orgs[0] || {
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
  });

  const [currentUser, setCurrentUser] = useState<User>(users[0] || {
    id: 'user_aluzer_owner',
    organizationId: 'org_aluzer',
    name: 'Ahmed Khan',
    email: 'ahmed@aluzer.com',
    phone: '+91 98765 43210',
    role: 'COMPANY_OWNER',
    roleName: 'Business Owner',
    status: 'active',
    createdAt: new Date().toISOString()
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();

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
