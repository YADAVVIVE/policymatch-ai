const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateComparison } = require('./comparisonEngine');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load seed data
const dataPath = path.join(__dirname, '../data/seed.json');
let db = { customers: [], policies: [], comparisons: [] };

try {
  const data = fs.readFileSync(dataPath, 'utf8');
  const seed = JSON.parse(data);
  db.customers = seed.customers || [];
  db.policies = seed.policies || [];
  console.log('Seed data loaded successfully.');
} catch (error) {
  console.error('Error loading seed data:', error);
}

// Routes
app.get('/api/customers', (req, res) => {
  res.json(db.customers);
});

app.get('/api/policies', (req, res) => {
  res.json(db.policies);
});

app.get('/api/policies/:category', (req, res) => {
  const category = req.params.category.toLowerCase();
  const filtered = db.policies.filter(p => p.category.toLowerCase() === category);
  res.json(filtered);
});

app.post('/api/compare', async (req, res) => {
  try {
    const { policy_ids, customer } = req.body;
    
    if (!policy_ids || !Array.isArray(policy_ids) || policy_ids.length < 2 || policy_ids.length > 4) {
      return res.status(400).json({ error: "Please provide a list of 2 to 4 policy_ids." });
    }
    
    if (!customer || !customer.id) {
      return res.status(400).json({ error: "Please provide a valid customer profile." });
    }

    // Fetch the requested policies from db
    const selectedPolicies = db.policies.filter(p => policy_ids.includes(p.policy_id));
    if (selectedPolicies.length !== policy_ids.length) {
      return res.status(400).json({ error: "One or more policy_ids were not found." });
    }

    const comparisonResult = await generateComparison(selectedPolicies, customer);
    
    // Assign a unique ID and save to our in-memory DB for the review process
    const comparison_id = 'comp_' + Date.now();
    const comparisonRecord = {
      id: comparison_id,
      ...comparisonResult,
      ai_timestamp: new Date().toISOString(),
      audit: null // will be populated on review
    };
    db.comparisons.push(comparisonRecord);
    
    res.json(comparisonRecord);

  } catch (error) {
    console.error("Comparison API Error:", error);
    res.status(500).json({ error: "Failed to generate comparison." });
  }
});

// Audit Log Endpoint
app.get('/api/audit-log', (req, res) => {
  // Return all comparisons ordered by newest first
  const sortedLog = [...db.comparisons].sort((a, b) => {
    return new Date(b.ai_timestamp) - new Date(a.ai_timestamp);
  });
  res.json(sortedLog);
});

// Underwriter Review Endpoint
app.put('/api/comparisons/:id/decision', (req, res) => {
  const { id } = req.params;
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

  // Update status based on decision
  comparison.status = decision;
  if (decision === 'approved') {
    comparison.label = "Approved by Underwriter";
  } else if (decision === 'overridden') {
    comparison.label = "Overridden by Underwriter";
    comparison.final_policy_id = override_policy_id;
  } else if (decision === 'escalated') {
    comparison.label = "Escalated to Senior Review";
  }

  // Store audit trail
  comparison.audit = {
    reviewer_name,
    decision,
    override_policy_id: decision === 'overridden' ? override_policy_id : null,
    comment,
    timestamp: new Date().toISOString()
  };

  res.json({ success: true, comparison });
});

// Analytics Dashboard Endpoint
app.get('/api/analytics/summary', (req, res) => {
  const comparisons = db.comparisons;
  const total = comparisons.length;
  
  if (total === 0) {
    return res.json({
      total: 0,
      avg_turnaround_seconds: 0,
      decision_split: { approved: 0, overridden: 0, escalated: 0, pending_review: 0 },
      time_series: []
    });
  }

  let totalTurnaroundTime = 0;
  let reviewedCount = 0;
  
  const decisionSplit = { approved: 0, overridden: 0, escalated: 0, pending_review: 0 };
  const dailyCounts = {};

  comparisons.forEach(c => {
    // Decision Split
    decisionSplit[c.status] = (decisionSplit[c.status] || 0) + 1;

    // Turnaround Time
    if (c.audit && c.ai_timestamp && c.audit.timestamp) {
      const aiTime = new Date(c.ai_timestamp).getTime();
      const humanTime = new Date(c.audit.timestamp).getTime();
      totalTurnaroundTime += (humanTime - aiTime);
      reviewedCount++;
    }

    // Time Series (group by date string)
    const dateStr = new Date(c.ai_timestamp).toISOString().split('T')[0];
    dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
  });

  const avgTurnaroundSecs = reviewedCount > 0 
    ? Math.round((totalTurnaroundTime / reviewedCount) / 1000) 
    : 0;

  // Format time series for Recharts
  const timeSeries = Object.keys(dailyCounts).sort().map(date => ({
    date,
    comparisons: dailyCounts[date]
  }));

  res.json({
    total,
    avg_turnaround_seconds: avgTurnaroundSecs,
    decision_split: decisionSplit,
    time_series: timeSeries
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
