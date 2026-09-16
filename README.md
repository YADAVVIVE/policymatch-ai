# PolicyMatch AI

New India Assurance's internal AI-Assisted Policy Comparison tool prototype.

## Prerequisites
- Node.js (v16 or higher recommended)
- npm

## Setup & Running

This project uses a unified start command.

1. Install dependencies (this will install root, backend, and frontend dependencies):
   ```bash
   npm install
   ```

2. Start both the backend and frontend:
   ```bash
   npm start
   ```

- The React Frontend will be available at [http://localhost:5173](http://localhost:5173).
- The Express Backend will be available at [http://localhost:3001](http://localhost:3001).

## AI Comparison API

To generate an AI-powered comparison, you can use the `POST /api/compare` endpoint. If an `ANTHROPIC_API_KEY` is present in your environment, it will use Claude to generate the rationale. Otherwise, it gracefully falls back to a rule-based mock.

### Example Request (Postman Style)

**Endpoint:** `POST http://localhost:3001/api/compare`
**Content-Type:** `application/json`

**Body:**
```json
{
  "policy_ids": ["M001", "M002"],
  "customer": {
    "id": "C001",
    "name": "Ravi Kumar",
    "age": 34,
    "location": "Mumbai",
    "risk_profile": "Low"
  }
}
```

**Example Response:**
```json
{
  "label": "AI Recommendation (Pending Human Review)",
  "status": "pending_review",
  "customer_id": "C001",
  "customer_name": "Ravi Kumar",
  "comparison": [
    {
      "policy_id": "M001",
      "insurer_name": "New India Assurance",
      "policy_name": "Comprehensive Motor Cover",
      "premium": 15000,
      "coverage_amount": 500000,
      "exclusions": [
        "Wear and Tear",
        "Driving under influence"
      ],
      "add_ons": [
        "Zero Depreciation",
        "Engine Protect"
      ],
      "claim_settlement_ratio": 94.5
    },
    {
      "policy_id": "M002",
      "insurer_name": "New India Assurance",
      "policy_name": "Third Party Basic",
      "premium": 5000,
      "coverage_amount": 750000,
      "exclusions": [
        "Own Damage"
      ],
      "add_ons": [
        "PA Cover"
      ],
      "claim_settlement_ratio": 94.5
    }
  ],
  "ranked_recommendation": [
    "M002",
    "M001"
  ],
  "rationale": "[MOCK AI] Based on Ravi Kumar's Low risk profile, Third Party Basic offers the best balance of premium and coverage. (Note: Anthropic API Key missing, showing rule-based fallback).",
  "confidence_score": 75
}
```

## Demo Script

Follow this click-path to demonstrate the core value proposition of PolicyMatch AI in under 3 minutes:

1. **Landing Page:** Start on the home screen. Briefly explain the 'As-Is' problem (slow manual comparison) and the 'To-Be' solution (AI with Human Oversight). Click **Start New Comparison**.
2. **Select Policies:** On the dashboard, select two or three policies (e.g., *Max Health Pro* and *Optima Secure*) for Customer *Ravi Kumar*. Click **Compare Selected Policies**.
3. **AI Recommendation (Normal Workflow):** Review the side-by-side comparison. Point out the AI's plain-language rationale and the 'Pending Human Review' tag. 
4. **Underwriter Review (Approve):** Scroll down to the Underwriter Review panel. Fill in your name, select **Approve AI Recommendation**, and click **Submit Final Decision**. Show how the immutable Audit Log appears.
5. **AI Escalation Workflow (Senior Mode):** Click the top-left logo to return to the home screen, then start a new comparison. Select a combination of policies that forces a low-confidence score (or simulate it). 
6. **Role Lockout:** Show how the system flags it as 'Needs Senior Review' and prevents a normal Underwriter from submitting. 
7. **Senior Override:** Check the **Senior Mode** box in the top navigation. The form unlocks. Select **Override AI Recommendation**, choose a different policy, add a comment ('Customer specifically requested broader maternity cover'), and submit.
8. **Audit Trail:** Click the **Audit Trail** button in the top navigation. Show how all decisions—especially the override—are immutably logged with distinct AI vs. Human timestamps. Use the filter to show 'Overridden' cases.
9. **Analytics Dashboard:** Click the **Dashboard** button. Show the business impact metrics: total comparisons, approval rate, turnaround time, and the human oversight decision split chart.

