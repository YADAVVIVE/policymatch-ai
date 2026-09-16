import React from 'react';
import { ArrowRight, ShieldCheck, Zap, UserCheck } from 'lucide-react';

export default function LandingView({ onStart }) {
  return (
    <div className="landing-view animate-fade-in">
      <div className="hero-section">
        <div className="hero-icon">
          <ShieldCheck size={48} style={{ color: 'var(--primary)' }} />
        </div>
        <h1>PolicyMatch AI — New India Assurance</h1>
        <p className="hero-subtitle">Intelligent Policy Comparison & Human Oversight</p>
      </div>

      <div className="problem-solution-card">
        <div className="ps-block as-is">
          <h3>The "As-Is" Problem</h3>
          <p>
            Underwriters spend hours manually cross-referencing dense policy documents across various internal and competitor products. This manual comparison is slow, prone to human error, and delays customer quoting, negatively impacting our market responsiveness.
          </p>
        </div>
        
        <div className="ps-divider">
          <ArrowRight size={24} style={{ color: 'var(--primary)' }} />
        </div>

        <div className="ps-block to-be">
          <h3>The "To-Be" Solution</h3>
          <p>
            PolicyMatch AI instantly structures and compares policies using Generative AI, providing a ranked recommendation with a plain-language rationale. Crucially, it enforces a <strong>Human-in-the-Loop</strong> workflow—where low-confidence cases are auto-escalated and underwriters make the final, auditable decision.
          </p>
        </div>
      </div>

      <div className="cta-section">
        <button className="btn cta-btn" onClick={onStart}>
          Start New Comparison <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'text-bottom' }} />
        </button>
      </div>

      <div className="features-grid">
        <div className="feature">
          <Zap size={24} style={{ color: '#0284c7' }} />
          <h4>Instant Analysis</h4>
          <p>AI scans exclusions, add-ons, and premiums instantly.</p>
        </div>
        <div className="feature">
          <UserCheck size={24} style={{ color: '#16a34a' }} />
          <h4>Human Oversight</h4>
          <p>Every decision is reviewed and authorized by an underwriter.</p>
        </div>
        <div className="feature">
          <ShieldCheck size={24} style={{ color: '#d97706' }} />
          <h4>Compliance Audit</h4>
          <p>Immutable logging of AI logic and human actions.</p>
        </div>
      </div>
    </div>
  );
}
