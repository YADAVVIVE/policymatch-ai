import React, { useState, useEffect } from 'react';
import { Shield, Car, HeartPulse, Check, X, CheckSquare, Square, FileText, BarChart2, Home } from 'lucide-react';
import CompareView from './CompareView';
import AuditLogView from './AuditLogView';
import DashboardView from './DashboardView';
import LandingView from './LandingView';

function App() {
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPolicies, setSelectedPolicies] = useState(new Set());
  const [isComparing, setIsComparing] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [role, setRole] = useState('Underwriter'); // Added role toggle

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, customersRes] = await Promise.all([
          fetch('http://localhost:3001/api/policies'),
          fetch('http://localhost:3001/api/customers')
        ]);
        
        const policiesData = await policiesRes.json();
        const customersData = await customersRes.json();
        
        setPolicies(policiesData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredPolicies = activeTab === 'All' 
    ? policies 
    : policies.filter(p => p.category === activeTab);

  const toggleSelection = (policyId) => {
    const newSelection = new Set(selectedPolicies);
    if (newSelection.has(policyId)) {
      newSelection.delete(policyId);
    } else {
      if (newSelection.size < 4) {
        newSelection.add(policyId);
      } else {
        alert("You can only compare up to 4 policies.");
      }
    }
    setSelectedPolicies(newSelection);
  };

  const handleCompareSubmit = async () => {
    if (selectedPolicies.size < 2) return;
    setIsComparing(true);
    try {
      const response = await fetch('http://localhost:3001/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_ids: Array.from(selectedPolicies),
          customer: customers[0] // Using first mock customer
        })
      });
      const data = await response.json();
      setCompareData(data);
    } catch (error) {
      console.error("Comparison Error:", error);
    } finally {
      setIsComparing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading AI Insights...</div>;
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => { setShowLanding(true); setCompareData(null); setShowAuditLog(false); setShowDashboard(false); }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={28} style={{ color: 'var(--primary)' }} />
            PolicyMatch AI — New India Assurance
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="role-toggle" style={{ marginRight: '1rem', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={role === 'Senior Underwriter'} 
                onChange={(e) => setRole(e.target.checked ? 'Senior Underwriter' : 'Underwriter')}
              />
              Senior Mode ({role})
            </label>
          </div>
          <button className="tab" onClick={() => { setShowDashboard(true); setShowAuditLog(false); setShowLanding(false); }}>
            <BarChart2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Dashboard
          </button>
          <button className="tab" onClick={() => { setShowAuditLog(true); setShowDashboard(false); setShowLanding(false); }}>
            <FileText size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Audit Trail
          </button>
        </div>
      </header>

      {showLanding ? (
        <LandingView onStart={() => setShowLanding(false)} />
      ) : showDashboard ? (
        <DashboardView onBack={() => setShowDashboard(false)} />
      ) : showAuditLog ? (
        <AuditLogView onBack={() => setShowAuditLog(false)} />
      ) : compareData ? (
        <CompareView 
          data={compareData} 
          role={role}
          onBack={() => setCompareData(null)} 
        />
      ) : (
        <>
          <div className="tabs">
            {['All', 'Motor', 'Health'].map(tab => (
              <button 
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Motor' && <Car size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/>}
                {tab === 'Health' && <HeartPulse size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/>}
                {tab}
              </button>
            ))}
          </div>

          <div className="grid">
            {filteredPolicies.map((policy) => {
              const isSelected = selectedPolicies.has(policy.policy_id);
              return (
                <div 
                  className={`card ${isSelected ? 'selected' : ''}`} 
                  key={policy.policy_id}
                  onClick={() => toggleSelection(policy.policy_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-header">
                    <div>
                      <h3>
                        {isSelected ? (
                          <CheckSquare size={18} style={{ color: 'var(--primary)', marginRight: '6px', verticalAlign: 'text-bottom' }}/>
                        ) : (
                          <Square size={18} style={{ color: 'var(--text-light)', marginRight: '6px', verticalAlign: 'text-bottom' }}/>
                        )}
                        {policy.policy_name}
                      </h3>
                      <h4 style={{ paddingLeft: '24px' }}>{policy.insurer_name}</h4>
                    </div>
                    <span className={`badge ${policy.category.toLowerCase()}`}>
                      {policy.category}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="stat">
                      <span className="stat-label">Annual Premium</span>
                      <span className="stat-value" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(policy.premium)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Coverage Amount</span>
                      <span className="stat-value">{formatCurrency(policy.coverage_amount)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Settlement Ratio</span>
                      <span className="stat-value">{policy.claim_settlement_ratio}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Tenure</span>
                      <span className="stat-value">{policy.tenure} Year(s)</span>
                    </div>

                    <div className="list-section">
                      <h5>Key Add-ons</h5>
                      <div className="tag-list">
                        {policy.add_ons.map((addon, idx) => (
                          <span key={idx} className="tag">
                            <Check size={12} style={{ color: '#16a34a', marginRight: '4px', verticalAlign: 'middle' }} />
                            {addon}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPolicies.size > 0 && (
            <div className="compare-action-bar animate-fade-in">
              <span>{selectedPolicies.size} policy selected (Select 2-4)</span>
              <button 
                className="btn" 
                onClick={handleCompareSubmit}
                disabled={selectedPolicies.size < 2 || isComparing}
              >
                {isComparing ? 'Analyzing...' : 'Compare AI Match'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
