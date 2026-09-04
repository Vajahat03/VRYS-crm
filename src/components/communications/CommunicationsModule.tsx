import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import {
  MessageSquare,
  Send,
  Sparkles,
  Paperclip,
  CheckCheck,
  Search,
  Phone,
  Video,
  MoreVertical,
  Smile,
  FileText,
  CreditCard,
  Layers,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'customer';
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'invoice' | 'receipt' | 'doc';
    title: string;
    amount?: string;
  };
}

interface ChatContact {
  id: string;
  name: string;
  phone: string;
  company?: string;
  avatar: string;
  unread: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
}

export const CommunicationsModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('c1');
  const [inputText, setInputText] = useState('');

  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: 'c1',
      name: 'Tariq Qureshi',
      phone: '+91 98210 55443',
      company: 'Qureshi Import Export Pvt Ltd',
      avatar: 'TQ',
      unread: 0,
      lastMessage: 'Great, thanks for the Tatkaal appointment update!',
      lastTime: '15:10',
      messages: [
        { id: 'm1', sender: 'customer', text: 'Hi Ahmed, is my Tatkaal passport appointment confirmed?', time: '14:45', status: 'read' },
        { id: 'm2', sender: 'user', text: 'Yes Tariq bhai! We have scheduled your slot at PSK BKC for Sep 6, 10:30 AM.', time: '14:55', status: 'read' },
        { id: 'm3', sender: 'user', text: 'Here is your official booking confirmation and document checklist.', time: '14:56', status: 'read', attachment: { type: 'doc', title: 'PSK_BKC_Appointment_Pass.pdf' } },
        { id: 'm4', sender: 'customer', text: 'Great, thanks for the Tatkaal appointment update!', time: '15:10', status: 'read' }
      ]
    },
    {
      id: 'c2',
      name: 'Ananya Roy',
      phone: '+91 98300 22119',
      company: 'Roy Creative Studio',
      avatar: 'AR',
      unread: 1,
      lastMessage: 'We received the website credentials. Thank you!',
      lastTime: '13:30',
      messages: [
        { id: 'm21', sender: 'user', text: 'Hi Ananya! Your custom business website & CRM setup is fully deployed.', time: '12:00', status: 'read' },
        { id: 'm22', sender: 'user', text: 'Here is your Tax Invoice #INV-2026-0045 (Paid in Full: ₹25,000).', time: '12:05', status: 'read', attachment: { type: 'invoice', title: 'INV-2026-0045.pdf', amount: '₹25,000' } },
        { id: 'm23', sender: 'customer', text: 'We received the website credentials. Thank you!', time: '13:30', status: 'delivered' }
      ]
    },
    {
      id: 'c3',
      name: 'Kashif Memon',
      phone: '+91 98112 33441',
      company: 'Memon Logistics LLC',
      avatar: 'KM',
      unread: 2,
      lastMessage: 'Will send the August bank statements in 10 mins.',
      lastTime: '11:15',
      messages: [
        { id: 'm31', sender: 'user', text: 'As-salamu alaykum Kashif bhai, we need the August bank statement for vehicle GST clearance.', time: '10:30', status: 'read' },
        { id: 'm32', sender: 'customer', text: 'Will send the August bank statements in 10 mins.', time: '11:15', status: 'read' }
      ]
    },
    {
      id: 'c4',
      name: 'Dr. Priya Nambiar',
      phone: '+91 98765 44221',
      company: 'Aura Dental Clinic',
      avatar: 'PN',
      unread: 0,
      lastMessage: 'Can you quote for GST registration and clinic accounting?',
      lastTime: 'Yesterday',
      messages: [
        { id: 'm41', sender: 'customer', text: 'Hello! I saw your services at expo. Can you quote for GST registration and clinic accounting?', time: 'Yesterday 16:40', status: 'read' }
      ]
    }
  ]);

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  const aiSmartReplies: Record<string, string[]> = {
    c1: [
      'Your Tatkaal slot at PSK BKC is confirmed for Sep 6.',
      'Please remember to carry 2 original Aadhaar copies.',
      'Let me know if you need any assistance on the day!'
    ],
    c2: [
      'You are most welcome! Let us know if you want training for your team.',
      'Sending payment receipt #REC-2026-008 for your records.',
      'We would love a Google review if you enjoyed our service!'
    ],
    c3: [
      'Understood, we will process the GST return as soon as received.',
      'Sending payment reminder for Job #JOB-2026-091 balance.',
      'Vehicle RC book has been safely verified in our vault.'
    ],
    c4: [
      'Hi Dr. Priya! Our annual healthcare GST & compliance package is ₹18,000/yr.',
      'I am sharing our corporate service catalog PDF with you.',
      'Would you like a quick 10-minute demo call today?'
    ]
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: 'm_' + Date.now().toString(36),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    setContacts(prev => prev.map(c => {
      if (c.id === activeContact.id) {
        return {
          ...c,
          lastMessage: text,
          lastTime: newMessage.time,
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setInputText('');
    addToast('success', 'Message Sent', `Dispatched WhatsApp message to ${activeContact.name}`);
  };

  const handleInsertTemplate = (type: 'invoice' | 'receipt' | 'greeting') => {
    let msg = '';
    if (type === 'invoice') {
      msg = `Hi ${activeContact.name}, your invoice for ₹2,360 is ready. You can pay via UPI or Net Banking.`;
    } else if (type === 'receipt') {
      msg = `Received with thanks! Payment receipt is generated.`;
    } else {
      msg = `Hello ${activeContact.name}, thanks for reaching out to ${activeOrg.name}. How can we assist you today?`;
    }
    setInputText(msg);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '1.25rem',
      height: '82vh',
      alignItems: 'stretch'
    }}>
      {/* Contact List Sidebar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <MessageSquare size={18} color="var(--emerald)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>WhatsApp CRM Live</h3>
        </div>

        {/* Search Contact */}
        <div style={{ position: 'relative' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search chat or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-glass"
            style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
          />
        </div>

        {/* Chat Contacts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
          {filteredContacts.map(c => {
            const isSelected = activeContact.id === c.id;

            return (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
                  borderColor: isSelected ? 'var(--emerald)' : 'var(--border-glass)',
                  boxShadow: isSelected ? '0 0 15px -3px rgba(16, 185, 129, 0.3)' : 'none',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}
                onClick={() => setSelectedContactId(c.id)}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  {c.avatar}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-highlight)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </h4>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>{c.lastTime}</span>
                  </div>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                    {c.lastMessage}
                  </p>
                </div>

                {c.unread > 0 && (
                  <span className="badge badge-emerald" style={{ borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem' }}>
                    {c.unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Conversation Stream & Composer */}
      <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'var(--bg-surface-2)',
          borderBottom: '1px solid var(--border-glass-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff'
            }}>
              {activeContact.avatar}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{activeContact.name}</h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {activeContact.phone} • {activeContact.company || 'Direct Contact'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-glass btn-icon btn-sm" title="Voice Call"><Phone size={15} color="var(--primary)" /></button>
            <button className="btn btn-glass btn-icon btn-sm" title="Video Meeting"><Video size={15} color="var(--secondary)" /></button>
          </div>
        </div>

        {/* Messages Stream Area */}
        <div style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'rgba(15, 23, 42, 0.4)'
        }}>
          {activeContact.messages.map(msg => {
            const isMe = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '68%',
                  padding: '0.75rem 1rem',
                  borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isMe ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'var(--bg-surface-2)',
                  color: '#fff',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{msg.text}</p>

                  {/* Attachment Card */}
                  {msg.attachment && (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '4px'
                    }}>
                      <FileText size={16} color="#fff" />
                      <div style={{ fontSize: '0.75rem' }}>
                        <strong>{msg.attachment.title}</strong>
                        {msg.attachment.amount && <span style={{ marginLeft: '6px', color: '#a7f3d0' }}>{msg.attachment.amount}</span>}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.65rem',
                    color: isMe ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-dim)',
                    marginTop: '2px'
                  }}>
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck size={13} color="#67e8f9" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Smart Replies Suggestions Bar */}
        <div style={{
          padding: '0.5rem 1rem',
          background: 'var(--bg-surface-2)',
          borderTop: '1px solid var(--border-glass-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
            <Sparkles size={12} /> AI Quick Replies:
          </span>
          {(aiSmartReplies[activeContact.id] || []).map((reply, rIdx) => (
            <button
              key={rIdx}
              className="btn btn-glass btn-sm"
              style={{
                fontSize: '0.7rem',
                padding: '3px 8px',
                whiteSpace: 'nowrap',
                borderRadius: 'var(--radius-full)'
              }}
              onClick={() => handleSendMessage(reply)}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Message Input & Quick Action Bar */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface-1)',
          borderTop: '1px solid var(--border-glass-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {/* Quick Templates Bar */}
          <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Templates:</span>
            <button className="btn btn-glass btn-sm" style={{ padding: '1px 6px', fontSize: '0.675rem' }} onClick={() => handleInsertTemplate('invoice')}>
              + Send Invoice
            </button>
            <button className="btn btn-glass btn-sm" style={{ padding: '1px 6px', fontSize: '0.675rem' }} onClick={() => handleInsertTemplate('receipt')}>
              + Payment Receipt
            </button>
            <button className="btn btn-glass btn-sm" style={{ padding: '1px 6px', fontSize: '0.675rem' }} onClick={() => handleInsertTemplate('greeting')}>
              + Welcome Greeting
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-glass btn-icon btn-sm" title="Attach Document"><Paperclip size={16} /></button>
            <input
              type="text"
              placeholder={`Message ${activeContact.name} on WhatsApp...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="input-glass"
              style={{ flex: 1, height: '38px', fontSize: '0.85rem' }}
            />
            <button
              className="btn btn-primary"
              style={{ height: '38px', padding: '0 1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              onClick={() => handleSendMessage()}
            >
              <Send size={15} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
