require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client if key is available
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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

  let rationale = "";
  let ranked_recommendation = [];
  let confidence_score = 0;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an AI insurance advisor. Compare the following policies for a customer.
      
Customer Profile:
${JSON.stringify(customer, null, 2)}

Policies:
${JSON.stringify(policies, null, 2)}

Provide a JSON response with the following format exactly:
{
  "ranked_recommendation": ["policy_id_1", "policy_id_2"],
  "rationale": "A plain-language rationale explaining the ranking and trade-offs for this specific customer.",
  "confidence_score": 85
}
Ensure the output is strictly valid JSON without any markdown formatting wrappers.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text().trim();
      
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        ranked_recommendation = parsed.ranked_recommendation || [];
        rationale = parsed.rationale || "AI rationale could not be parsed.";
        confidence_score = parsed.confidence_score || 0;
      } else {
        throw new Error("Failed to parse JSON from AI response");
      }
    } catch (error) {
      console.error("AI Error:", error.message || error);
      // Fallback in case of error
      const fallback = mockComparison(policies, customer);
      ranked_recommendation = fallback.ranked_recommendation;
      rationale = fallback.rationale;
      confidence_score = fallback.confidence_score;
    }
  } else {
    // Fallback: rule-based mock
    const fallback = mockComparison(policies, customer);
    ranked_recommendation = fallback.ranked_recommendation;
    rationale = fallback.rationale;
    confidence_score = fallback.confidence_score;
  }

  // IMPORTANT: The AI output is explicitly labeled per constraints.
  // NEW: Auto-flag low confidence as Needs Senior Review
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

  return {
    ranked_recommendation: sorted.map(p => p.policy_id),
    rationale: `[MOCK AI] Based on ${customer.name}'s ${customer.risk_profile} risk profile, ${sorted[0].policy_name} offers the best balance of premium and coverage. (Note: Gemini API Key missing or failed, showing rule-based fallback).`,
    confidence_score: 75
  };
}

module.exports = {
  generateComparison
};
