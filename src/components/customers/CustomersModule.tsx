import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Customer, Job, Invoice, Payment, Task, Activity, PaymentMethod } from '../../types';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  Layers,
  ReceiptText,
  CreditCard,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  ArrowUpRight,
  Filter,
  Copy,
  PlusCircle
} from 'lucide-react';
import { generateInvoicePDF, generatePaymentReceiptPDF } from '../../services/pdfService';

export const CustomersModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser, selectedCustomerId, setSelectedCustomerId, setCurrentRoute } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // 360 Direct Action Modals
  const [showDirectJobModal, setShowDirectJobModal] = useState(false);
  const [showDirectPaymentModal, setShowDirectPaymentModal] = useState(false);
  const [showDirectNoteModal, setShowDirectNoteModal] = useState(false);

  // Direct Job State
  const [jobTitle, setJobTitle] = useState('Fresh Passport Application (Tatkaal/Normal)');
  const [jobTotal, setJobTotal] = useState('2000');
  const [jobExpense, setJobExpense] = useState('300');
  const [jobAdvance, setJobAdvance] = useState('1000');

  // Direct Payment State
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payRef, setPayRef] = useState('');

  // Direct Note State
  const [noteType, setNoteType] = useState<'Call' | 'Meeting' | 'Note'>('Call');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteDesc, setNoteDesc] = useState('');

  // New Customer State
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState('Individual');

  // Customer 360 Active Tab & Timeline Filter
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'invoices' | 'payments' | 'tasks' | 'timeline'>('overview');
  const [timelineFilter, setTimelineFilter] = useState<string>('ALL');

  const customers = dataStore.getCustomers(activeOrg.id);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    c.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCustomer = selectedCustomerId
    ? dataStore.getCustomerById(selectedCustomerId) || customers[0]
    : customers[0];

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile) {
      addToast('error', 'Validation Error', 'Customer name and mobile number are required.');
      return;
    }

    const created = dataStore.createCustomer({
      organizationId: activeOrg.id,
      name: newName,
      mobile: newMobile,
      email: newEmail,
      companyName: newCompany,
      address: newAddress,
      category: newCategory,
      lifetimeValue: 0,
      outstandingAmount: 0,
      totalRevenue: 0,
      tags: ['New Customer'],
      ownerId: currentUser.id,
      status: 'active'
    });

    addToast('success', 'Customer Created', `Registered ${created.name} (${created.customerCode})`);
    setShowAddModal(false);
    setSelectedCustomerId(created.id);
    setNewName('');
    setNewMobile('');
    setNewEmail('');
    setNewCompany('');
    setNewAddress('');
    triggerRefresh();
  };

  const handleCreateDirectJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;

    const created = dataStore.createJob({
      organizationId: activeOrg.id,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.mobile,
      title: jobTitle,
      serviceName: jobTitle,
      status: 'In Progress',
      priority: 'medium',
      assignedTo: currentUser.id,
      assignedToName: currentUser.name,
      totalAmount: Number(jobTotal) || 0,
      workExpense: Number(jobExpense) || 0,
      paidAmount: Number(jobAdvance) || 0,
      requiredDocuments: ['Aadhaar Card', 'Passport Copy'],
      receivedDocuments: ['Aadhaar Card'],
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    // Log to Timeline
    dataStore.recordActivity({
      organizationId: activeOrg.id,
      type: 'System Event',
      subject: `Created Job ${created.jobNumber}`,
      description: `Job "${jobTitle}" initialized for ${activeCustomer.name} (Value: ₹${Number(jobTotal).toLocaleString('en-IN')})`,
      userId: currentUser.id,
      userName: currentUser.name,
      relatedType: 'customer',
      relatedId: activeCustomer.id
    });

    addToast('success', 'Job Created', `Job #${created.jobNumber} attached to ${activeCustomer.name}`);
    setShowDirectJobModal(false);
    triggerRefresh();
  };

  const handleRecordDirectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;

    const recorded = dataStore.recordPayment({
      organizationId: activeOrg.id,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      amount: Number(payAmount) || 0,
      paymentMethod: payMethod,
      transactionReference: payRef,
      paymentDate: new Date().toISOString(),
      recordedBy: currentUser.name
    });

    dataStore.recordActivity({
      organizationId: activeOrg.id,
      type: 'Payment',
      subject: `Payment Received ₹${Number(payAmount).toLocaleString('en-IN')}`,
      description: `Payment recorded via ${payMethod} (Receipt #${recorded.receiptNumber})`,
      userId: currentUser.id,
      userName: currentUser.name,
      relatedType: 'customer',
      relatedId: activeCustomer.id
    });

    addToast('success', 'Payment Logged', `Receipt #${recorded.receiptNumber} generated.`);
    setShowDirectPaymentModal(false);
    setPayAmount('');
    setPayRef('');
    triggerRefresh();
  };

  const handleSaveDirectNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || !noteSubject) return;

    dataStore.recordActivity({
      organizationId: activeOrg.id,
      type: noteType,
      subject: noteSubject,
      description: noteDesc,
      userId: currentUser.id,
      userName: currentUser.name,
      relatedType: 'customer',
      relatedId: activeCustomer.id
    });

    addToast('success', 'Activity Logged', `Logged ${noteType} in customer timeline.`);
    setShowDirectNoteModal(false);
    setNoteSubject('');
    setNoteDesc('');
    triggerRefresh();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast('info', 'Copied to Clipboard', `Customer Code ${code} copied.`);
  };

  // 360 Details Queries
  const custJobs = activeCustomer ? dataStore.getJobs(activeOrg.id).filter(j => j.customerId === activeCustomer.id) : [];
  const custInvoices = activeCustomer ? dataStore.getInvoices(activeOrg.id).filter(i => i.customerId === activeCustomer.id) : [];
  const custPayments = activeCustomer ? dataStore.getPayments(activeOrg.id).filter(p => p.customerId === activeCustomer.id) : [];
  const custActivities = activeCustomer ? dataStore.getActivities(activeOrg.id).filter(a => a.relatedId === activeCustomer.id) : [];

  const filteredActivities = custActivities.filter(a => timelineFilter === 'ALL' || a.type === timelineFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search by name, code, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-glass"
            style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.825rem' }}
          />
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> New Customer
        </button>
      </div>

      {/* Main Split Layout: Customer List + 360 Profile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeCustomer ? '340px 1fr' : '1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Customer Directory Cards */}
        <div className="glass-panel" style={{ padding: '1rem', maxHeight: '82vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            Customer Directory ({filteredCustomers.length})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredCustomers.map(cust => {
              const isSelected = activeCustomer?.id === cust.id;

              return (
                <div
                  key={cust.id}
                  className="glass-card"
                  style={{
                    padding: '0.85rem',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-glass)',
                    boxShadow: isSelected ? '0 0 15px -3px var(--primary-glow)' : 'none'
                  }}
                  onClick={() => setSelectedCustomerId(cust.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                        {cust.name}
                      </h4>
                      <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {cust.customerCode} • {cust.companyName || 'Individual'}
                      </p>
                    </div>

                    <span className={`badge ${cust.status === 'vip' ? 'badge-indigo' : cust.status === 'at_risk' ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                      {cust.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{
                    marginTop: '0.6rem',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid var(--border-glass-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.725rem'
                  }}>
                    <span>Rev: <strong style={{ color: 'var(--emerald)' }}>{activeOrg.currency}{cust.lifetimeValue.toLocaleString('en-IN')}</strong></span>
                    <span>Due: <strong style={{ color: cust.outstandingAmount > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>{activeOrg.currency}{cust.outstandingAmount.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer 360° Profile View */}
        {activeCustomer ? (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* 360 Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-glass-subtle)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeCustomer.name}</h2>
                  <button
                    className="badge badge-indigo"
                    style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => copyCode(activeCustomer.customerCode)}
                    title="Click to copy Customer Code"
                  >
                    <span>{activeCustomer.customerCode}</span>
                    <Copy size={11} />
                  </button>
                  <span className={`badge ${activeCustomer.status === 'vip' ? 'badge-indigo' : 'badge-emerald'}`}>
                    {activeCustomer.category}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} color="var(--primary)" /> {activeCustomer.mobile}
                  </span>
                  {activeCustomer.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={13} color="var(--secondary)" /> {activeCustomer.email}
                    </span>
                  )}
                  {activeCustomer.address && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--rose)" /> {activeCustomer.address}
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Snapshot Badges */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="glass-card" style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>Lifetime Revenue</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald)' }}>
                    {activeOrg.currency} {activeCustomer.lifetimeValue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="glass-card" style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>Outstanding Balance</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: activeCustomer.outstandingAmount > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                    {activeOrg.currency} {activeCustomer.outstandingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Action Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface-2)',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass-subtle)',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Customer 360 Direct Actions:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowDirectJobModal(true)}>
                  <Plus size={14} /> Create Job
                </button>
                <button
                  className="btn btn-glass btn-sm"
                  onClick={() => {
                    setPayAmount(activeCustomer.outstandingAmount > 0 ? activeCustomer.outstandingAmount.toString() : '1000');
                    setShowDirectPaymentModal(true);
                  }}
                >
                  <CreditCard size={14} color="var(--emerald)" /> Record Payment
                </button>
                <button className="btn btn-glass btn-sm" onClick={() => setShowDirectNoteModal(true)}>
                  <Clock size={14} color="var(--primary)" /> Log Note / Call
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    addToast('success', 'WhatsApp Initiated', `Opening WhatsApp conversation for ${activeCustomer.name}`);
                    setCurrentRoute('communications');
                  }}
                >
                  <MessageSquare size={14} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'jobs', label: `Jobs (${custJobs.length})` },
                { id: 'invoices', label: `Invoices (${custInvoices.length})` },
                { id: 'payments', label: `Payments (${custPayments.length})` },
                { id: 'timeline', label: `Timeline (${custActivities.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  className="btn btn-sm"
                  style={{
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.85rem'
                  }}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="glass-card">
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Total Active Jobs</span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{custJobs.length}</p>
                  </div>
                  <div className="glass-card">
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Billed Invoices</span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{custInvoices.length}</p>
                  </div>
                  <div className="glass-card">
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Customer Category</span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{activeCustomer.category}</p>
                  </div>
                </div>

                <div className="glass-card">
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Customer Tags & Segments</h4>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activeCustomer.tags.map((t, idx) => (
                      <span key={idx} className="badge badge-indigo">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {custJobs.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No active jobs recorded for this customer.</p>
                ) : (
                  custJobs.map(job => (
                    <div key={job.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{job.title}</span>
                          <span className="badge badge-amber">{job.status}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {job.jobNumber} • Delivery: {job.deliveryDate || 'TBD'} • Assigned: {job.assignedToName}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--emerald)' }}>{activeOrg.currency} {job.totalAmount.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: '0.725rem', color: job.balanceAmount > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                          Bal: {activeOrg.currency}{job.balanceAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {custInvoices.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No invoices generated yet.</p>
                ) : (
                  custInvoices.map(inv => (
                    <div key={inv.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{inv.invoiceNumber}</span>
                          <span className={`badge ${inv.status === 'Paid' ? 'badge-emerald' : 'badge-rose'}`}>{inv.status}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700 }}>{activeOrg.currency} {inv.total.toLocaleString('en-IN')}</p>
                          <p style={{ fontSize: '0.725rem', color: 'var(--emerald)' }}>Paid: {activeOrg.currency}{inv.paidAmount.toLocaleString('en-IN')}</p>
                        </div>

                        <button
                          className="btn btn-glass btn-sm"
                          onClick={() => generateInvoicePDF(inv, activeOrg)}
                          title="Download A4 PDF Invoice"
                        >
                          <FileText size={15} color="var(--primary)" /> PDF
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {custPayments.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No payment transactions recorded.</p>
                ) : (
                  custPayments.map(pay => (
                    <div key={pay.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pay.receiptNumber}</span>
                          <span className="badge badge-emerald">{pay.paymentMethod}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(pay.paymentDate).toLocaleDateString()} • Ref: {pay.transactionReference || 'N/A'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--emerald)' }}>
                          {activeOrg.currency} {pay.amount.toLocaleString('en-IN')}
                        </p>
                        <button
                          className="btn btn-glass btn-sm"
                          onClick={() => generatePaymentReceiptPDF(pay, activeOrg)}
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Activity Timeline Tab with Filters */}
            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['ALL', 'Call', 'WhatsApp', 'Payment', 'Meeting', 'Note', 'System Event'].map(type => (
                    <button
                      key={type}
                      className="btn btn-sm"
                      style={{
                        background: timelineFilter === type ? 'var(--primary)' : 'var(--bg-surface-2)',
                        color: timelineFilter === type ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.7rem',
                        padding: '2px 8px'
                      }}
                      onClick={() => setTimelineFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {filteredActivities.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '1rem 0' }}>No timeline events found for filter "{timelineFilter}".</p>
                ) : (
                  filteredActivities.map(act => (
                    <div key={act.id} className="glass-card" style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: act.type === 'Payment' ? 'rgba(16, 185, 129, 0.15)' : act.type === 'WhatsApp' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {act.type === 'Payment' ? <CreditCard size={15} color="var(--emerald)" /> : act.type === 'WhatsApp' ? <MessageSquare size={15} color="var(--emerald)" /> : <Clock size={15} color="var(--primary)" />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{act.subject}</p>
                          <span className="badge badge-indigo" style={{ fontSize: '0.6rem' }}>{act.type}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{act.description}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          By {act.userName} • {new Date(act.occurredAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <h3>Select a customer from the directory</h3>
            <p style={{ fontSize: '0.85rem' }}>View unified Customer 360° overview, jobs, invoices, and payment histories.</p>
          </div>
        )}
      </div>

      {/* Modal: Direct Job Creation */}
      {showDirectJobModal && activeCustomer && (
        <div className="modal-backdrop" onClick={() => setShowDirectJobModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>New Job for {activeCustomer.name}</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowDirectJobModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateDirectJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Job Title / Service</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Amount</label>
                  <input
                    type="number"
                    value={jobTotal}
                    onChange={e => setJobTotal(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Work Expense</label>
                  <input
                    type="number"
                    value={jobExpense}
                    onChange={e => setJobExpense(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Advance Paid</label>
                  <input
                    type="number"
                    value={jobAdvance}
                    onChange={e => setJobAdvance(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowDirectJobModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Payment Recording */}
      {showDirectPaymentModal && activeCustomer && (
        <div className="modal-backdrop" onClick={() => setShowDirectPaymentModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Record Payment for {activeCustomer.name}</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowDirectPaymentModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleRecordDirectPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount Paid ({activeOrg.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Payment Mode</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    className="input-glass"
                  >
                    <option value="UPI" style={{ background: '#0f172a' }}>UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash" style={{ background: '#0f172a' }}>Cash</option>
                    <option value="Card" style={{ background: '#0f172a' }}>Card</option>
                    <option value="Bank Transfer" style={{ background: '#0f172a' }}>Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Transaction Reference / UPI Ref</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/3940192931/PAYTM"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowDirectPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Issue Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Note / Call Recording */}
      {showDirectNoteModal && activeCustomer && (
        <div className="modal-backdrop" onClick={() => setShowDirectNoteModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Log Activity for {activeCustomer.name}</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowDirectNoteModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveDirectNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Activity Type</label>
                  <select
                    value={noteType}
                    onChange={e => setNoteType(e.target.value as any)}
                    className="input-glass"
                  >
                    <option value="Call" style={{ background: '#0f172a' }}>Phone Call</option>
                    <option value="Meeting" style={{ background: '#0f172a' }}>In-Person Meeting</option>
                    <option value="Note" style={{ background: '#0f172a' }}>General Note</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Discussed Tatkaal slot options"
                    value={noteSubject}
                    onChange={e => setNoteSubject(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Details / Discussion Summary</label>
                <textarea
                  rows={3}
                  placeholder="Key outcome or follow-up agreement..."
                  value={noteDesc}
                  onChange={e => setNoteDesc(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowDirectNoteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Timeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Register New Customer</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={newMobile}
                    onChange={e => setNewMobile(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@domain.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Company Name</label>
                  <input
                    type="text"
                    placeholder="Enterprise Name"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Address / Location</label>
                <input
                  type="text"
                  placeholder="Street address, City"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Customer Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="input-glass"
                >
                  <option value="Individual" style={{ background: '#0f172a' }}>Individual</option>
                  <option value="Commercial" style={{ background: '#0f172a' }}>Commercial</option>
                  <option value="Corporate VIP" style={{ background: '#0f172a' }}>Corporate VIP</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
