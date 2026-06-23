import { useState } from 'react';
import { Calendar, ArrowRight, CheckCircle, Play, Users } from 'lucide-react';
import { useDemoRequests } from '../contexts/DemoRequestContext';
import { useNotifications } from '../contexts/NotificationsContext';

export default function DemoCTA() {
  const [submitted, setSubmitted] = useState(false);
  const { addRequest } = useDemoRequests();
  const { addNotification } = useNotifications();
  const [form, setForm] = useState({
    fullName: '', companyName: '', email: '', phone: '',
    teamSize: '', preferredDate: '', preferredTime: '', message: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRequest = addRequest({
      fullName: form.fullName,
      companyName: form.companyName,
      email: form.email,
      phone: form.phone,
      teamSize: form.teamSize,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      message: form.message,
    });

    addNotification({
      title: 'New Demo Request',
      description: `New demo request from ${form.fullName} at ${form.companyName}. Email: ${form.email}. Team size: ${form.teamSize || 'Not specified'}.`,
      timestamp: new Date().toISOString(),
      category: 'System',
      priority: 'Medium',
      read: false,
      targetEmployeeId: null,
    });

    setForm({ fullName: '', companyName: '', email: '', phone: '', teamSize: '', preferredDate: '', preferredTime: '', message: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="demo" className="section" style={{ position: 'relative' }}>
      <div className="glowing-bg glowing-bg-1"></div>
      <div className="glowing-bg glowing-bg-2"></div>

      {/* Section 1: Request Demo */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', marginBottom: 80 }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '60px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: -30,
            width: 120, height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: 20 }}>
            <Play size={14} fill="currentColor" /> Live Demo
          </div>

          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'white', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            See Dayflow <span style={{ color: '#818cf8' }}>in Action</span>
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Book a personalized product demonstration with our HR experts. See how Dayflow can transform your workforce management.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {[
              { icon: Users, text: 'Live Walkthrough' },
              { icon: Calendar, text: 'Flexible Scheduling' },
              { icon: CheckCircle, text: 'No Commitment' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <item.icon size={16} style={{ color: '#10b981' }} /> {item.text}
              </div>
            ))}
          </div>

          <a href="#schedule-demo" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Request Demo <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {/* Section 2: Schedule Demo Form */}
      <div id="schedule-demo" style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: 16 }}>
            <Calendar size={14} /> Schedule Now
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: 'white', fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            Schedule Your <span style={{ color: '#34d399' }}>Free Demo</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Fill in the details below and our team will get back to you within 24 hours.
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '36px 32px',
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <CheckCircle size={32} style={{ color: '#10b981' }} />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Demo request submitted successfully.</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our team will contact you shortly to confirm your demo session.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Full Name *</label>
                  <input
                    type="text" required
                    value={form.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    placeholder="John Smith"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Company Name *</label>
                  <input
                    type="text" required
                    value={form.companyName}
                    onChange={e => handleChange('companyName', e.target.value)}
                    placeholder="Acme Inc."
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Work Email *</label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="john@company.com"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Team Size</label>
                  <select
                    value={form.teamSize}
                    onChange={e => handleChange('teamSize', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Preferred Date</label>
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={e => handleChange('preferredDate', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Preferred Time</label>
                  <select
                    value={form.preferredTime}
                    onChange={e => handleChange('preferredTime', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Message</label>
                <textarea
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder="Tell us about your HR needs..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <Calendar size={18} /> Schedule Demo
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'white',
  borderRadius: 10,
  padding: '10px 14px',
  width: '100%',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-main)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};
