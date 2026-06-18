import React from 'react';
import { UserPlus, UserCheck, UserPen, Landmark } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Register',
      desc: 'Create your company workspace, define departments, and customize company policies in minutes.',
      icon: <UserPlus size={20} />
    },
    {
      num: '02',
      title: 'Manage Employees',
      desc: 'Bulk import your staff list or send email invitations so employees can complete self-onboarding.',
      icon: <UserPen size={20} />
    },
    {
      num: '03',
      title: 'Track Attendance',
      desc: 'Employees clock in via web or mobile apps. Timesheets are compiled automatically in real time.',
      icon: <UserCheck size={20} />
    },
    {
      num: '04',
      title: 'Process Payroll',
      desc: 'Verify calculated work hours, approve leave balances, and run automated payroll with one click.',
      icon: <Landmark size={20} />
    }
  ];

  return (
    <section id="how-it-works" className="section">
      <div className="section-header">
        <div className="hero-badge" style={{ marginBottom: '16px' }}>
          <span>Onboarding</span>
        </div>
        <h2>How Dayflow <span className="gradient-text">Works</span></h2>
        <p>
          Get up and running with a frictionless onboarding process designed to transition your company smoothly.
        </p>
      </div>

      <div className="timeline">
        {steps.map((step, index) => (
          <div className="timeline-step" key={index}>
            <div className="step-number-wrap">
              {step.num}
            </div>
            <div className="glass-card timeline-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--primary-purple)' }}>{step.icon}</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{step.title}</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
