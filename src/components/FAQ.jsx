import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqItems = [
    {
      question: "Is Dayflow suitable for remote or hybrid teams?",
      answer: "Yes! Dayflow is built from the ground up for hybrid workforces. It features geofenced mobile clock-ins, IP restriction options, custom time zone configurations, and remote employee self-onboarding."
    },
    {
      question: "How secure is employee data in Dayflow?",
      answer: "We take data security extremely seriously. Dayflow utilizes bank-grade AES-256 encryption at rest and TLS 1.3 in transit. We are fully compliant with SOC2 and GDPR guidelines, and offer comprehensive role-based access controls."
    },
    {
      question: "Can we integrate Dayflow with Slack or Microsoft Teams?",
      answer: "Absolutely. Dayflow integrates directly with Slack, Microsoft Teams, Google Calendar, and Outlook. You can receive daily attendance summaries, submit leave requests via chat commands, and sync holiday plans instantly."
    },
    {
      question: "What is the typical setup time for a new company?",
      answer: "Most scaling companies get fully onboarded within 24 hours. You can bulk upload employee details via CSV, map your custom departments, set leave accrual rules, and invite employees with a single click."
    },
    {
      question: "Is there migration support for existing HR data?",
      answer: "Yes, our dedicated customer success team offers free migration support. We will help format your historical payroll, leave history, and employee records and transition them smoothly into Dayflow."
    }
  ];

  const handleToggle = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <section id="faq" className="section">
      <div className="section-header">
        <div className="hero-badge" style={{ marginBottom: '16px' }}>
          <span>Faq</span>
        </div>
        <h2>Frequently Asked <span className="gradient-text">Questions</span></h2>
        <p>
          Everything you need to know about the Dayflow HR platform, security features, integrations, and setup process.
        </p>
      </div>

      <div className="faq-container">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <button 
              className="faq-question" 
              onClick={() => handleToggle(index)}
              aria-expanded={activeIndex === index}
            >
              <span>{item.question}</span>
              <Plus className="faq-toggle-icon" size={20} />
            </button>
            <div className="faq-answer">
              <div className="faq-answer-inner">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
