/**
 * Generate a comparison between multiple policies for a specific customer profile.
 * @param {Array} policies - List of policy objects.
 * @param {Object} customer - Customer profile object.
 * @returns {Object} Structured comparison result.
 */
async function generateComparison(policies, customer) {
  // Base feature-by-feature comparison table
  const featureTable = policies.map(policy => ({
    policy_id: policy.policy_id,
    insurer_name: policy.insurer_name,
    policy_name: policy.policy_name,
    premium: policy.premium,
    coverage_amount: policy.coverage_amount,
    exclusions: policy.exclusions,
    add_ons: policy.add_ons,
    claim_settlement_ratio: policy.claim_settlement_ratio,
  }));

  const mockOutput = mockComparison(policies, customer);
  const ranked_recommendation = mockOutput.ranked_recommendation;
  const rationale = mockOutput.rationale;
  const confidence_score = mockOutput.confidence_score;

  // IMPORTANT: The AI output is explicitly labeled per constraints.
  // Auto-flag low confidence as Needs Senior Review
  const isLowConfidence = confidence_score < 70;
  
  return {
    label: isLowConfidence ? "AI Recommendation (Needs Senior Review)" : "AI Recommendation (Pending Human Review)",
    status: isLowConfidence ? "needs_senior_review" : "pending_review",
    customer_id: customer.id,
    customer_name: customer.name,
    comparison: featureTable,
    ranked_recommendation,
    rationale,
    confidence_score
  };
}

function mockComparison(policies, customer) {
  const sorted = [...policies].sort((a, b) => {
    if (customer.risk_profile === "High") return b.coverage_amount - a.coverage_amount;
    return a.premium - b.premium;
  });

  const bestPolicy = sorted[0];
  const runnerUp = sorted.length > 1 ? sorted[1] : null;

  let rationale = "";
  let confidence_score = 85;

  if (runnerUp) {
    const premiumDiff = Math.abs(bestPolicy.premium - runnerUp.premium);
    const coverageDiff = Math.abs(bestPolicy.coverage_amount - runnerUp.coverage_amount);
    
    // Varies the confidence score realistically based on how close the compared policies are on premium and coverage
    if (premiumDiff < 1000 && coverageDiff < 500000) {
      confidence_score = 65; // Low confidence, triggering escalation path
    } else if (premiumDiff > 5000 || coverageDiff >= 1000000) {
      confidence_score = 95; // High confidence
    } else {
      confidence_score = 80;
    }

    const firstExclusion = bestPolicy.exclusions && bestPolicy.exclusions.length > 0 ? bestPolicy.exclusions[0].toLowerCase() : "certain specific conditions";
    
    rationale = `Based on ${customer.name}'s ${customer.risk_profile} risk profile, ${bestPolicy.policy_name} by ${bestPolicy.insurer_name} is recommended. It offers an optimal premium of ₹${bestPolicy.premium.toLocaleString('en-IN')} and a strong claim settlement ratio of ${bestPolicy.claim_settlement_ratio}%. While it excludes ${firstExclusion}, it presents better overall value compared to ${runnerUp.policy_name}, which was the runner-up.`;
  } else {
    rationale = `Based on ${customer.name}'s ${customer.risk_profile} risk profile, ${bestPolicy.policy_name} by ${bestPolicy.insurer_name} is the optimal choice given the selection.`;
    confidence_score = 90;
  }

  return {
    ranked_recommendation: sorted.map(p => p.policy_id),
    rationale,
    confidence_score
  };
}

module.exports = {
  generateComparison
};
