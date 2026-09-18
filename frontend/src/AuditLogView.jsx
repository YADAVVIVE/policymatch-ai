import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, UserCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import './AuditLogView.css';
import { getAllComparisons } from './lib/comparisonsStore';

export default function AuditLogView({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    try {
      const data = getAllComparisons();
      const sortedLog = [...data].sort((a, b) => new Date(b.ai_timestamp) - new Date(a.ai_timestamp));
      setLogs(sortedLog);
    } catch (err) {
      setError("Failed to load audit logs from storage");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.status === filter);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="status-badge approved"><CheckCircle size={14}/> Approved</span>;
      case 'overridden': return <span className="status-badge overridden"><XCircle size={14}/> Overridden</span>;
      case 'escalated': return <span className="status-badge escalated"><ShieldAlert size={14}/> Escalated</span>;
      default: return <span className="status-badge pending"><Clock size={14}/> Pending</span>;
    }
  };

  return (
    <div className="audit-log-view animate-fade-in">
      <div className="audit-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Dashboard
        </button>
        <h2>Compliance Audit Trail</h2>
      </div>

      <div className="filter-bar">
        <label>Filter by Status: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Records</option>
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="overridden">Overridden</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>Couldn't load data</h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : loading ? (
        <div className="loading">Loading Audit Logs...</div>
      ) : (
        <div className="table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Policies Compared</th>
                <th>AI Rec. (Confidence)</th>
                <th>Final Decision</th>
                <th>Reviewer / Comment</th>
                <th>AI Timestamp</th>
                <th>Human Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">No records found.</td>
                </tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.customer_name}</strong>
                    <div className="subtext">{log.customer_id}</div>
                  </td>
                  <td>
                    <div className="tag-list">
                      {log.comparison.map(p => (
                        <span key={p.policy_id} className="tag">{p.policy_id}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <strong>{log.ranked_recommendation[0] || '-'}</strong>
                    <div className="subtext">Conf: {log.confidence_score}%</div>
                  </td>
                  <td>
                    {getStatusBadge(log.status)}
                    {log.audit?.override_policy_id && (
                      <div className="subtext mt-1">
                        New: <strong>{log.audit.override_policy_id}</strong>
                      </div>
                    )}
                  </td>
                  <td>
                    {log.audit ? (
                      <>
                        <div className="reviewer-name"><UserCheck size={12}/> {log.audit.reviewer_name}</div>
                        {log.audit.comment && <div className="reviewer-comment">"{log.audit.comment}"</div>}
                      </>
                    ) : (
                      <span className="subtext">-</span>
                    )}
                  </td>
                  <td className="timestamp-cell">
                    <span className="ai-time">{formatDate(log.ai_timestamp)}</span>
                  </td>
                  <td className="timestamp-cell">
                    <span className="human-time">{formatDate(log.audit?.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
