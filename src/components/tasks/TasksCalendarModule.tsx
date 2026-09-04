import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataStore } from '../../services/dataStore';
import { Task, TaskStatus, SupportTicket } from '../../types';
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Kanban,
  Table as TableIcon,
  AlertTriangle,
  LifeBuoy
} from 'lucide-react';

export const TasksCalendarModule: React.FC = () => {
  const { activeOrg, addToast, triggerRefresh, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'tickets'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 8, 1)); // Sep 2026
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; tasks: Task[]; jobs: any[] } | null>(null);

  // Drag & drop state for tasks
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState(currentUser.id);
  const [taskRelatedType, setTaskRelatedType] = useState<'customer' | 'job' | 'lead' | 'general'>('general');
  const [taskRelatedId, setTaskRelatedId] = useState('');

  // New Support Ticket State
  const [tktCustId, setTktCustId] = useState('');
  const [tktSubject, setTktSubject] = useState('');
  const [tktDesc, setTktDesc] = useState('');
  const [tktCategory, setTktCategory] = useState('Urgent Reschedule');
  const [tktPriority, setTktPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  const tasks = dataStore.getTasks(activeOrg.id);
  const jobs = dataStore.getJobs(activeOrg.id);
  const customers = dataStore.getCustomers(activeOrg.id);
  const users = dataStore.getUsers(activeOrg.id);
  const tickets = dataStore.getTickets(activeOrg.id);

  const taskStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = users.find(u => u.id === taskAssignedTo) || currentUser;

    const created = dataStore.createTask({
      organizationId: activeOrg.id,
      title: taskTitle,
      description: taskDesc,
      assignedTo: assigned.id,
      assignedToName: assigned.name,
      createdBy: currentUser.name,
      priority: taskPriority,
      status: 'To Do',
      dueDate: taskDueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      relatedType: taskRelatedType,
      relatedId: taskRelatedId || undefined
    });

    addToast('success', 'Task Scheduled', `Created task for ${assigned.name}`);
    setShowAddTaskModal(false);
    setTaskTitle('');
    setTaskDesc('');
    triggerRefresh();
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    dataStore.updateTask(taskId, { status: newStatus });
    if (newStatus === 'Completed') {
      addToast('success', 'Task Completed! 🎉', 'Marked task as completed.');
    } else {
      addToast('info', 'Task Moved', `Task marked as ${newStatus}`);
    }
    triggerRefresh();
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === tktCustId);
    if (!cust) {
      addToast('error', 'Validation Error', 'Please select a customer.');
      return;
    }

    const created = dataStore.createTicket({
      organizationId: activeOrg.id,
      customerId: cust.id,
      customerName: cust.name,
      subject: tktSubject,
      description: tktDesc,
      category: tktCategory,
      priority: tktPriority,
      status: 'Open',
      assignedTo: currentUser.id,
      assignedToName: currentUser.name,
      slaDueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 Hour SLA
    });

    addToast('success', 'Support Ticket Logged', `Ticket #${created.ticketNumber} created with 4h SLA.`);
    setShowAddTicketModal(false);
    setTktSubject('');
    setTktDesc('');
    triggerRefresh();
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      handleUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  // Calendar Helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentMonthDate(new Date(2026, 8, 3));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & View Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Module Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-surface-2)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'tasks' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'tasks' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab('tasks')}
            >
              <CheckSquare size={15} /> Tasks Board ({tasks.filter(t => t.status !== 'Completed').length})
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'calendar' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'calendar' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab('calendar')}
            >
              <CalendarIcon size={15} /> Calendar Schedule
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'tickets' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'tickets' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab('tickets')}
            >
              <LifeBuoy size={15} /> SLA Support Tickets ({tickets.filter(t => t.status !== 'Resolved').length})
            </button>
          </div>

          {/* Search Box */}
          {activeTab === 'tasks' && (
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-glass"
                style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.8rem' }}
              />
            </div>
          )}
        </div>

        <div>
          {activeTab === 'tickets' ? (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTicketModal(true)}>
              <Plus size={16} /> New Support Ticket
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTaskModal(true)}>
              <Plus size={16} /> New Task / Follow-up
            </button>
          )}
        </div>
      </div>

      {/* Task Kanban View */}
      {activeTab === 'tasks' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          alignItems: 'start'
        }}>
          {taskStatuses.map(status => {
            const statusTasks = filteredTasks.filter(t => t.status === status);
            const isOver = dragOverColumn === status;

            return (
              <div
                key={status}
                onDragOver={e => handleDragOver(e, status)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={e => handleDrop(e, status)}
                className="glass-panel"
                style={{
                  background: isOver ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-1)',
                  borderColor: isOver ? 'var(--primary)' : 'var(--border-glass)',
                  boxShadow: isOver ? '0 0 25px var(--primary-glow)' : 'var(--shadow-md)',
                  padding: '1rem',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{status}</span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{statusTasks.length}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {statusTasks.map(task => {
                    const isUrgent = task.priority === 'urgent';
                    const isCompleted = task.status === 'Completed';

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        className="glass-card"
                        style={{
                          padding: '0.9rem',
                          cursor: 'grab',
                          borderLeft: isUrgent ? '3px solid var(--rose)' : undefined,
                          opacity: isCompleted ? 0.75 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-highlight)',
                            textDecoration: isCompleted ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </h4>

                          <span className={`badge ${isUrgent ? 'badge-rose' : task.priority === 'high' ? 'badge-amber' : 'badge-indigo'}`} style={{ fontSize: '0.6rem' }}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>

                        {task.description && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.4rem',
                          borderTop: '1px solid var(--border-glass-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.7rem',
                          color: 'var(--text-dim)'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} color="var(--primary)" /> {task.assignedToName}
                          </span>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {task.dueDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--secondary)' }}>
                                <Clock size={11} /> {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}

                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={e => handleUpdateTaskStatus(task.id, e.target.checked ? 'Completed' : 'In Progress')}
                              style={{ cursor: 'pointer' }}
                              title="Mark Task Complete"
                            />
                          </div>
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

      {/* Interactive Monthly Calendar View */}
      {activeTab === 'calendar' && (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Calendar Header Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{monthName} {year}</h2>
              <button className="btn btn-glass btn-sm" onClick={goToday}>Today (Sep 3)</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-glass btn-icon btn-sm" onClick={prevMonth}><ChevronLeft size={16} /></button>
              <button className="btn btn-glass btn-icon btn-sm" onClick={nextMonth}><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Day Names Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass-subtle)' }}>
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>

          {/* Calendar 35-Day Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '90px', opacity: 0.2, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.dueDate?.startsWith(dateStr));
              const dayJobs = jobs.filter(j => j.deliveryDate?.startsWith(dateStr));
              const isToday = dayNum === 3;

              return (
                <div
                  key={dayNum}
                  className="glass-card"
                  style={{
                    minHeight: '90px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    background: isToday ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-1)',
                    borderColor: isToday ? 'var(--primary)' : 'var(--border-glass-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  onClick={() => setSelectedDayEvents({ day: dayNum, tasks: dayTasks, jobs: dayJobs })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: isToday ? 'var(--primary)' : 'var(--text-main)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isToday ? 'var(--primary-glow)' : 'transparent',
                      textAlign: 'center',
                      lineHeight: '20px'
                    }}>
                      {dayNum}
                    </span>
                    {(dayTasks.length > 0 || dayJobs.length > 0) && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                        {dayTasks.length + dayJobs.length} Events
                      </span>
                    )}
                  </div>

                  {/* Tiny Event Pills */}
                  {dayJobs.slice(0, 2).map((j, jIdx) => (
                    <div key={jIdx} style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '1px 4px', borderRadius: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Job: {j.title}
                    </div>
                  ))}
                  {dayTasks.slice(0, 1).map((t, tIdx) => (
                    <div key={tIdx} style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', padding: '1px 4px', borderRadius: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Task: {t.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Selected Day Inspect Modal / Drawer */}
          {selectedDayEvents && (
            <div className="modal-backdrop" onClick={() => setSelectedDayEvents(null)}>
              <div className="modal-content" style={{ padding: '1.5rem', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Events for September {selectedDayEvents.day}, 2026</h3>
                  <button className="btn btn-glass btn-icon btn-sm" onClick={() => setSelectedDayEvents(null)}><X size={16} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {selectedDayEvents.jobs.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Operational Deliveries ({selectedDayEvents.jobs.length})
                      </h4>
                      {selectedDayEvents.jobs.map(j => (
                        <div key={j.id} className="glass-card" style={{ padding: '0.6rem', marginBottom: '4px' }}>
                          <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{j.title} ({j.jobNumber})</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer: {j.customerName} • Assigned: {j.assignedToName}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDayEvents.tasks.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Tasks & Follow-ups ({selectedDayEvents.tasks.length})
                      </h4>
                      {selectedDayEvents.tasks.map(t => (
                        <div key={t.id} className="glass-card" style={{ padding: '0.6rem', marginBottom: '4px' }}>
                          <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assignee: {t.assignedToName} • Priority: {t.priority}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDayEvents.jobs.length === 0 && selectedDayEvents.tasks.length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No scheduled deliveries or tasks on this day.</p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => setSelectedDayEvents(null)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Support Tickets SLA Hub */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="table-container">
            <table className="vrys-table">
              <thead>
                <tr>
                  <th>Ticket # & Subject</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Assigned Agent</th>
                  <th>SLA Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(tkt => (
                  <tr key={tkt.id}>
                    <td>
                      <p style={{ fontWeight: 700 }}>{tkt.subject}</p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--primary)' }}>{tkt.ticketNumber}</span>
                    </td>
                    <td>
                      <p>{tkt.customerName}</p>
                    </td>
                    <td><span className="badge badge-indigo">{tkt.category}</span></td>
                    <td>
                      <span className={`badge ${tkt.priority === 'urgent' ? 'badge-rose' : tkt.priority === 'high' ? 'badge-amber' : 'badge-indigo'}`}>
                        {tkt.priority.toUpperCase()}
                      </span>
                    </td>
                    <td>{tkt.assignedToName}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {tkt.slaDueAt ? new Date(tkt.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Standard'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-amber">{tkt.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showAddTaskModal && (
        <div className="modal-backdrop" onClick={() => setShowAddTaskModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Schedule Task / Follow-up</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddTaskModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call Tariq for Tatkaal appointment slot"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Description / Context</label>
                <textarea
                  rows={2}
                  placeholder="Details, steps, or notes..."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Operator</label>
                  <select
                    value={taskAssignedTo}
                    onChange={e => setTaskAssignedTo(e.target.value)}
                    className="input-glass"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id} style={{ background: '#0f172a' }}>{u.name} ({u.roleName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="input-glass"
                  >
                    <option value="low" style={{ background: '#0f172a' }}>Low</option>
                    <option value="medium" style={{ background: '#0f172a' }}>Medium</option>
                    <option value="high" style={{ background: '#0f172a' }}>High</option>
                    <option value="urgent" style={{ background: '#0f172a' }}>Urgent 🔥</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Support Ticket Modal */}
      {showAddTicketModal && (
        <div className="modal-backdrop" onClick={() => setShowAddTicketModal(false)}>
          <div className="modal-content" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Log Customer Support Ticket</h3>
              <button className="btn btn-glass btn-icon btn-sm" onClick={() => setShowAddTicketModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Customer *</label>
                <select
                  required
                  value={tktCustId}
                  onChange={e => setTktCustId(e.target.value)}
                  className="input-glass"
                >
                  <option value="" style={{ background: '#0f172a' }}>-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name} ({c.customerCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent appointment reschedule request"
                  value={tktSubject}
                  onChange={e => setTktSubject(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={tktCategory}
                    onChange={e => setTktCategory(e.target.value)}
                    className="input-glass"
                  >
                    <option value="Urgent Reschedule" style={{ background: '#0f172a' }}>Urgent Reschedule</option>
                    <option value="Document Query" style={{ background: '#0f172a' }}>Document Query</option>
                    <option value="Billing & Invoice" style={{ background: '#0f172a' }}>Billing & Invoice</option>
                    <option value="Technical Setup" style={{ background: '#0f172a' }}>Technical Setup</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority & SLA</label>
                  <select
                    value={tktPriority}
                    onChange={e => setTktPriority(e.target.value as any)}
                    className="input-glass"
                  >
                    <option value="urgent" style={{ background: '#0f172a' }}>Urgent (2 Hour SLA)</option>
                    <option value="high" style={{ background: '#0f172a' }}>High (4 Hour SLA)</option>
                    <option value="medium" style={{ background: '#0f172a' }}>Medium (24 Hour SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Details</label>
                <textarea
                  rows={3}
                  value={tktDesc}
                  onChange={e => setTktDesc(e.target.value)}
                  className="input-glass"
                  placeholder="Customer issue explanation..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowAddTicketModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Ticket with SLA</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
