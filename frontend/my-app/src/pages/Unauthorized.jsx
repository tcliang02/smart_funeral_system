'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import './Unauthorized.css';

const Unauthorized = () => {
  const router = useRouter();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="unauthorized-icon">
          <ShieldX size={80} />
        </div>

        <h1>Access Restricted</h1>
        <p className="unauthorized-message">
          This feature is only available to family members.
        </p>

        <div className="restricted-features">
          <h3>Family-Only Features:</h3>
          <ul>
            <li>🤝 <strong>Counselor AI</strong> - Grief support and counseling</li>
            <li>💬 <strong>Deceased Person AI</strong> - Voice memorial conversations</li>
          </ul>
        </div>

        <div className="public-features">
          <h3>Available to Everyone:</h3>
          <ul>
            <li>🤖 <strong>AI Assistant</strong> - Website help (floating chat widget)</li>
            <li>📖 Memorial tributes and condolences</li>
            <li>🕊️ Public memorial pages</li>
          </ul>
        </div>

        <div className="unauthorized-actions">
          <button 
            className="btn-secondary"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <button 
            className="btn-primary"
            onClick={() => router.push('/')}
          >
            <Home size={18} />
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
