import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Contact, Company } from '../../types';
import {
  Users,
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Globe,
  Tag,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
  Briefcase
} from 'lucide-react';

export const ContactsCompaniesModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser, setCurrentRoute, setSelectedCustomerId } = useApp();
  const [activeTab, setActiveTab] = useState<'contacts' | 'companies'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  // New Contact Form
  const [cFirstName, setCFirstName] = useState('');
  const [cLastName, setCLastName] = useState('');
  const [cMobile, setCMobile] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cCompanyId, setCCompanyId] = useState('');
  const [cCity, setCCity] = useState('');
  const [cTags, setCTags] = useState('Director');

  // New Company Form
  const [compName, setCompName] = useState('');
  const [compIndustry, setCompIndustry] = useState('Trade & Logistics');
  const [compPhone, setCompPhone] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compCity, setCompCity] = useState('');

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const contacts = dataStore.getContacts(activeOrg.id);
  const companies = dataStore.getCompanies(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);

  const filteredContacts = contacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCompanies = companies.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.phone.includes(searchQuery) ||
    comp.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMobileChange = (mobile: string) => {
    setCMobile(mobile);
    if (mobile.length >= 8) {
      const dup = dataStore.checkDuplicate(activeOrg.id, mobile, cEmail);
      if (dup.isDuplicate) {
        setDuplicateWarning(dup.message || 'Duplicate record detected.');
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cFirstName || !cMobile) {
      addToast('error', 'Validation Error', 'First name and mobile number are required.');
      return;
    }

    const dup = dataStore.checkDuplicate(activeOrg.id, cMobile, cEmail);
    if (dup.isDuplicate) {
      addToast('warning', 'Duplicate Warning', dup.message);
    }

    const created = dataStore.createContact({
      organizationId: activeOrg.id,
      companyId: cCompanyId || undefined,
      firstName: cFirstName,
      lastName: cLastName,
      mobile: cMobile,
      email: cEmail,
      city: cCity,
      tags: cTags.split(',').map(t => t.trim()).filter(Boolean),
      ownerId: currentUser.id
    });

    addToast('success', 'Contact Created', `Added ${created.firstName} ${created.lastName} to contacts.`);
    setShowAddContactModal(false);
    setCFirstName('');
    setCLastName('');
    setCMobile('');
    setCEmail('');
    setDuplicateWarning(null);
    triggerRefresh();
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compPhone) {
      addToast('error', 'Validation Error', 'Company name and phone are required.');
      return;
    }

    const created = dataStore.createCompany({
      organizationId: activeOrg.id,
      name: compName,
      industry: compIndustry,
      phone: compPhone,
      email: compEmail,
      website: compWebsite,
      city: compCity,
      tags: [compIndustry, 'Active Account'],
      ownerId: currentUser.id
    });

    addToast('success', 'Company Created', `Registered ${created.name} (${created.industry}).`);
    setShowAddCompanyModal(false);
    setCompName('');
    setCompPhone('');
    setCompEmail('');
    triggerRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Search Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-surface-2)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'contacts' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'contacts' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab('contacts')}
            >
              <Users size={15} /> Contacts ({contacts.length})
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'companies' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'companies' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab('companies')}
            >
              <Building size={15} /> Companies / Accounts ({companies.length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.825rem' }}
            />
          </div>
        </div>

        <div>
          {activeTab === 'contacts' ? (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddContactModal(true)}>
              <Plus size={16} /> New Contact
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddCompanyModal(true)}>
              <Plus size={16} /> New Company
            </button>
          )}
        </div>
      </div>

      {/* Contacts View */}
      {activeTab === 'contacts' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {filteredContacts.map(contact => {
            const linkedCompany = companies.find(c => c.id === contact.companyId);

            return (
              <div key={contact.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}>
                      {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                        {contact.firstName} {contact.lastName}
                      </h4>
                      {linkedCompany && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>
                          {linkedCompany.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {contact.tags.map((t, idx) => (
                      <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--primary)" /> {contact.mobile}
                  </span>
                  {contact.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} color="var(--secondary)" /> {contact.email}
                    </span>
                  )}
                  {contact.city && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} color="var(--rose)" /> {contact.city}
                    </span>
                  )}
                </div>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.6rem',
                  borderTop: '1px solid var(--border-glass-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ fontSize: '0.725rem', padding: '3px 8px' }}
                    onClick={() => {
                      addToast('success', 'WhatsApp Triggered', `Opened conversation with ${contact.firstName}`);
                      setCurrentRoute('communications');
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </button>

                  <button
                    className="btn btn-glass btn-sm"
                    style={{ fontSize: '0.725rem', padding: '3px 8px' }}
                    onClick={() => {
                      const matchedCust = customers.find(c => c.mobile === contact.mobile);
                      if (matchedCust) {
                        setSelectedCustomerId(matchedCust.id);
                        setCurrentRoute('customers');
                      } else {
                        addToast('info', 'Customer Link', `${contact.firstName} is currently a contact record.`);
                      }
                    }}
                  >
                    View 360° Profile →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Companies View */}
      {activeTab === 'companies' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {filteredCompanies.map(comp => {
            const linkedContacts = contacts.filter(c => c.companyId === comp.id);

            return (
              <div key={comp.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                        {comp.name}
                      </h4>
                      <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{comp.industry}</p>
                    </div>
                  </div>

                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Active Account</span>
                </div>

                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--primary)" /> {comp.phone}
                  </span>
                  {comp.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} color="var(--secondary)" /> {comp.email}
                    </span>
                  )}
                  {comp.website && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={13} color="var(--emerald)" /> {comp.website}
                    </span>
                  )}
                </div>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.6rem',
                  borderTop: '1px solid var(--border-glass-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.725rem'
                }}>
                  <span>Linked Contacts: <strong style={{ color: 'var(--text-highlight)' }}>{linkedContacts.length}</strong></span>
                  <span style={{ color: 'var(--text-dim)' }}>City: {comp.city || 'Mumbai'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="modal-backdrop" onClick={() => setShowAddContactModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add New Contact</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddContactModal(false)}><X size={16} /></button>
            </div>

            {duplicateWarning && (
              <div className="glass-card" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', padding: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={18} color="var(--amber)" />
                <span style={{ fontSize: '0.775rem', color: '#fcd34d' }}>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleCreateContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salim"
                    value={cFirstName}
                    onChange={e => setCFirstName(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Khan"
                    value={cLastName}
                    onChange={e => setCLastName(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={cMobile}
                    onChange={e => handleMobileChange(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="salim@gmail.com"
                    value={cEmail}
                    onChange={e => setCEmail(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Associated Company</label>
                  <select
                    value={cCompanyId}
                    onChange={e => setCCompanyId(e.target.value)}
                    className="input-glass"
                  >
                    <option value="" style={{ background: '#0f172a' }}>-- None (Individual) --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Director, VIP, Signatory"
                    value={cTags}
                    onChange={e => setCTags(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddContactModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Contact Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="modal-backdrop" onClick={() => setShowAddCompanyModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Register Company / Account</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddCompanyModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Global Trading LLC"
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Industry Category</label>
                  <select
                    value={compIndustry}
                    onChange={e => setCompIndustry(e.target.value)}
                    className="input-glass"
                  >
                    <option value="International Trade & Logistics" style={{ background: '#0f172a' }}>International Trade & Logistics</option>
                    <option value="Healthcare & Clinics" style={{ background: '#0f172a' }}>Healthcare & Clinics</option>
                    <option value="Textiles & Garments" style={{ background: '#0f172a' }}>Textiles & Garments</option>
                    <option value="Financial & Legal Services" style={{ background: '#0f172a' }}>Financial & Legal Services</option>
                    <option value="Technology & Media" style={{ background: '#0f172a' }}>Technology & Media</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Primary Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={compPhone}
                    onChange={e => setCompPhone(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={compEmail}
                    onChange={e => setCompEmail(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Website URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={compWebsite}
                    onChange={e => setCompWebsite(e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddCompanyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Company Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
