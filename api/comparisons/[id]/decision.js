const db = require('../../_lib/db');

module.exports = (req, res) => {
  if (req.method !== 'PUT') return res.status(405).send('Method Not Allowed');

  const { id } = req.query; // Vercel extracts dynamic path segments into req.query
  const { reviewer_name, decision, override_policy_id, comment } = req.body;

  if (!reviewer_name) {
    return res.status(400).json({ error: "Reviewer name is required." });
  }
  
  if (!['approved', 'overridden', 'escalated'].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision. Must be approved, overridden, or escalated." });
  }

  if (decision === 'overridden' && !comment) {
    return res.status(400).json({ error: "A comment explaining the override is required." });
  }

  const comparison = db.comparisons.find(c => c.id === id);
  if (!comparison) {
    return res.status(404).json({ error: "Comparison record not found." });
  }

  comparison.status = decision;
  if (decision === 'approved') {
    comparison.label = "Approved by Underwriter";
  } else if (decision === 'overridden') {
    comparison.label = "Overridden by Underwriter";
    comparison.final_policy_id = override_policy_id;
  } else if (decision === 'escalated') {
    comparison.label = "Escalated to Senior Review";
  }

  comparison.audit = {
    reviewer_name,
    decision,
    override_policy_id: decision === 'overridden' ? override_policy_id : null,
    comment,
    timestamp: new Date().toISOString()
  };

  res.status(200).json({ success: true, comparison });
};
