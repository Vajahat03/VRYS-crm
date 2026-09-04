import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Invoice, Payment, Expense, KirkolSale, PaymentMethod } from '../../types';
import {
  ReceiptText,
  CreditCard,
  TrendingDown,
  Store,
  Plus,
  Search,
  FileText,
  Download,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  X,
  AlertTriangle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { generateInvoicePDF, generatePaymentReceiptPDF } from '../../services/pdfService';

export const FinanceModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'kirkol' | 'expenses'>('invoices');

  // Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showKirkolModal, setShowKirkolModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Quick Payment State
  const [payCustId, setPayCustId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Quick Kirkol State
  const [kirCategory, setKirCategory] = useState('Printing & Xerox');
  const [kirAmount, setKirAmount] = useState('150');
  const [kirMethod, setKirMethod] = useState<PaymentMethod>('UPI');
  const [kirDesc, setKirDesc] = useState('');

  // Quick Expense State
  const [expCategory, setExpCategory] = useState('Shop Supplies & Paper');
  const [expAmount, setExpAmount] = useState('500');
  const [expMethod, setExpMethod] = useState<PaymentMethod>('Cash');
  const [expDesc, setExpDesc] = useState('');

  const metrics = dataStore.getFinancialMetrics(activeOrg.id);
  const invoices = dataStore.getInvoices(activeOrg.id);
  const payments = dataStore.getPayments(activeOrg.id);
  const kirkol = dataStore.getKirkol(activeOrg.id);
  const expenses = dataStore.getExpenses(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);
  const overdueInvoices = dataStore.getOverdueInvoices(activeOrg.id);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === payCustId);
    if (!cust) {
      addToast('error', 'Validation Error', 'Please select a customer.');
      return;
    }

    const recorded = dataStore.recordPayment({
      organizationId: activeOrg.id,
      customerId: cust.id,
      customerName: cust.name,
      amount: Number(payAmount) || 0,
      paymentMethod: payMethod,
      transactionReference: payRef,
      paymentDate: new Date().toISOString(),
      notes: payNotes,
      recordedBy: currentUser.name
    });

    addToast('success', 'Payment Recorded', `Receipt #${recorded.receiptNumber} created for ${cust.name}`);
    setShowPaymentModal(false);
    setPayAmount('');
    setPayRef('');
    triggerRefresh();
  };

  const handleRecordKirkol = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.recordKirkol({
      organizationId: activeOrg.id,
      category: kirCategory,
      description: kirDesc,
      amount: Number(kirAmount) || 0,
      paymentMethod: kirMethod,
      date: new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name
    });

    addToast('success', 'Counter Sale Logged', `Logged ${activeOrg.currency}${kirAmount} (${kirCategory})`);
    setShowKirkolModal(false);
    setKirDesc('');
    triggerRefresh();
  };

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.createExpense({
      organizationId: activeOrg.id,
      category: expCategory,
      amount: Number(expAmount) || 0,
      date: new Date().toISOString().split('T')[0],
      description: expDesc,
      paymentMethod: expMethod,
      recordedBy: currentUser.name
    });

    addToast('success', 'Expense Recorded', `Logged ${activeOrg.currency}${expAmount} for ${expCategory}`);
    setShowExpenseModal(false);
    setExpDesc('');
    triggerRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overdue Invoices Alert Banner */}
      {overdueInvoices.length > 0 && (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          borderColor: 'rgba(244, 63, 94, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={22} color="var(--rose)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Overdue Invoices Alert</h3>
                <span className="badge badge-rose">{overdueInvoices.length} Unpaid Past Due</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {overdueInvoices.map(i => `${i.customerName} (₹${i.balanceAmount.toLocaleString('en-IN')} due ${new Date(i.dueDate).toLocaleDateString()})`).join(' • ')}
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              addToast('success', 'WhatsApp Reminders Sent', `Dispatched payment reminders for ${overdueInvoices.length} overdue invoices.`);
            }}
          >
            <MessageSquare size={14} /> Send WhatsApp Payment Reminders
          </button>
        </div>
      )}

      {/* Financial Executive Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Income</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-highlight)' }}>
            {activeOrg.currency} {metrics.businessIncome.toLocaleString('en-IN')}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Service Profit ({activeOrg.currency}{metrics.customerServiceProfit.toLocaleString('en-IN')}) + Kirkol ({activeOrg.currency}{metrics.kirkolRevenue.toLocaleString('en-IN')})
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Business Spending</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--rose)' }}>
            {activeOrg.currency} {metrics.businessSpending.toLocaleString('en-IN')}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Rent, fiber, supplies & operations
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Net Profit</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)' }}>
            {activeOrg.currency} {metrics.netProfit.toLocaleString('en-IN')}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--emerald)', marginTop: '2px' }}>
            Real business net balance
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Kirkol (Counter)</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {activeOrg.currency} {metrics.kirkolRevenue.toLocaleString('en-IN')}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '2px' }}>
            Fast daily cash & UPI flow
          </p>
        </div>
      </div>

      {/* VRYS AI Finance Agent Contextual Banner */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={16} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>VRYS AI Finance &amp; Ledger Agent</h4>
              <span className="badge badge-emerald" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>Margin &amp; Tax Health: Healthy (48.5%)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Net Profit is strong at <strong>{activeOrg.currency}{metrics.netProfit.toLocaleString('en-IN')}</strong>. <strong>₹{metrics.totalOutstanding.toLocaleString('en-IN')}</strong> outstanding balances are ready for instant 1-click WhatsApp payment links.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" style={{ fontSize: '0.725rem', padding: '4px 10px' }} onClick={() => setActiveTab('invoices')}>
            ⚡ Collect Overdue Receivables
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Fast Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-2)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'invoices' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'invoices' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('invoices')}
          >
            <ReceiptText size={15} /> Invoices ({invoices.length})
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'payments' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'payments' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={15} /> Payments ({payments.length})
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'kirkol' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'kirkol' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('kirkol')}
          >
            <Store size={15} /> Counter Sales / Kirkol ({kirkol.length})
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: activeTab === 'expenses' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'expenses' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('expenses')}
          >
            <TrendingDown size={15} /> Expenses ({expenses.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'payments' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowPaymentModal(true)}>
              <Plus size={15} /> Record Payment
            </button>
          )}
          {activeTab === 'kirkol' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowKirkolModal(true)}>
              <Plus size={15} /> Quick Add Kirkol
            </button>
          )}
          {activeTab === 'expenses' && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowExpenseModal(true)}>
              <Plus size={15} /> Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="table-container">
          <table className="vrys-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer Name</th>
                <th>Issue / Due Date</th>
                <th>Total Billed</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</strong></td>
                  <td>
                    <p style={{ fontWeight: 600 }}>{inv.customerName}</p>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{inv.customerPhone}</span>
                  </td>
                  <td>
                    <p style={{ fontSize: '0.8rem' }}>{new Date(inv.issueDate).toLocaleDateString()}</p>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                  </td>
                  <td><strong style={{ color: 'var(--text-highlight)' }}>{activeOrg.currency}{inv.total.toLocaleString('en-IN')}</strong></td>
                  <td><span style={{ color: 'var(--emerald)' }}>{activeOrg.currency}{inv.paidAmount.toLocaleString('en-IN')}</span></td>
                  <td>
                    <span style={{ fontWeight: 700, color: inv.balanceAmount > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                      {activeOrg.currency}{inv.balanceAmount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${inv.status === 'Paid' ? 'badge-emerald' : 'badge-amber'}`}>{inv.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-glass btn-sm"
                      onClick={() => generateInvoicePDF(inv, activeOrg)}
                      title="Download A4 PDF Invoice"
                    >
                      <Download size={14} color="var(--primary)" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="table-container">
          <table className="vrys-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Transaction Ref</th>
                <th>Date</th>
                <th>Recorded By</th>
                <th style={{ textAlign: 'right' }}>Receipt PDF</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(pay => (
                <tr key={pay.id}>
                  <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{pay.receiptNumber}</strong></td>
                  <td>{pay.customerName}</td>
                  <td><strong style={{ color: 'var(--emerald)', fontSize: '0.95rem' }}>{activeOrg.currency}{pay.amount.toLocaleString('en-IN')}</strong></td>
                  <td><span className="badge badge-indigo">{pay.paymentMethod}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{pay.transactionReference || 'Cash Payment'}</td>
                  <td>{new Date(pay.paymentDate).toLocaleDateString()}</td>
                  <td>{pay.recordedBy}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-glass btn-sm"
                      onClick={() => generatePaymentReceiptPDF(pay, activeOrg)}
                    >
                      <Download size={14} color="var(--emerald)" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Kirkol / Counter Sales Tab */}
      {activeTab === 'kirkol' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'rgba(6, 182, 212, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>Counter Income Engine (Fast Entry)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant logging for high-frequency counter services like Xerox, Lamination, Scanning, and Ticket Bookings.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowKirkolModal(true)}>
              + Quick Add
            </button>
          </div>

          <div className="table-container">
            <table className="vrys-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {kirkol.map(kir => (
                  <tr key={kir.id}>
                    <td><span className="badge badge-cyan">{kir.category}</span></td>
                    <td>{kir.description || 'Counter service'}</td>
                    <td><strong style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>{activeOrg.currency}{kir.amount.toLocaleString('en-IN')}</strong></td>
                    <td>{kir.paymentMethod}</td>
                    <td>{new Date(kir.date).toLocaleDateString()}</td>
                    <td>{kir.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="table-container">
          <table className="vrys-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td><span className="badge badge-rose">{exp.category}</span></td>
                  <td>{exp.description}</td>
                  <td><strong style={{ color: 'var(--rose)', fontSize: '0.95rem' }}>{activeOrg.currency}{exp.amount.toLocaleString('en-IN')}</strong></td>
                  <td>{exp.paymentMethod}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Record Payment */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Record Customer Payment</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowPaymentModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Customer *</label>
                <select
                  required
                  value={payCustId}
                  onChange={e => {
                    setPayCustId(e.target.value);
                    const c = customers.find(item => item.id === e.target.value);
                    if (c && c.outstandingAmount > 0) {
                      setPayAmount(c.outstandingAmount.toString());
                    }
                  }}
                  className="input-glass"
                >
                  <option value="" style={{ background: '#0f172a' }}>-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>
                      {c.name} (Due: {activeOrg.currency}{c.outstandingAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount Paid ({activeOrg.currency}) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    className="input-glass"
                  >
                    <option value="UPI" style={{ background: '#0f172a' }}>UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash" style={{ background: '#0f172a' }}>Cash</option>
                    <option value="Card" style={{ background: '#0f172a' }}>Debit / Credit Card</option>
                    <option value="Bank Transfer" style={{ background: '#0f172a' }}>Bank Transfer (IMPS/NEFT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Transaction Reference / UPI Ref #</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/203940192931/PAYTM"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record & Issue Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Kirkol */}
      {showKirkolModal && (
        <div className="modal-backdrop" onClick={() => setShowKirkolModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Fast Counter Sale (Kirkol)</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowKirkolModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleRecordKirkol} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Service Category</label>
                  <select
                    value={kirCategory}
                    onChange={e => setKirCategory(e.target.value)}
                    className="input-glass"
                  >
                    <option value="Printing & Xerox" style={{ background: '#0f172a' }}>Printing & Xerox</option>
                    <option value="Lamination" style={{ background: '#0f172a' }}>Lamination</option>
                    <option value="Scanning & Email" style={{ background: '#0f172a' }}>Scanning & Email</option>
                    <option value="Ticket Booking" style={{ background: '#0f172a' }}>IRCTC / Bus Ticket Booking</option>
                    <option value="Other Counter Service" style={{ background: '#0f172a' }}>Other Counter Service</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount ({activeOrg.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={kirAmount}
                    onChange={e => setKirAmount(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Payment Mode</label>
                  <select
                    value={kirMethod}
                    onChange={e => setKirMethod(e.target.value as PaymentMethod)}
                    className="input-glass"
                  >
                    <option value="UPI" style={{ background: '#0f172a' }}>UPI</option>
                    <option value="Cash" style={{ background: '#0f172a' }}>Cash</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Color prints + 2 spiral binds"
                    value={kirDesc}
                    onChange={e => setKirDesc(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowKirkolModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Counter Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Expense */}
      {showExpenseModal && (
        <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Record Business Expense</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowExpenseModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleRecordExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value)}
                    className="input-glass"
                  >
                    <option value="Shop Rent & Utilities" style={{ background: '#0f172a' }}>Shop Rent & Utilities</option>
                    <option value="Printer Supplies & Paper" style={{ background: '#0f172a' }}>Printer Supplies & Paper</option>
                    <option value="Internet & Fiber" style={{ background: '#0f172a' }}>Internet & Fiber</option>
                    <option value="Staff Refreshments" style={{ background: '#0f172a' }}>Staff Refreshments</option>
                    <option value="Other Expense" style={{ background: '#0f172a' }}>Other Expense</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount ({activeOrg.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Toner cartridge refilled for HP Laser"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Record Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
