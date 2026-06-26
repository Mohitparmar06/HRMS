import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className={`nav-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#home" className="logo" onClick={closeMenu}>
          <div className="logo-dot"></div>
          <span>Dayflow</span>
        </a>

        {/* Desktop Links */}
        <nav>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#demo">Request Demo</a></li>
          </ul>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-text">Login</Link>
          <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
            Get Started <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger button */}
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        <ul className="nav-links">
          <li><a href="#home" onClick={closeMenu}>Home</a></li>
          <li><a href="#features" onClick={closeMenu}>Features</a></li>
          <li><a href="#how-it-works" onClick={closeMenu}>How It Works</a></li>
          <li><a href="#testimonials" onClick={closeMenu}>Testimonials</a></li>
          <li><a href="#faq" onClick={closeMenu}>FAQ</a></li>
          <li><a href="#demo" onClick={closeMenu}>Request Demo</a></li>
        </ul>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary" onClick={closeMenu}>Login</Link>
          <Link to="/login" className="btn btn-primary" onClick={closeMenu}>Get Started</Link>
        </div>
      </div>
    </header>
  );
}
