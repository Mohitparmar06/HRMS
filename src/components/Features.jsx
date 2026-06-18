import React from 'react';
import { Users, Clock, Calendar, CreditCard, BarChart2, ShieldCheck } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      icon: <Users size={24} />,
      title: 'Employee Management',
      description: 'Maintain a single source of truth for employee records, digital profiles, documents, and corporate org charts.',
    },
    {
      icon: <Clock size={24} />,
      title: 'Attendance Tracking',
      description: 'Track time and attendance with geofenced clock-ins, biometric integrations, and automated timesheet updates.',
    },
    {
      icon: <Calendar size={24} />,
      title: 'Leave Management',
      description: 'Simplify leave requests with custom approval flows, automated accrual balances, and shared holiday calendars.',
    },
    {
      icon: <CreditCard size={24} />,
      title: 'Payroll Management',
      description: 'Automate salary payouts, tax calculations, bonuses, deductions, and direct deposits directly to employee banks.',
    },
    {
      icon: <BarChart2 size={24} />,
      title: 'Analytics Dashboard',
      description: 'Gain real-time insights into employee turnover, attendance rates, department costs, and resource utilization.',
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Role-Based Access',
      description: 'Set granular security scopes for admins, department leads, and employees, keeping sensitive company data secure.',
    },
  ];

  return (
    <section id="features" style={{ position: 'relative' }}>
      <div className="glowing-bg glowing-bg-3" style={{ bottom: '10%', right: '5%' }}></div>
      <div className="section">
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <span>Capabilities</span>
          </div>
          <h2>Fully Loaded <span className="gradient-text">Feature Suite</span></h2>
          <p>
            Dayflow combines essential HR utilities into a unified, secure, and beautiful interface to power your entire workplace operations.
          </p>
        </div>

        <div className="features-grid">
          {featuresList.map((feature, index) => (
            <div key={index} className="glass-card">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
