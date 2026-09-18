import React, { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function ReviewPanel({ data, role, onDecisionComplete }) {
  const [reviewerName, setReviewerName] = useState('');
  const [decision, setDecision] = useState('');
  const [comment, setComment] = useState('');
  const [overridePolicyId, setOverridePolicyId] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!reviewerName.trim()) {
      return setError('Reviewer name is required.');
    }
    if (!decision) {
      return setError('Please select a decision.');
    }
    if (decision === 'overridden' && !comment.trim()) {
      return setError('A comment is required when overriding AI recommendation.');
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/comparisons/${data.id}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: reviewerName,
          decision,
          override_policy_id: overridePolicyId,
          comment
        })
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Failed to submit review');

      onDecisionComplete(responseData.comparison);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already reviewed, show audit trail
  if (data.audit) {
    return (
      <div className="review-panel audit-trail">
        <h3>Final Decision Log</h3>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>Reviewer:</strong> {data.audit.reviewer_name}</p>
        <p><strong>Decision:</strong> {data.audit.decision}</p>
        {data.audit.override_policy_id && <p><strong>Overridden Policy:</strong> {data.audit.override_policy_id}</p>}
        {data.audit.comment && <p><strong>Comment:</strong> {data.audit.comment}</p>}
        <p><small>{new Date(data.audit.timestamp).toLocaleString()}</small></p>
      </div>
    );
  }

  const isLowConfidence = data.confidence_score < 70;
  const isNeedsSenior = data.status === 'needs_senior_review';
  const canReview = !isNeedsSenior || role === 'Senior Underwriter';

  return (
    <div className={`review-panel ${isNeedsSenior ? 'needs-senior' : ''}`}>
      <h3>Underwriter Review</h3>
      
      {isNeedsSenior && (
        <div className="senior-warning">
          <AlertTriangle size={18} />
          <span><strong>Automatic Escalation Triggered:</strong> AI confidence is below 70%. This case must be reviewed by a Senior Underwriter.</span>
        </div>
      )}

      <p className="review-disclaimer">
        The AI has made a recommendation, but human oversight is required. 
        <strong> You make the final authoritative decision.</strong>
      </p>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        {!canReview && (
          <div className="role-lockout">
            <Info size={16} />
            Your current role ({role}) does not have permission to submit a final decision for escalated cases. Toggle Senior Mode to proceed.
          </div>
        )}

        <div className="form-group">
          <label>Reviewer Name *</label>
          <input 
            type="text" 
            value={reviewerName} 
            onChange={e => setReviewerName(e.target.value)} 
            placeholder="e.g. Jane Doe"
            required
            disabled={!canReview}
          />
        </div>

        <div className="form-group">
          <label>Decision *</label>
          <div className="decision-options">
            <label>
              <input 
                type="radio" 
                name="decision" 
                value="approved" 
                onChange={e => setDecision(e.target.value)} 
                disabled={!canReview}
              />
              Approve AI Recommendation
            </label>
            <label>
              <input 
                type="radio" 
                name="decision" 
                value="overridden" 
                onChange={e => setDecision(e.target.value)} 
                disabled={!canReview}
              />
              Override AI Recommendation
            </label>
            <label>
              <input 
                type="radio" 
                name="decision" 
                value="escalated" 
                onChange={e => setDecision(e.target.value)} 
                disabled={!canReview}
              />
              Escalate to Senior Review {!isLowConfidence && '(Optional)'}
            </label>
          </div>
        </div>

        {decision === 'overridden' && (
          <div className="form-group">
            <label>Select Override Policy</label>
            <select 
              value={overridePolicyId} 
              onChange={e => setOverridePolicyId(e.target.value)}
              disabled={!canReview}
            >
              <option value="">-- Select Policy --</option>
              {data.comparison.map(p => (
                <option key={p.policy_id} value={p.policy_id}>
                  {p.policy_name} ({p.policy_id})
                </option>
              ))}
            </select>
          </div>
        )}

        {(decision === 'overridden' || decision === 'escalated') && (
          <div className="form-group">
            <label>Comment {decision === 'overridden' ? '*' : ''}</label>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              placeholder="Explain rationale for overriding or escalating..."
              rows="3"
              disabled={!canReview}
            />
          </div>
        )}

        <button type="submit" className="btn" disabled={isSubmitting || !canReview}>
          {isSubmitting ? 'Submitting...' : 'Submit Final Decision'}
        </button>
      </form>
    </div>
  );
}
