import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, Clock, Calendar, CreditCard, Bell, Settings, LogOut, 
  Search, Menu, X, ChevronRight, AlertCircle, TrendingUp, UserCheck, Check, 
  MoreVertical, Download, Briefcase, Award 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Navigation & Toggle States
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Time & Attendance States
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [clockLogs, setClockLogs] = useState([
    { type: 'Check-In', time: '08:54 AM', date: 'Today' }
  ]);

  // Tick clock once loaded
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setDate(now.toLocaleDateString('en-US', options));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    if (!isCheckedIn) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockLogs(prev => [{ type: 'Check-In', time: timeStr, date: 'Today' }, ...prev]);
      setIsCheckedIn(true);
    }
  };

  const handleCheckOut = () => {
    if (isCheckedIn) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockLogs(prev => [{ type: 'Check-Out', time: timeStr, date: 'Today' }, ...prev]);
      setIsCheckedIn(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'My Profile', icon: <User size={18} /> },
    { name: 'Attendance', icon: <Clock size={18} /> },
    { name: 'Leave Requests', icon: <Calendar size={18} /> },
    { name: 'Payroll', icon: <CreditCard size={18} /> },
    { name: 'Notifications', icon: <Bell size={18} /> },
    { name: 'Settings', icon: <Settings size={18} /> }
  ];

  // Dummy notifications list
  const notificationsList = [
    { title: "First Payroll processed", desc: "Your salary for June 2026 has been processed and sent.", time: "1 day ago" },
    { title: "Leave approved", desc: "Annual Vacation request approved by HR Manager Melissa Thorne.", time: "2 days ago" },
    { title: "Policy update", desc: "Acme Corp released updated hybrid work standards.", time: "3 days ago" }
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="logo sidebar-logo">
            <div className="logo-dot"></div>
            <span>Dayflow</span>
          </div>

          <ul className="sidebar-menu">
            {menuItems.map((item, idx) => (
              <li 
                key={idx} 
                className={`sidebar-item ${activeTab === item.name ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsSidebarOpen(false);
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <button onClick={handleLogout} className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444', textAlign: 'left' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="dashboard-main">
        {/* Top Navbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button 
              className="dashboard-sidebar-mobile-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="topbar-search">
              <Search size={18} color="var(--text-dim)" />
              <input type="text" placeholder="Search logs, policies, payroll..." className="topbar-search-input" />
            </div>
          </div>

          <div className="topbar-actions">
            {/* Notification Bell Dropdown toggle */}
            <div className="bell-icon-wrap" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
              <Bell size={18} />
              <span className="bell-badge"></span>
            </div>

            <div className="user-profile-widget">
              <div className="dashboard-avatar">DC</div>
              <div style={{ textAlign: 'left' }}>
                <div className="dashboard-username">David Cole</div>
                <div className="dashboard-role">Software Engineer</div>
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Popover Dropdown */}
        {isNotificationsOpen && (
          <div className="glass-card animate-fade-in-up" style={{ position: 'absolute', top: '75px', right: '150px', width: '320px', zIndex: 100, padding: '20px', background: 'rgba(10, 11, 28, 0.95)', border: '1px solid var(--border-color-hover)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ color: 'white', margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
              <button 
                onClick={() => setIsNotificationsOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="notification-panel-list">
              {notificationsList.map((notif, i) => (
                <div key={i} className="notification-panel-item">
                  <div className="notification-dot"></div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: 'white', fontWeight: 600 }}>{notif.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{notif.desc}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginTop: '4px' }}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Contents based on Active Tab */}
        <div className="dashboard-content">
          {activeTab === 'Dashboard' ? (
            <>
              {/* Dashboard Headline */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', color: 'white', fontFamily: 'var(--font-display)' }}>David's Workspace</h2>
                  <p style={{ margin: 0 }}>Review check-in history, leave summaries, and upcoming rosters.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }} onClick={() => alert('Feature placeholder')}>
                    Export Report
                  </button>
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div className="stats-grid animate-fade-in-up">
                {/* Stat 1 */}
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Present Days</span>
                    <span className="stat-value">18/22</span>
                    <span className="stat-growth">
                      <TrendingUp size={12} /> 94% Rate
                    </span>
                  </div>
                  <div className="stat-icon-wrap">
                    <UserCheck size={20} />
                  </div>
                </div>
                {/* Stat 2 */}
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Leave Balance</span>
                    <span className="stat-value">8 Days</span>
                    <span className="stat-growth" style={{ color: 'var(--text-dim)' }}>
                      3 Approved • 0 Pending
                    </span>
                  </div>
                  <div className="stat-icon-wrap">
                    <Calendar size={20} style={{ color: 'var(--primary-purple)' }} />
                  </div>
                </div>
                {/* Stat 3 */}
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Working Hours</span>
                    <span className="stat-value">144.5 hrs</span>
                    <span className="stat-growth">
                      <TrendingUp size={12} /> +12h Overtime
                    </span>
                  </div>
                  <div className="stat-icon-wrap">
                    <Clock size={20} style={{ color: '#06b6d4' }} />
                  </div>
                </div>
                {/* Stat 4 */}
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Monthly Salary</span>
                    <span className="stat-value">$8,500.00</span>
                    <span className="stat-growth" style={{ color: '#10b981' }}>
                      ✓ Paid (June 1)
                    </span>
                  </div>
                  <div className="stat-icon-wrap">
                    <CreditCard size={20} style={{ color: '#10b981' }} />
                  </div>
                </div>
              </div>

              {/* Sections Split Grid */}
              <div className="dashboard-sections-grid">
                {/* Left Section - Attendance Logging & Calendar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Today's Attendance Check-in Card */}
                  <div className="glass-card attendance-action-card">
                    <div>
                      <span className="badge-title" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Today's Activity
                      </span>
                      <div className="time-display" style={{ marginTop: '12px' }}>{time}</div>
                      <div className="date-display">{date}</div>
                    </div>

                    <div className="attendance-buttons-wrap">
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1 }} 
                        onClick={handleCheckIn}
                        disabled={isCheckedIn}
                      >
                        Check In
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1 }} 
                        onClick={handleCheckOut}
                        disabled={!isCheckedIn}
                      >
                        Check Out
                      </button>
                    </div>

                    {/* Clock Logs */}
                    <div style={{ width: '100%' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'white', marginBottom: '8px', textAlign: 'left', fontWeight: 600 }}>Log History</h4>
                      <div className="attendance-log-list">
                        {clockLogs.map((log, i) => (
                          <div key={i} className="attendance-log-item">
                            <span>{log.type}</span>
                            <span>{log.date} at <strong className="attendance-log-time">{log.time}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Calendar Grid */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Attendance Calendar (June 2026)</h3>
                    
                    <div className="calendar-grid">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
                        <div key={h} className="calendar-day-header">{h}</div>
                      ))}
                      
                      {/* Placeholder dates (Days 1 to 21, June started on a Monday) */}
                      {[...Array(21)].map((_, i) => {
                        const day = i + 1;
                        let statusClass = 'present';
                        if (day === 7 || day === 14) statusClass = 'leave'; // weekend or leave
                        if (day === 18) statusClass = 'today';
                        
                        return (
                          <div 
                            key={i} 
                            className={`calendar-day-cell ${statusClass}`}
                          >
                            <span>{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Section - Leaves, Payroll, & Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Custom CSS Chart: Weekly Hours */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Weekly Working hours</h3>
                    <div className="chart-wrapper">
                      <div className="chart-bar-container">
                        <div className="chart-bar-col">
                          <div className="chart-bar-fill" style={{ height: '70%' }} data-value="8.2 hrs"></div>
                          <span className="chart-bar-label">Mon</span>
                        </div>
                        <div className="chart-bar-col">
                          <div className="chart-bar-fill" style={{ height: '85%' }} data-value="9.0 hrs"></div>
                          <span className="chart-bar-label">Tue</span>
                        </div>
                        <div className="chart-bar-col">
                          <div className="chart-bar-fill" style={{ height: '75%' }} data-value="8.0 hrs"></div>
                          <span className="chart-bar-label">Wed</span>
                        </div>
                        <div className="chart-bar-col">
                          <div className="chart-bar-fill" style={{ height: '80%' }} data-value="8.5 hrs"></div>
                          <span className="chart-bar-label">Thu</span>
                        </div>
                        <div className="chart-bar-col">
                          <div className="chart-bar-fill" style={{ height: '55%' }} data-value="6.0 hrs"></div>
                          <span className="chart-bar-label">Fri</span>
                        </div>
                      </div>
                      <div className="chart-legend">
                        <span><span className="legend-dot" style={{ backgroundColor: 'var(--primary-blue)' }}></span>Regular Time</span>
                        <span><span className="legend-dot" style={{ backgroundColor: 'var(--primary-purple)' }}></span>Overtime</span>
                      </div>
                    </div>
                  </div>

                  {/* Leave Statistics Breakdown */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '4px' }}>Leave Distribution</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Used 12 / 20 annual allocation</p>
                    
                    {/* Stacked leaves representation */}
                    <div className="leave-stat-bar">
                      <div className="leave-stat-segment" style={{ width: '50%', backgroundColor: 'var(--primary-blue)' }}></div>
                      <div className="leave-stat-segment" style={{ width: '25%', backgroundColor: 'var(--primary-purple)' }}></div>
                      <div className="leave-stat-segment" style={{ width: '10%', backgroundColor: '#ec4899' }}></div>
                    </div>

                    <div className="leave-stat-details">
                      <div className="leave-stat-item">
                        <span className="legend-dot" style={{ backgroundColor: 'var(--primary-blue)' }}></span>
                        <span>Annual Leave (6)</span>
                      </div>
                      <div className="leave-stat-item">
                        <span className="legend-dot" style={{ backgroundColor: 'var(--primary-purple)' }}></span>
                        <span>Sick Leave (3)</span>
                      </div>
                      <div className="leave-stat-item">
                        <span className="legend-dot" style={{ backgroundColor: '#ec4899' }}></span>
                        <span>Casual Leave (3)</span>
                      </div>
                      <div className="leave-stat-item">
                        <span className="legend-dot" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></span>
                        <span>Remaining (8)</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Leave Requests list */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Leave History</h3>
                    <div className="recent-list">
                      <div className="recent-item">
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '2px' }}>Sick Leave</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>June 10 - June 12</span>
                        </div>
                        <span className="status-badge approved">Approved</span>
                      </div>
                      
                      <div className="recent-item">
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '2px' }}>Annual Vacation</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>July 04 - July 12</span>
                        </div>
                        <span className="status-badge pending">Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Payroll Summary Breakdown */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '16px' }}>Payroll Summary (June 2026)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="payslip-item">
                        <span>Base Earnings</span>
                        <span>$7,200.00</span>
                      </div>
                      <div className="payslip-item">
                        <span>Travel Allowances</span>
                        <span>$800.00</span>
                      </div>
                      <div className="payslip-item">
                        <span>Performance Allowances</span>
                        <span>$500.00</span>
                      </div>
                      <div className="payslip-item">
                        <span>Tax Deductions</span>
                        <span style={{ color: '#ef4444' }}>-$1,200.00</span>
                      </div>
                      <div className="payslip-item">
                        <span>Net Take-home Salary</span>
                        <span style={{ color: '#10b981' }}>$8,500.00</span>
                      </div>
                    </div>
                    
                    <button className="btn btn-secondary" style={{ width: '100%', padding: '12px', marginTop: '20px', fontSize: '0.85rem', display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={() => alert('PDF payslip download')}>
                      <Download size={14} /> Download Payslip
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : (
            /* Sub Tab Placeholder */
            <div className="glass-card animate-fade-in-up" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className="badge-icon-wrap" style={{ width: '56px', height: '56px', borderRadius: '14px' }}>
                  <Briefcase size={28} />
                </div>
              </div>
              
              <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '12px' }}>{activeTab} Portal</h2>
              <p style={{ maxWidth: '460px', margin: '0 auto 24px auto', fontSize: '1rem', color: 'var(--text-muted)' }}>
                This section details your employee configurations for {activeTab}. The live API database endpoints will hook directly to this portal view.
              </p>
              
              <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={() => setActiveTab('Dashboard')}>
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
