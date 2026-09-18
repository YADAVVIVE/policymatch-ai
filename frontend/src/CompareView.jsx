import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import ReviewPanel from './ReviewPanel';

export default function CompareView({ data: initialData, role, onBack }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  if (!data || !data.comparison || !Array.isArray(data.comparison) || data.comparison.length === 0) {
    return (
      <div className="compare-view animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Policies
        </button>
        <div style={{ marginTop: '2rem' }}>No comparison data available yet.</div>
      </div>
    );
  }

  const {
    label,
    status,
    customer_name,
    comparison,
    ranked_recommendation,
    rationale,
    confidence_score
  } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const topPolicyId = ranked_recommendation[0];

  return (
    <div className="compare-view animate-fade-in">
      <button className="btn-back" onClick={onBack}>
        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
        Back to Policies
      </button>

      <div className="ai-summary-card">
        <div className="ai-header">
          <div className="ai-title">
            <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
            <h2>AI Analysis for {customer_name}</h2>
          </div>
          <span className={`status-badge ${status}`}>
            <AlertTriangle size={14} style={{ marginRight: '4px' }} />
            {label}
          </span>
        </div>

        <div className="ai-content">
          <div className="rationale-section">
            <h3>Rationale</h3>
            <p>{rationale}</p>
          </div>
          
          <div className="confidence-section">
            <div className="confidence-label">
              <span>Confidence Score</span>
              <span>{confidence_score}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${confidence_score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              {comparison.map(policy => (
                <th key={policy.policy_id} className={policy.policy_id === topPolicyId ? 'recommended-col' : ''}>
                  {policy.policy_id === topPolicyId && (
                    <div className="rec-badge">
                      <CheckCircle size={14} /> Recommended
                    </div>
                  )}
                  <div className="th-policy-name">{policy.policy_name}</div>
                  <div className="th-insurer">{policy.insurer_name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="feature-label">Premium</td>
              {comparison.map(p => (
                <td key={p.policy_id} className={p.policy_id === topPolicyId ? 'recommended-col' : ''}>
                  <strong>{formatCurrency(p.premium)}</strong>
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Coverage</td>
              {comparison.map(p => (
                <td key={p.policy_id} className={p.policy_id === topPolicyId ? 'recommended-col' : ''}>
                  {formatCurrency(p.coverage_amount)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Settlement Ratio</td>
              {comparison.map(p => (
                <td key={p.policy_id} className={p.policy_id === topPolicyId ? 'recommended-col' : ''}>
                  {p.claim_settlement_ratio}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Key Exclusions</td>
              {comparison.map(p => (
                <td key={p.policy_id} className={p.policy_id === topPolicyId ? 'recommended-col' : ''}>
                  <ul className="feature-list">
                    {p.exclusions.map((ex, i) => <li key={i}>{ex}</li>)}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Add-ons</td>
              {comparison.map(p => (
                <td key={p.policy_id} className={p.policy_id === topPolicyId ? 'recommended-col' : ''}>
                  <div className="tag-list" style={{ justifyContent: 'center' }}>
                    {p.add_ons.map((addon, i) => (
                      <span key={i} className="tag">{addon}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <ReviewPanel 
        data={data} 
        role={role}
        onDecisionComplete={(updatedData) => setData(updatedData)} 
      />
    </div>
  );
}
