import React from 'react';
import { useApp } from './context/AppContext';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthPage } from './components/auth/AuthPage';

// Modules
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { LeadsModule } from './components/leads/LeadsModule';
import { ContactsCompaniesModule } from './components/contacts/ContactsCompaniesModule';
import { CustomersModule } from './components/customers/CustomersModule';
import { DealsModule } from './components/deals/DealsModule';
import { JobsModule } from './components/jobs/JobsModule';
import { DocumentVaultModule } from './components/documents/DocumentVaultModule';
import { QuotesModule } from './components/finance/QuotesModule';
import { FinanceModule } from './components/finance/FinanceModule';
import { TasksCalendarModule } from './components/tasks/TasksCalendarModule';
import { CommunicationsModule } from './components/communications/CommunicationsModule';
import { AutomationModule } from './components/automation/AutomationModule';
import { AIAssistantModule } from './components/ai/AIAssistantModule';
import { AnalyticsModule } from './components/analytics/AnalyticsModule';
import { AdminPortalModule } from './components/admin/AdminPortalModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { CloudSyncModule } from './components/settings/CloudSyncModule';

export const App: React.FC = () => {
  const { currentRoute, setCurrentRoute, isAuthenticated } = useApp();

  const handleOpenQuickModal = (type: 'lead' | 'customer' | 'job' | 'payment' | 'kirkol') => {
    switch (type) {
      case 'lead':
        setCurrentRoute('leads');
        break;
      case 'customer':
        setCurrentRoute('customers');
        break;
      case 'job':
        setCurrentRoute('jobs');
        break;
      case 'payment':
      case 'kirkol':
        setCurrentRoute('payments');
        break;
      default:
        break;
    }
  };

  const renderActiveModule = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <ExecutiveDashboard onOpenQuickModal={handleOpenQuickModal} />;
      case 'leads':
        return <LeadsModule />;
      case 'contacts':
        return <ContactsCompaniesModule />;
      case 'customers':
        return <CustomersModule />;
      case 'deals':
        return <DealsModule />;
      case 'jobs':
        return <JobsModule />;
      case 'documents':
        return <DocumentVaultModule />;
      case 'quotes':
        return <QuotesModule />;
      case 'products':
      case 'settings':
        return <SettingsModule />;
      case 'invoices':
      case 'payments':
      case 'expenses':
      case 'kirkol':
        return <FinanceModule />;
      case 'tasks':
      case 'calendar':
        return <TasksCalendarModule />;
      case 'communications':
        return <CommunicationsModule />;
      case 'automation':
        return <AutomationModule />;
      case 'ai':
        return <AIAssistantModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'cloud_sync':
        return <CloudSyncModule />;
      case 'admin':
        return <AdminPortalModule />;
      default:
        return <ExecutiveDashboard onOpenQuickModal={handleOpenQuickModal} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
        <AmbientBackground />
        <AuthPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Dynamic Ambient Glassmorphism Orbs Mesh */}
      <AmbientBackground />

      {/* Main Collapsible Glass Sidebar */}
      <Sidebar />

      {/* Primary Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        {/* Top Navbar */}
        <TopNavbar onOpenQuickModal={handleOpenQuickModal} />

        {/* Scrollable View Container */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Command Palette & Toasts */}
      <CommandPalette onOpenQuickModal={handleOpenQuickModal} />
      <ToastContainer />
    </div>
  );
};
