import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { DocumentRecord } from '../../types';
import {
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  X,
  FileCheck,
  FolderOpen
} from 'lucide-react';

export const DocumentVaultModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser, setCurrentRoute, setSelectedCustomerId } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Document Form
  const [docName, setDocName] = useState('');
  const [docCustId, setDocCustId] = useState('');
  const [docCategory, setDocCategory] = useState('Passport & Travel');
  const [docFileType, setDocFileType] = useState('PDF');
  const [docSize, setDocSize] = useState('1.5 MB');
  const [docExpiry, setDocExpiry] = useState('');

  const documents = dataStore.getDocuments(activeOrg.id);
  const expiringDocs = dataStore.getExpiringDocuments(activeOrg.id, 30);
  const customers = dataStore.getCustomers(activeOrg.id);

  const categories = [
    'ALL',
    'Passport & Travel',
    'Government ID',
    'Vehicle & Transport',
    'Tax & Corporate',
    'Property & Legal'
  ];

  const filteredDocs = documents.filter(d => {
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === docCustId);
    if (!cust) {
      addToast('error', 'Validation Error', 'Please select a customer for this document.');
      return;
    }

    const created = dataStore.createDocument({
      organizationId: activeOrg.id,
      customerId: cust.id,
      customerName: cust.name,
      name: docName.endsWith('.pdf') || docName.endsWith('.jpg') ? docName : `${docName}.pdf`,
      category: docCategory,
      fileType: docFileType,
      fileSize: docSize,
      expiryDate: docExpiry || undefined,
      uploadedBy: currentUser.name
    });

    dataStore.recordActivity({
      organizationId: activeOrg.id,
      type: 'System Event',
      subject: `Uploaded Document ${created.name}`,
      description: `Uploaded ${created.category} document for ${cust.name}`,
      userId: currentUser.id,
      userName: currentUser.name,
      relatedType: 'customer',
      relatedId: cust.id
    });

    addToast('success', 'Document Vaulted', `Securely stored "${created.name}" for ${cust.name}`);
    setShowUploadModal(false);
    setDocName('');
    setDocExpiry('');
    triggerRefresh();
  };

  const handleDelete = (docId: string, name: string) => {
    dataStore.deleteDocument(docId);
    addToast('info', 'Document Removed', `Deleted "${name}" from vault.`);
    triggerRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Expiry Alert Warning Watchlist Banner */}
      {expiringDocs.length > 0 && (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)',
          borderColor: 'rgba(244, 63, 94, 0.3)',
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
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Document Expiration Watchlist</h3>
                <span className="badge badge-rose">{expiringDocs.length} Expiring Soon</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {expiringDocs.map(item => `${item.doc.customerName} (${item.doc.name} expires in ${item.daysLeft}d)`).join(' • ')}
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              addToast('success', 'Automated Alerts Dispatched', 'Sent WhatsApp renewal reminders to expiring document owners.');
            }}
          >
            <MessageSquare size={14} /> Send WhatsApp Reminders
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className="btn btn-sm"
                style={{
                  background: selectedCategory === cat ? 'var(--primary)' : 'transparent',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  padding: '3px 8px'
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search documents or customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
          <Plus size={16} /> Upload Document
        </button>
      </div>

      {/* Documents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredDocs.map(doc => {
          const expItem = expiringDocs.find(item => item.doc.id === doc.id);

          return (
            <div key={doc.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                      {doc.name}
                    </h4>
                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Customer: <strong style={{ color: 'var(--text-main)' }}>{doc.customerName}</strong>
                    </p>
                  </div>
                </div>

                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{doc.category}</span>
              </div>

              {/* Expiry or Verified Status */}
              <div style={{
                background: 'var(--bg-surface-1)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.725rem'
              }}>
                <span style={{ color: 'var(--text-dim)' }}>File Size: {doc.fileSize}</span>
                {doc.expiryDate ? (
                  <span className={`badge ${expItem ? 'badge-rose' : 'badge-emerald'}`}>
                    <Clock size={11} /> {expItem ? `Expires in ${expItem.daysLeft}d` : `Valid until ${doc.expiryDate}`}
                  </span>
                ) : (
                  <span className="badge badge-emerald">
                    <FileCheck size={11} /> Verified ID
                  </span>
                )}
              </div>

              <div style={{
                marginTop: 'auto',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-glass-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Uploaded by {doc.uploadedBy}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-glass btn-sm"
                    style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    onClick={() => addToast('info', 'Download Simulator', `Downloading "${doc.name}"...`)}
                  >
                    <Download size={13} color="var(--primary)" /> Download
                  </button>
                  <button
                    className="btn btn-danger btn-icon btn-sm"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => handleDelete(doc.id, doc.name)}
                    title="Delete Document"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Vault Customer Document</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowUploadModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Customer *</label>
                <select
                  required
                  value={docCustId}
                  onChange={e => setDocCustId(e.target.value)}
                  className="input-glass"
                >
                  <option value="" style={{ background: '#0f172a' }}>-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name} ({c.customerCode})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Document Name / File *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Passport Color Copy.pdf"
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value)}
                    className="input-glass"
                  >
                    <option value="Passport & Travel" style={{ background: '#0f172a' }}>Passport & Travel</option>
                    <option value="Government ID" style={{ background: '#0f172a' }}>Government ID (Aadhaar/PAN)</option>
                    <option value="Vehicle & Transport" style={{ background: '#0f172a' }}>Vehicle & Transport (RC Book)</option>
                    <option value="Tax & Corporate" style={{ background: '#0f172a' }}>Tax & Corporate (GST Cert)</option>
                    <option value="Property & Legal" style={{ background: '#0f172a' }}>Property & Legal Deeds</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={docExpiry}
                    onChange={e => setDocExpiry(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>File Size</label>
                  <input
                    type="text"
                    value={docSize}
                    onChange={e => setDocSize(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Document Vault</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
