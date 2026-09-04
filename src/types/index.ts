export type RoleType = 
  | 'SUPER_ADMIN'      // Platform Owner/Admin
  | 'COMPANY_OWNER'    // Shop / Business Owner
  | 'MANAGER'          // Team / Branch Manager
  | 'SALES'            // Sales Representative
  | 'OPERATIONS'       // Operations / Technician
  | 'ACCOUNTANT'       // Accounts / Finance
  | 'SUPPORT'          // Customer Support
  | 'CUSTOMER';        // Portal End-User

export interface Organization {
  id: string;
  name: string;
  tagline?: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  currency: string;
  timezone: string;
  taxNumber?: string;
  plan: 'trial' | 'monthly' | 'yearly' | 'free_granted' | 'expired';
  trialStartDate?: string;
  trialEndDate?: string;
  paidStartDate?: string;
  paidEndDate?: string;
  isSuspended?: boolean;
  maxUsers: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: RoleType;
  roleName: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export interface PreApprovedUser {
  id: string;
  mobile: string;
  email: string;
  name: string;
  companyName: string;
  accessDays: number;
  status: 'pending' | 'claimed';
  notes?: string;
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Converted' | 'Lost' | 'Unqualified';
export type LeadSource = 'Walk-in' | 'Website' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'Google' | 'Referral' | 'Existing Customer' | 'Advertisement' | 'Other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  mobile: string;
  email?: string;
  companyName?: string;
  location?: string;
  source: LeadSource;
  interestedService: string;
  estimatedValue: number;
  priority: Priority;
  ownerId: string;
  ownerName: string;
  status: LeadStatus;
  aiScore?: number;
  aiScoreReason?: string;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  companyId?: string;
  firstName: string;
  lastName: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  dateOfBirth?: string;
  tags: string[];
  ownerId: string;
  createdAt: string;
}

export interface Company {
  id: string;
  organizationId: string;
  name: string;
  industry: string;
  phone: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  tags: string[];
  ownerId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  contactId?: string;
  name: string;
  customerCode: string;
  mobile: string;
  email?: string;
  companyName?: string;
  address?: string;
  city?: string;
  category: string;
  lifetimeValue: number;
  outstandingAmount: number;
  totalRevenue: number;
  tags: string[];
  ownerId: string;
  status: 'active' | 'inactive' | 'vip' | 'at_risk';
  createdAt: string;
}

export type DealStage = 'Discovery' | 'Proposal Sent' | 'Negotiation' | 'Contract Sent' | 'Closed Won' | 'Closed Lost';

export interface Deal {
  id: string;
  organizationId: string;
  customerId?: string;
  customerName: string;
  title: string;
  pipelineId: string;
  stage: DealStage;
  value: number;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  ownerName: string;
  source: string;
  lostReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = 'Pending' | 'Document Required' | 'In Progress' | 'Al Uzer' | 'Ready' | 'Delivered' | 'Completed' | 'Cancelled';

export interface Job {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  dealId?: string;
  jobNumber: string;
  title: string;
  serviceId?: string;
  serviceName: string;
  description?: string;
  status: JobStatus;
  priority: Priority;
  assignedTo: string;
  assignedToName: string;
  totalAmount: number;
  workExpense: number;
  paidAmount: number;
  balanceAmount: number;
  requiredDocuments: string[];
  receivedDocuments: string[];
  deliveryDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductService {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  sellingPrice: number;
  internalCost: number;
  governmentFee: number;
  taxRate: number;
  profit: number;
  durationDays: number;
  active: boolean;
  createdAt: string;
}

export interface LineItem {
  id: string;
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled';

export interface Quote {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  items: LineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  status: QuoteStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  jobId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';

export interface Payment {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  jobId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  paymentDate: string;
  notes?: string;
  receiptNumber: string;
  recordedBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  organizationId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  recordedBy: string;
  createdAt: string;
}

export interface KirkolSale {
  id: string;
  organizationId: string;
  category: string; // e.g. 'Printing', 'Xerox', 'Scanning', 'Lamination', 'Ticket Booking'
  description?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  recordedBy: string;
  createdAt: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  relatedType?: 'customer' | 'lead' | 'deal' | 'job' | 'general';
  relatedId?: string;
  relatedTitle?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  reminderAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  organizationId: string;
  type: 'Call' | 'Email' | 'WhatsApp' | 'Meeting' | 'Note' | 'Task' | 'System Event' | 'Payment';
  subject: string;
  description: string;
  userId: string;
  userName: string;
  relatedType: 'customer' | 'lead' | 'deal' | 'job';
  relatedId: string;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export interface DocumentRecord {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  jobId?: string;
  name: string;
  category: string;
  fileType: string;
  fileSize: string;
  expiryDate?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: Priority;
  status: 'Open' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';
  category: string;
  assignedTo: string;
  assignedToName: string;
  slaDueAt: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  organizationId: string;
  userId?: string;
  type: 'lead' | 'payment' | 'task' | 'job' | 'ticket' | 'system' | 'ai';
  title: string;
  message: string;
  relatedType?: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  organizationId: string;
  name: string;
  trigger: 'lead_created' | 'deal_won' | 'job_status_changed' | 'payment_received' | 'invoice_overdue' | 'document_expiring';
  conditionField?: string;
  conditionOperator?: 'equals' | 'greater_than' | 'contains';
  conditionValue?: string;
  actionType: 'send_whatsapp' | 'send_email' | 'create_task' | 'update_status' | 'create_notification';
  actionConfig: Record<string, any>;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  agentName?: string;
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: string;
    payload: any;
    requiresConfirmation?: boolean;
  }[];
  dataReferences?: {
    type: string;
    id: string;
    title: string;
  }[];
}

export type NavRoute = 
  | 'dashboard'
  | 'leads'
  | 'contacts'
  | 'customers'
  | 'deals'
  | 'jobs'
  | 'documents'
  | 'products'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'expenses'
  | 'kirkol'
  | 'tasks'
  | 'calendar'
  | 'communications'
  | 'tickets'
  | 'automation'
  | 'ai'
  | 'analytics'
  | 'admin'
  | 'cloud_sync'
  | 'settings';

