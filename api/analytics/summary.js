const db = require('../_lib/db');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const comparisons = db.comparisons;
  const total = comparisons.length;
  
  if (total === 0) {
    return res.status(200).json({
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
    decisionSplit[c.status] = (decisionSplit[c.status] || 0) + 1;

    if (c.audit && c.ai_timestamp && c.audit.timestamp) {
      const aiTime = new Date(c.ai_timestamp).getTime();
      const humanTime = new Date(c.audit.timestamp).getTime();
      totalTurnaroundTime += (humanTime - aiTime);
      reviewedCount++;
    }

    const dateStr = new Date(c.ai_timestamp).toISOString().split('T')[0];
    dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
  });

  const avgTurnaroundSecs = reviewedCount > 0 
    ? Math.round((totalTurnaroundTime / reviewedCount) / 1000) 
    : 0;

  const timeSeries = Object.keys(dailyCounts).sort().map(date => ({
    date,
    comparisons: dailyCounts[date]
  }));

  res.status(200).json({
    total,
    avg_turnaround_seconds: avgTurnaroundSecs,
    decision_split: decisionSplit,
    time_series: timeSeries
  });
};
