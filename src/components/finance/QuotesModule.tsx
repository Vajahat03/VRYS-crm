import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Quote, LineItem, QuoteStatus } from '../../types';
import {
  ReceiptText,
  Plus,
  Search,
  Download,
  CheckCircle2,
  FileCheck,
  Send,
  X,
  Trash2,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign
} from 'lucide-react';
import { generateQuotePDF } from '../../services/pdfService';

export const QuotesModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser, setCurrentRoute } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Quote Builder State
  const [customerId, setCustomerId] = useState('');
  const [expiryDays, setExpiryDays] = useState('15');
  const [notes, setNotes] = useState('Quote valid for 15 days from issue date. Subject to standard terms.');
  const [items, setItems] = useState<Array<{ name: string; description: string; quantity: number; unitPrice: number; discount: number; taxRate: number }>>([
    { name: 'Fresh Passport Application (Tatkaal/Normal)', description: 'Government Tatkaal passport processing support', quantity: 1, unitPrice: 2000, discount: 0, taxRate: 18 }
  ]);

  const quotes = dataStore.getQuotes(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);
  const products = dataStore.getProducts(activeOrg.id);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: 'GST Monthly Filing & Reconciliation', description: 'Monthly GSTR-1 & 3B filing', quantity: 1, unitPrice: 1500, discount: 0, taxRate: 18 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSelectProduct = (index: number, prodName: string) => {
    const p = products.find(prod => prod.name === prodName);
    if (p) {
      const updated = [...items];
      updated[index] = {
        name: p.name,
        description: p.description || '',
        quantity: 1,
        unitPrice: p.sellingPrice,
        discount: 0,
        taxRate: p.taxRate || 18
      };
      setItems(updated);
    }
  };

  // Compute Live Totals
  const calculatedSubtotal = items.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.quantity) - Number(item.discount)), 0);
  const calculatedTax = items.reduce((sum, item) => {
    const taxable = Number(item.unitPrice) * Number(item.quantity) - Number(item.discount);
    return sum + (taxable * (Number(item.taxRate) / 100));
  }, 0);
  const calculatedGrandTotal = calculatedSubtotal + calculatedTax;

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust) {
      addToast('error', 'Validation Error', 'Please select a customer.');
      return;
    }

    const lineItems: LineItem[] = items.map((item, idx) => {
      const taxable = Number(item.unitPrice) * Number(item.quantity) - Number(item.discount);
      const taxAmt = taxable * (Number(item.taxRate) / 100);
      return {
        id: 'li_' + idx + '_' + Date.now().toString(36),
        name: item.name,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        tax: taxAmt,
        total: taxable + taxAmt
      };
    });

    const expDate = new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const created = dataStore.createQuote({
      organizationId: activeOrg.id,
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: expDate,
      items: lineItems,
      subtotal: calculatedSubtotal,
      discountTotal: items.reduce((s, i) => s + Number(i.discount), 0),
      taxTotal: calculatedTax,
      total: calculatedGrandTotal,
      status: 'Sent',
      notes,
      createdBy: currentUser.name
    });

    addToast('success', 'Quote Created', `Generated ${created.quoteNumber} for ${cust.name}`);
    setShowAddModal(false);
    triggerRefresh();
  };

  const handleConvertToInvoice = (quote: Quote) => {
    try {
      const inv = dataStore.convertQuoteToInvoice(quote.id, currentUser);
      addToast('success', 'Converted to Invoice!', `Created Tax Invoice #${inv.invoiceNumber} for ₹${inv.total.toLocaleString('en-IN')}`);
      triggerRefresh();
      setCurrentRoute('invoices');
    } catch (err: any) {
      addToast('error', 'Conversion Error', err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by quote #, customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.825rem' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-glass"
            style={{ width: '160px', height: '36px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> New Quote / Estimate
        </button>
      </div>

      {/* Quotes Table */}
      <div className="table-container">
        <table className="vrys-table">
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Customer</th>
              <th>Line Items</th>
              <th>Grand Total</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map(quote => (
              <tr key={quote.id}>
                <td>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{quote.quoteNumber}</strong>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{new Date(quote.issueDate).toLocaleDateString()}</p>
                </td>
                <td>
                  <p style={{ fontWeight: 600 }}>{quote.customerName}</p>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{quote.customerEmail || 'No Email'}</span>
                </td>
                <td>
                  <p style={{ fontSize: '0.8rem' }}>{quote.items[0]?.name || 'Custom Items'}</p>
                  {quote.items.length > 1 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>+{quote.items.length - 1} more items</span>
                  )}
                </td>
                <td>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--emerald)' }}>
                    {activeOrg.currency} {quote.total.toLocaleString('en-IN')}
                  </strong>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Incl. {activeOrg.currency}{Math.round(quote.taxTotal)} GST</p>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: new Date(quote.expiryDate) < new Date() ? 'var(--rose)' : 'var(--text-main)' }}>
                    {new Date(quote.expiryDate).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <span className={`badge ${quote.status === 'Accepted' ? 'badge-emerald' : quote.status === 'Sent' ? 'badge-indigo' : 'badge-amber'}`}>
                    {quote.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      className="btn btn-glass btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.725rem' }}
                      onClick={() => generateQuotePDF(quote, activeOrg)}
                      title="Download Printable PDF Quotation"
                    >
                      <Download size={13} color="var(--primary)" /> PDF
                    </button>

                    {quote.status !== 'Rejected' && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.725rem' }}
                        onClick={() => handleConvertToInvoice(quote)}
                        title="Convert directly to Tax Invoice"
                      >
                        Convert to Invoice →
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive New Quote Builder Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create Proforma Quote / Estimate</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Customer *</label>
                  <select
                    required
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    className="input-glass"
                  >
                    <option value="" style={{ background: '#0f172a' }}>-- Select Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name} ({c.customerCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Validity (Days)</label>
                  <input
                    type="number"
                    value={expiryDays}
                    onChange={e => setExpiryDays(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              {/* Line Items Table Builder */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Line Items & Services
                  </label>
                  <button type="button" className="btn btn-glass btn-sm" onClick={handleAddItem} style={{ fontSize: '0.725rem' }}>
                    <Plus size={13} /> Add Line Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {items.map((item, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '0.75rem', display: 'grid', gridTemplateColumns: '1.5fr 60px 100px 70px 30px', gap: '0.5rem', alignItems: 'center' }}>
                      <div>
                        <select
                          value={item.name}
                          onChange={e => handleSelectProduct(idx, e.target.value)}
                          className="input-glass"
                          style={{ fontSize: '0.75rem', padding: '4px 6px' }}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.name} style={{ background: '#0f172a' }}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        className="input-glass"
                        style={{ fontSize: '0.75rem', padding: '4px 6px', textAlign: 'center' }}
                        placeholder="Qty"
                      />

                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="input-glass"
                        style={{ fontSize: '0.75rem', padding: '4px 6px' }}
                        placeholder="Price"
                      />

                      <select
                        value={item.taxRate}
                        onChange={e => handleItemChange(idx, 'taxRate', e.target.value)}
                        className="input-glass"
                        style={{ fontSize: '0.75rem', padding: '4px 6px' }}
                      >
                        <option value="18" style={{ background: '#0f172a' }}>18%</option>
                        <option value="12" style={{ background: '#0f172a' }}>12%</option>
                        <option value="5" style={{ background: '#0f172a' }}>5%</option>
                        <option value="0" style={{ background: '#0f172a' }}>0%</option>
                      </select>

                      <button
                        type="button"
                        className="btn btn-danger btn-icon btn-sm"
                        style={{ width: '26px', height: '26px' }}
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary Box */}
              <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Subtotal: {activeOrg.currency}{calculatedSubtotal.toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginLeft: '1rem' }}>GST Tax: {activeOrg.currency}{calculatedTax.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Grand Total:</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald)' }}>
                    {activeOrg.currency} {Math.round(calculatedGrandTotal).toLocaleString('en-IN')}
                  </h3>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Terms & Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Official Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
