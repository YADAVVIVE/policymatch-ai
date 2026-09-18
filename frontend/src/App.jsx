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
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchData = async () => {
      try {
        const [policiesRes, customersRes] = await Promise.all([
          fetch('http://127.0.0.1:3001/api/policies', { signal: abortController.signal }),
          fetch('http://127.0.0.1:3001/api/customers', { signal: abortController.signal })
        ]);
        
        if (!policiesRes.ok || !customersRes.ok) throw new Error("Failed to load initial data");

        const policiesData = await policiesRes.json();
        const customersData = await customersRes.json();
        
        setPolicies(Array.isArray(policiesData) ? policiesData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredPolicies = activeTab === 'All' 
    ? (policies || []) 
    : (policies || []).filter(p => p.category === activeTab);

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
      const response = await fetch('http://127.0.0.1:3001/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_ids: Array.from(selectedPolicies),
          customer: customers && customers.length > 0 ? customers[0] : null
        })
      });
      if (!response.ok) throw new Error("Comparison failed");
      const data = await response.json();
      setCompareData(data);
    } catch (err) {
      console.error("Comparison Error:", err);
      alert("Failed to compare policies. Please try again.");
    } finally {
      setIsComparing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading AI Insights...</div>;
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: 'var(--text-primary)' }}>
        <h3>Couldn't load data</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-header" onClick={() => { setShowLanding(true); setCompareData(null); setShowAuditLog(false); setShowDashboard(false); }} style={{cursor: 'pointer'}}>
          <Shield size={24} style={{ color: 'var(--primary)' }} />
          <h1>PolicyMatch AI</h1>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${!showLanding && !showDashboard && !showAuditLog && !compareData ? 'active' : ''}`} onClick={() => { setShowLanding(false); setCompareData(null); setShowAuditLog(false); setShowDashboard(false); }}>
            <Home size={18} />
            <span>New Comparison</span>
          </button>
          <button className={`nav-item ${showDashboard ? 'active' : ''}`} onClick={() => { setShowDashboard(true); setShowAuditLog(false); setShowLanding(false); setCompareData(null); }}>
            <BarChart2 size={18} />
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${showAuditLog ? 'active' : ''}`} onClick={() => { setShowAuditLog(true); setShowDashboard(false); setShowLanding(false); setCompareData(null); }}>
            <FileText size={18} />
            <span>Audit Trail</span>
          </button>
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div className="breadcrumb">
            {showLanding ? 'Welcome' : showDashboard ? 'Dashboard' : showAuditLog ? 'Audit Trail' : compareData ? 'Comparison Results' : 'Select Policies'}
          </div>
          <div className="topbar-actions">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              <input 
                type="checkbox" 
                checked={role === 'Senior Underwriter'} 
                onChange={(e) => setRole(e.target.checked ? 'Senior Underwriter' : 'Underwriter')}
              />
              Senior Mode ({role})
            </label>
            <div className="user-avatar" title={role}>
              {role === 'Senior Underwriter' ? 'SU' : 'UW'}
            </div>
          </div>
        </header>

        <div className="content-area">
          {showLanding ? (
            <LandingView onStart={() => setShowLanding(false)} />
          ) : showDashboard ? (
            <DashboardView onBack={() => {setShowDashboard(false); setShowLanding(false);}} />
          ) : showAuditLog ? (
            <AuditLogView onBack={() => {setShowAuditLog(false); setShowLanding(false);}} />
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

              <div className="policy-grid">
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
                              <CheckSquare size={16} style={{ color: 'var(--primary)', marginRight: '6px' }}/>
                            ) : (
                              <Square size={16} style={{ color: 'var(--text-secondary)', marginRight: '6px' }}/>
                            )}
                            {policy.policy_name}
                          </h3>
                          <h4 style={{ paddingLeft: '22px' }}>{policy.insurer_name}</h4>
                        </div>
                        <span className={`badge ${policy.category.toLowerCase()}`}>
                          {policy.category}
                        </span>
                      </div>
                      
                      <div className="card-body">
                        <div className="stat">
                          <span className="stat-label">Annual Premium</span>
                          <span className="stat-value highlight">
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
                            {(policy.add_ons || []).map((addon, idx) => (
                              <span key={idx} className="tag">
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
                  <span style={{fontSize: '14px', fontWeight: 500}}>{selectedPolicies.size} policy selected (Select 2-4)</span>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCompareSubmit}
                    disabled={selectedPolicies.size < 2 || isComparing}
                  >
                    {isComparing ? 'Analyzing...' : 'Compare Selected'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
