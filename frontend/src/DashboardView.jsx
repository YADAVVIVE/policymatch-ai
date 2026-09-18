import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, FileText, CheckCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardView({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/summary', { signal: abortController.signal });
        if (!response.ok) throw new Error("Failed to load analytics");
        const summary = await response.json();
        setData(summary);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("Failed to fetch analytics:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    return () => abortController.abort();
  }, []);

  if (loading) {
    return <div className="loading">Loading Analytics Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-view animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Dashboard
        </button>
        <h3>Couldn't load data</h3>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!data || !data.decision_split) {
    return (
      <div className="dashboard-view animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Dashboard
        </button>
        <div style={{ marginTop: '2rem' }}>No data yet</div>
      </div>
    );
  }

  // Format turnaround time for display
  const formatTime = (seconds) => {
    if (seconds === 0) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Prepare data for Pie Chart
  const decisionData = [
    { name: 'Approved', value: data.decision_split.approved || 0, color: '#22c55e' },
    { name: 'Overridden', value: data.decision_split.overridden || 0, color: '#ef4444' },
    { name: 'Escalated', value: data.decision_split.escalated || 0, color: '#f97316' },
    { name: 'Pending', value: data.decision_split.pending_review || 0, color: '#eab308' }
  ].filter(d => d.value > 0); // Only show segments with data

  // Prepare fallback if totally empty
  const hasDecisions = decisionData.length > 0;

  // Prepare time series for Bar Chart
  const timeSeriesData = data.time_series && data.time_series.length > 0 
    ? data.time_series 
    : [{ date: new Date().toISOString().split('T')[0], comparisons: 0 }];

  const totalDecisions = 
    data.decision_split.approved + 
    data.decision_split.overridden + 
    data.decision_split.escalated;

  const approvalRate = totalDecisions > 0 
    ? Math.round((data.decision_split.approved / totalDecisions) * 100) 
    : 0;

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Dashboard
        </button>
        <h2>Efficiency Impact Dashboard</h2>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <FileText size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total AI Comparisons</span>
            <span className="kpi-value">{data.total}</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">AI Approval Rate</span>
            <span className="kpi-value">{totalDecisions > 0 ? `${approvalRate}%` : 'N/A'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Avg. Review Turnaround</span>
            <span className="kpi-value">{formatTime(data.avg_turnaround_seconds)}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Human Oversight Decisions</h3>
          <div className="chart-container">
            {hasDecisions ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={decisionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {decisionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No decisions recorded yet.</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>Comparisons Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="comparisons" 
                  fill="#0ea5e9" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  name="Comparisons Generated"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
