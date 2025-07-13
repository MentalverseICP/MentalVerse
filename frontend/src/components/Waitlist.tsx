import React, { useState } from 'react';
import './Waitlist.css';

const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Email submitted:', email);
  };

  return (
    <div className="waitlist-app">
      <div className="waitlist-container">
        {/* Main Content */}
        <div className="waitlist-main-content">
          <img src="/logo.png" alt="Logo" className="waitlist-logo" />
        <div className="waitlist-glassmorphism-card">
          <div className="waitlist-brand-label">MentalVerse</div>
            <h1 className="waitlist-title">Join the waitlist</h1>
            <p className="waitlist-subtitle">
              Get exclusive early access to our software and stay updated on launch news.
            </p>

            <form onSubmit={handleSubmit} className="waitlist-signup-form">
              <div className="waitlist-input-container">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="waitlist-email-input"
                  required
                />
              </div>
              <button type="submit" className="waitlist-submit-button">
                Join waitlist
              </button>
            </form>
            
            <button className="waitlist-x-logo-button">
          𝕏
        </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;