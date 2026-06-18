import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function Hero() {
  const [activeTab, setActiveTab] = useState(1);
  const [attendanceCount, setAttendanceCount] = useState(98.4);
  const [clockInTime, setClockInTime] = useState('08:54 AM');

  // Add subtle interactive tick for demo realism
  useEffect(() => {
    const interval = setInterval(() => {
      setAttendanceCount(prev => {
        const change = (Math.random() - 0.5) * 0.2;
        return parseFloat(Math.min(100, Math.max(90, prev + change)).toFixed(1));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="glowing-bg glowing-bg-1"></div>
      <div className="glowing-bg glowing-bg-2"></div>
      
      <div className="hero-wrapper animate-fade-in-up">
        {/* Left Side: Hero Text */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-pill">New</span>
            <span>Dayflow 2.0 is now live</span>
          </div>
          <h1>Every Workday, <br /><span className="gradient-text">Perfectly Aligned.</span></h1>
          <p>
            Manage employees, attendance, payroll, and leave in one intelligent, glassmorphic platform designed for the modern remote and hybrid workforce.
          </p>
          <div className="hero-buttons">
            <a href="#signup" className="btn btn-primary">
              Get Started <ArrowRight size={18} />
            </a>
            <a href="#how-it-works" className="btn btn-secondary">
              <Play size={16} fill="white" /> Learn More
            </a>
          </div>
        </div>

        {/* Right Side: Glassmorphic HRMS Mockup */}
        <div className="hero-visual">
          <div className="dashboard-mockup animate-float">
            {/* Window Header */}
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="mockup-dot"></span>
                <span className="mockup-dot"></span>
                <span className="mockup-dot"></span>
              </div>
              <div className="mockup-title">Dayflow HR Dashboard</div>
              <div style={{ width: '30px' }}></div>
            </div>

            {/* Window Body */}
            <div className="mockup-body">
              {/* Mini Sidebar */}
              <div className="mockup-sidebar">
                <div className={`mockup-nav-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)} style={{ cursor: 'pointer' }}>
                  <div className="mockup-nav-icon"></div>
                  <div className="mockup-nav-text"></div>
                </div>
                <div className={`mockup-nav-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)} style={{ cursor: 'pointer' }}>
                  <div className="mockup-nav-icon"></div>
                  <div className="mockup-nav-text"></div>
                </div>
                <div className={`mockup-nav-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)} style={{ cursor: 'pointer' }}>
                  <div className="mockup-nav-icon"></div>
                  <div className="mockup-nav-text"></div>
                </div>
              </div>

              {/* Mockup main panel */}
              <div className="mockup-main">
                {/* Micro Widgets */}
                <div className="mockup-widgets">
                  <div className="mockup-widget">
                    <span className="mockup-widget-label">Active Staff</span>
                    <span className="mockup-widget-val">1,248</span>
                  </div>
                  <div className="mockup-widget">
                    <span className="mockup-widget-label">Attendance</span>
                    <span className="mockup-widget-val">{attendanceCount}%</span>
                  </div>
                </div>

                {/* Micro Chart */}
                <div className="mockup-chart-container">
                  <span className="mockup-widget-label">Weekly Attendance Trend</span>
                  <div className="mockup-chart-bars">
                    <div className="mockup-chart-bar" style={{ height: '40%' }}></div>
                    <div className="mockup-chart-bar" style={{ height: '65%' }}></div>
                    <div className="mockup-chart-bar" style={{ height: '55%' }}></div>
                    <div className="mockup-chart-bar" style={{ height: '85%' }}></div>
                    <div className="mockup-chart-bar" style={{ height: '95%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge 1 - Attendance Clock-in */}
            <div className="floating-badge floating-badge-1">
              <div className="badge-icon-wrap">
                <Clock size={16} />
              </div>
              <div className="badge-info">
                <span className="badge-title">Sarah J. Clocked In</span>
                <span className="badge-num">{clockInTime}</span>
              </div>
            </div>

            {/* Floating Badge 2 - Leave Approval */}
            <div className="floating-badge floating-badge-2">
              <div className="badge-icon-wrap">
                <CheckCircle size={16} />
              </div>
              <div className="badge-info">
                <span className="badge-title">Leave Approved</span>
                <span className="badge-num">David Cole (Vacation)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
