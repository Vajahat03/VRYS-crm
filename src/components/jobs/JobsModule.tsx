import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Job, JobStatus } from '../../types';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertCircle,
  Calendar,
  User,
  X,
  Sparkles,
  Kanban,
  Table as TableIcon,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const JobsModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Drag & drop state
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<JobStatus | null>(null);

  // New Job Form State
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [serviceName, setServiceName] = useState('Fresh Passport Application (Tatkaal/Normal)');
  const [totalAmount, setTotalAmount] = useState('2000');
  const [workExpense, setWorkExpense] = useState('300');
  const [paidAmount, setPaidAmount] = useState('1000');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignedTo, setAssignedTo] = useState(currentUser.id);
  const [doc1, setDoc1] = useState('Aadhaar Card');
  const [doc2, setDoc2] = useState('Passport Photo');

  const jobs = dataStore.getJobs(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);
  const users = dataStore.getUsers(activeOrg.id);
  const products = dataStore.getProducts(activeOrg.id);

  const statuses: JobStatus[] = [
    'Pending',
    'Document Required',
    'In Progress',
    'Al Uzer',
    'Ready',
    'Delivered',
    'Completed',
    'Cancelled'
  ];

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust) {
      addToast('error', 'Validation Error', 'Please select a customer.');
      return;
    }

    const assignedUser = users.find(u => u.id === assignedTo) || currentUser;
    const reqDocs = [doc1, doc2].filter(Boolean);

    const created = dataStore.createJob({
      organizationId: activeOrg.id,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.mobile,
      title: title || serviceName,
      serviceName,
      status: 'In Progress',
      priority,
      assignedTo: assignedUser.id,
      assignedToName: assignedUser.name,
      totalAmount: Number(totalAmount) || 0,
      workExpense: Number(workExpense) || 0,
      paidAmount: Number(paidAmount) || 0,
      requiredDocuments: reqDocs,
      receivedDocuments: [doc1],
      deliveryDate: deliveryDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    addToast('success', 'Job Created', `Job ${created.jobNumber} assigned to ${assignedUser.name}`);
    setShowAddModal(false);
    triggerRefresh();
  };

  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    dataStore.updateJob(jobId, { status: newStatus });
    addToast('info', 'Status Updated', `Job marked as ${newStatus}`);
    triggerRefresh();
  };

  const handleToggleDocReceived = (job: Job, docName: string) => {
    const isAlready = job.receivedDocuments.includes(docName);
    const newReceived = isAlready
      ? job.receivedDocuments.filter(d => d !== docName)
      : [...job.receivedDocuments, docName];

    dataStore.updateJob(job.id, { receivedDocuments: newReceived });
    addToast('success', 'Document Check', `${docName} marked ${isAlready ? 'pending' : 'received'}`);
    triggerRefresh();
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('text/plain', jobId);
    setDraggedJobId(jobId);
  };

  const handleDragOver = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: JobStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
    if (jobId) {
      handleUpdateStatus(jobId, targetStatus);
    }
    setDraggedJobId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by job #, service, customer..."
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
            style={{ width: '180px', height: '36px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Operational Statuses</option>
            {statuses.map(st => (
              <option key={st} value={st} style={{ background: '#0f172a' }}>{st}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* View Switcher */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
            <button
              className="btn btn-sm"
              style={{
                background: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'kanban' ? '#fff' : 'var(--text-muted)',
                padding: '4px 8px'
              }}
              onClick={() => setViewMode('kanban')}
              title="Operational Kanban Board"
            >
              <Kanban size={15} />
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                padding: '4px 8px'
              }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={15} />
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> New Job / Order
          </button>
        </div>
      </div>

      {/* Operational Kanban View */}
      {viewMode === 'kanban' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem'
        }}>
          {statuses.map(status => {
            const statusJobs = filteredJobs.filter(j => j.status === status);
            const stageProfit = statusJobs.reduce((s, j) => s + (j.totalAmount - j.workExpense), 0);
            const isOver = dragOverStatus === status;

            return (
              <div
                key={status}
                onDragOver={e => handleDragOver(e, status)}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={e => handleDrop(e, status)}
                className="glass-panel"
                style={{
                  background: isOver ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-1)',
                  borderColor: isOver ? 'var(--primary)' : 'var(--border-glass)',
                  boxShadow: isOver ? '0 0 25px var(--primary-glow)' : 'var(--shadow-md)',
                  padding: '1rem',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.825rem' }}>{status}</span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>{statusJobs.length}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 700 }}>
                    +{activeOrg.currency}{stageProfit.toLocaleString('en-IN')} Profit
                  </span>
                </div>

                {/* Job Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {statusJobs.map(job => {
                    const isUrgent = job.priority === 'urgent';
                    const isReady = job.status === 'Ready' || job.status === 'Completed';
                    const profit = job.totalAmount - job.workExpense;
                    const marginPercent = job.totalAmount > 0 ? ((profit / job.totalAmount) * 100).toFixed(0) : 0;
                    const allDocsReceived = job.requiredDocuments.length > 0 && job.requiredDocuments.every(d => job.receivedDocuments.includes(d));

                    return (
                      <div
                        key={job.id}
                        draggable
                        onDragStart={e => handleDragStart(e, job.id)}
                        className="glass-card"
                        style={{
                          padding: '0.9rem',
                          cursor: 'grab',
                          borderLeft: isUrgent ? '3px solid var(--rose)' : undefined
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span className="badge badge-indigo" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{job.jobNumber}</span>
                              <span className={`badge ${isUrgent ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.6rem' }}>{job.priority.toUpperCase()}</span>
                            </div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-highlight)' }}>
                              {job.title}
                            </h4>
                            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              Customer: <strong>{job.customerName}</strong>
                            </p>
                          </div>

                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            {marginPercent}% Margin
                          </span>
                        </div>

                        {/* Document Verification Checkbox List */}
                        {job.requiredDocuments.length > 0 && (
                          <div style={{ background: 'var(--bg-surface-1)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', marginTop: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Documents</span>
                              <span style={{ fontSize: '0.65rem', color: allDocsReceived ? 'var(--emerald)' : 'var(--amber)' }}>
                                {job.receivedDocuments.length}/{job.requiredDocuments.length} Verified
                              </span>
                            </div>
                            {job.requiredDocuments.map((doc, dIdx) => {
                              const isRec = job.receivedDocuments.includes(doc);
                              return (
                                <div
                                  key={dIdx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    color: isRec ? 'var(--text-main)' : 'var(--text-muted)'
                                  }}
                                  onClick={() => handleToggleDocReceived(job, doc)}
                                >
                                  <span style={{ textDecoration: isRec ? 'line-through' : 'none' }}>• {doc}</span>
                                  <span>{isRec ? '✓' : '○'}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Financial Mini Bar */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '0.6rem',
                          paddingTop: '0.4rem',
                          borderTop: '1px solid var(--border-glass-subtle)',
                          fontSize: '0.725rem'
                        }}>
                          <span>Amount: <strong>{activeOrg.currency}{job.totalAmount.toLocaleString('en-IN')}</strong></span>
                          <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>+{activeOrg.currency}{profit.toLocaleString('en-IN')} Profit</span>
                        </div>

                        {/* Footer & SLA */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                          <span>Operator: {job.assignedToName}</span>
                          {job.deliveryDate && (
                            <span style={{ color: 'var(--secondary)' }}>Due: {new Date(job.deliveryDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table className="vrys-table">
            <thead>
              <tr>
                <th>Job # & Title</th>
                <th>Customer</th>
                <th>Total Value</th>
                <th>Work Expense</th>
                <th>Net Service Profit</th>
                <th>Balance Due</th>
                <th>Assigned Operator</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => {
                const profit = job.totalAmount - job.workExpense;

                return (
                  <tr key={job.id}>
                    <td>
                      <p style={{ fontWeight: 700 }}>{job.title}</p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--primary)' }}>{job.jobNumber}</span>
                    </td>
                    <td>
                      <p>{job.customerName}</p>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{job.customerPhone}</span>
                    </td>
                    <td><strong>{activeOrg.currency}{job.totalAmount.toLocaleString('en-IN')}</strong></td>
                    <td>{activeOrg.currency}{job.workExpense.toLocaleString('en-IN')}</td>
                    <td><strong style={{ color: 'var(--emerald)' }}>+{activeOrg.currency}{profit.toLocaleString('en-IN')}</strong></td>
                    <td>
                      <span style={{ fontWeight: 700, color: job.balanceAmount > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                        {activeOrg.currency}{job.balanceAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>{job.assignedToName}</td>
                    <td>
                      <select
                        value={job.status}
                        onChange={e => handleUpdateStatus(job.id, e.target.value as JobStatus)}
                        className="input-glass"
                        style={{ padding: '2px 4px', fontSize: '0.75rem' }}
                      >
                        {statuses.map(st => (
                          <option key={st} value={st} style={{ background: '#0f172a' }}>{st}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Job Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Create Operational Job / Order</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Customer *</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Service Category</label>
                  <select
                    value={serviceName}
                    onChange={e => {
                      setServiceName(e.target.value);
                      const s = products.find(p => p.name === e.target.value);
                      if (s) {
                        setTotalAmount(s.sellingPrice.toString());
                        setWorkExpense(s.internalCost.toString());
                      }
                    }}
                    className="input-glass"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.name} style={{ background: '#0f172a' }}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Job Title / Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Urgent Passport Tatkaal Submission"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Amount ({activeOrg.currency})</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Work Expense ({activeOrg.currency})</label>
                  <input
                    type="number"
                    value={workExpense}
                    onChange={e => setWorkExpense(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Advance Paid ({activeOrg.currency})</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Operator</label>
                  <select
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    className="input-glass"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id} style={{ background: '#0f172a' }}>{u.name} ({u.roleName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Operational Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
