const db = require('./_lib/db');
const { generateComparison } = require('./_lib/comparisonEngine');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { policy_ids, customer } = req.body;
    
    if (!policy_ids || !Array.isArray(policy_ids) || policy_ids.length < 2 || policy_ids.length > 4) {
      return res.status(400).json({ error: "Please provide a list of 2 to 4 policy_ids." });
    }
    
    if (!customer || !customer.id) {
      return res.status(400).json({ error: "Please provide a valid customer profile." });
    }

    const selectedPolicies = db.policies.filter(p => policy_ids.includes(p.policy_id));
    if (selectedPolicies.length !== policy_ids.length) {
      return res.status(400).json({ error: "One or more policy_ids were not found." });
    }

    const comparisonResult = await generateComparison(selectedPolicies, customer);
    
    const comparison_id = 'comp_' + Date.now();
    const comparisonRecord = {
      id: comparison_id,
      ...comparisonResult,
      ai_timestamp: new Date().toISOString(),
      audit: null
    };
    db.comparisons.push(comparisonRecord);
    
    res.status(200).json(comparisonRecord);
  } catch (error) {
    console.error("Comparison API Error:", error);
    res.status(500).json({ error: "Failed to generate comparison." });
  }
};
