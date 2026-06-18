import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      text: "Dayflow completely changed how we handle attendance. The geofenced mobile check-in works flawlessly for our hybrid employees and integrates directly into our custom rosters.",
      name: "Melissa Thorne",
      role: "Director of HR at TechNovate",
      initials: "MT",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
    },
    {
      text: "Automating payroll through Dayflow saves us 15 hours every single month. Direct deposits are prompt, tax filings are simplified, and the reporting dashboards are incredibly detailed.",
      name: "Marcus Vance",
      role: "Founder & CEO at SphereIQ",
      initials: "MV",
      gradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"
    },
    {
      text: "The glassmorphic layout is beautiful, and our staff loves the self-service leave portal. It's rare to find HR software that employees actually enjoy using on a daily basis.",
      name: "Aisha Jenkins",
      role: "Operations Head at Vertex Digital",
      initials: "AJ",
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
    }
  ];

  return (
    <section id="testimonials" className="section">
      <div className="section-header">
        <div className="hero-badge" style={{ marginBottom: '16px' }}>
          <span>Success Stories</span>
        </div>
        <h2>Loved by <span className="gradient-text">HR Professionals</span></h2>
        <p>
          Read how leading startups and scaling enterprises use Dayflow to automate operations and build outstanding team cultures.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, idx) => (
          <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" stroke="none" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
            </div>
            
            <div className="testimonial-user">
              <div 
                className="user-avatar" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: t.gradient,
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-display)'
                }}
              >
                {t.initials}
              </div>
              <div className="user-info">
                <h4>{t.name}</h4>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
