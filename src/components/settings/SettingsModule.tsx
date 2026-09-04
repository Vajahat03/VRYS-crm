import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { ProductService } from '../../types';
import {
  Settings,
  ShoppingBag,
  Building2,
  Users,
  Plus,
  ShieldCheck,
  X,
  Database,
  Download,
  Upload,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  Save
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'org' | 'team' | 'backup'>('products');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Business Profile Form
  const [orgName, setOrgName] = useState(activeOrg.name);
  const [orgCity, setOrgCity] = useState(activeOrg.city || 'Mumbai');
  const [orgState, setOrgState] = useState(activeOrg.state || 'Maharashtra');
  const [orgTaxNumber, setOrgTaxNumber] = useState(activeOrg.taxNumber || '27AABCV1234F1Z5');
  const [orgCurrency, setOrgCurrency] = useState(activeOrg.currency || 'INR');

  // New Product Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Government Services');
  const [sellingPrice, setSellingPrice] = useState('');
  const [internalCost, setInternalCost] = useState('');
  const [govFee, setGovFee] = useState('0');

  // New User Form
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'OPERATIONS' | 'ACCOUNTANT' | 'SALES' | 'MANAGER'>('OPERATIONS');

  const products = dataStore.getProducts(activeOrg.id);
  const users = dataStore.getUsers(activeOrg.id);

  const handleUpdateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateOrganization(activeOrg.id, {
      name: orgName,
      city: orgCity,
      state: orgState,
      taxNumber: orgTaxNumber,
      currency: orgCurrency
    });
    addToast('success', 'Profile Updated', 'Saved company and tax settings.');
    triggerRefresh();
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice) return;

    dataStore.createProduct({
      organizationId: activeOrg.id,
      name,
      sku: sku || `SRV-${Date.now().toString(36).toUpperCase()}`,
      category,
      sellingPrice: Number(sellingPrice) || 0,
      internalCost: Number(internalCost) || 0,
      governmentFee: Number(govFee) || 0,
      taxRate: 18,
      durationDays: 7,
      active: true
    });

    addToast('success', 'Service Added', `Added ${name} to organization catalog.`);
    setShowAddProductModal(false);
    setName('');
    setSellingPrice('');
    setInternalCost('');
    triggerRefresh();
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    dataStore.createUser({
      organizationId: activeOrg.id,
      name: userName,
      email: userEmail,
      phone: userPhone,
      role: userRole,
      roleName: userRole.replace('_', ' '),
      status: 'active'
    });

    addToast('success', 'Team Member Added', `Created account for ${userName} (${userRole})`);
    setShowAddUserModal(false);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    triggerRefresh();
  };

  const handleExportFullBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      organization: activeOrg,
      users,
      products,
      customers: dataStore.getCustomers(activeOrg.id),
      leads: dataStore.getLeads(activeOrg.id),
      jobs: dataStore.getJobs(activeOrg.id),
      quotes: dataStore.getQuotes(activeOrg.id),
      invoices: dataStore.getInvoices(activeOrg.id),
      documents: dataStore.getDocuments(activeOrg.id)
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `vrys_full_backup_${activeOrg.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('success', 'Database Snapshot Exported', 'Downloaded complete offline JSON backup.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-2)', padding: '4px', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
        <button
          className="btn btn-sm"
          style={{ background: activeTab === 'products' ? 'var(--primary)' : 'transparent', color: activeTab === 'products' ? '#fff' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('products')}
        >
          <ShoppingBag size={15} /> Services Catalog ({products.length})
        </button>
        <button
          className="btn btn-sm"
          style={{ background: activeTab === 'org' ? 'var(--primary)' : 'transparent', color: activeTab === 'org' ? '#fff' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('org')}
        >
          <Building2 size={15} /> Business Profile & GST
        </button>
        <button
          className="btn btn-sm"
          style={{ background: activeTab === 'team' ? 'var(--primary)' : 'transparent', color: activeTab === 'team' ? '#fff' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('team')}
        >
          <Users size={15} /> Team & Roles ({users.length})
        </button>
        <button
          className="btn btn-sm"
          style={{ background: activeTab === 'backup' ? 'var(--primary)' : 'transparent', color: activeTab === 'backup' ? '#fff' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('backup')}
        >
          <Database size={15} /> Backup & Security
        </button>
      </div>

      {/* Products & Services Tab */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure billable services, internal operational costs, and profit margins.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddProductModal(true)}>
              <Plus size={15} /> Add Service / Product
            </button>
          </div>

          <div className="table-container">
            <table className="vrys-table">
              <thead>
                <tr>
                  <th>Service Name & SKU</th>
                  <th>Category</th>
                  <th>Selling Rate</th>
                  <th>Internal Cost</th>
                  <th>Govt Fee</th>
                  <th>Net Profit / Margin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <p style={{ fontWeight: 700 }}>{p.name}</p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-muted)' }}>{p.sku}</span>
                    </td>
                    <td><span className="badge badge-indigo">{p.category}</span></td>
                    <td><strong>₹{p.sellingPrice.toLocaleString('en-IN')}</strong></td>
                    <td style={{ color: 'var(--rose)' }}>₹{p.internalCost.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-dim)' }}>₹{p.governmentFee.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-emerald">
                        ₹{p.profit.toLocaleString('en-IN')} ({p.sellingPrice > 0 ? ((p.profit / p.sellingPrice) * 100).toFixed(0) : 0}%)
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-emerald">ACTIVE</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Business Profile & GST Tab */}
      {activeTab === 'org' && (
        <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Building2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Company & Tax Identification</h3>
          </div>

          <form onSubmit={handleUpdateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Organization Business Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="input-glass"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>GSTIN / Tax ID</label>
                <input
                  type="text"
                  value={orgTaxNumber}
                  onChange={e => setOrgTaxNumber(e.target.value)}
                  className="input-glass"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Currency</label>
                <input
                  type="text"
                  value={orgCurrency}
                  onChange={e => setOrgCurrency(e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>City</label>
                <input
                  type="text"
                  value={orgCity}
                  onChange={e => setOrgCity(e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>State</label>
                <input
                  type="text"
                  value={orgState}
                  onChange={e => setOrgState(e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={15} /> Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team & Roles Tab */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage technicians, accountants, and branch operators with role-based access.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}>
              <Plus size={15} /> Invite Team Member
            </button>
          </div>

          <div className="table-container">
            <table className="vrys-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <p style={{ fontWeight: 700 }}>{u.name}</p>
                    </td>
                    <td><span className="badge badge-indigo">{u.roleName}</span></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className="badge badge-emerald">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Backup & Security Tab */}
      {activeTab === 'backup' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Full System Snapshot Backup</h3>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Export an encrypted, complete offline JSON snapshot containing all customers, leads, jobs, quotes, tax invoices, and document records.
            </p>

            <button className="btn btn-primary" style={{ marginTop: 'auto' }} onClick={handleExportFullBackup}>
              <Download size={16} /> Export JSON Snapshot
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} color="var(--emerald)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Security & Isolation Health</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-glass-subtle)' }}>
                <span>Multi-Tenant Tenant Isolation:</span>
                <strong style={{ color: 'var(--emerald)' }}>STRICT (orgId scoped)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-glass-subtle)' }}>
                <span>Offline-First Storage Engine:</span>
                <strong style={{ color: 'var(--emerald)' }}>LocalStorage + IndexedDB</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span>Cloud PostgreSQL Replication:</span>
                <strong style={{ color: 'var(--primary)' }}>Ready for Supabase Sync</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="modal-backdrop" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add Catalog Product / Service</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddProductModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visa Assistance (Schengen / UAE)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Internal Work Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={internalCost}
                    onChange={e => setInternalCost(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add Team Member</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddUserModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zaid Khan"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="zaid@domain.com"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={userPhone}
                    onChange={e => setUserPhone(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role Permission</label>
                  <select
                    value={userRole}
                    onChange={e => setUserRole(e.target.value as any)}
                    className="input-glass"
                  >
                    <option value="OPERATIONS" style={{ background: '#0f172a' }}>Operations & Technician</option>
                    <option value="ACCOUNTANT" style={{ background: '#0f172a' }}>Accountant & Finance</option>
                    <option value="SALES" style={{ background: '#0f172a' }}>Sales Representative</option>
                    <option value="MANAGER" style={{ background: '#0f172a' }}>Branch Manager</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
