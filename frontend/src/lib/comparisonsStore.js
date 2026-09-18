const STORAGE_KEY = 'policymatch_comparisons';

export function getAllComparisons() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('localStorage is unavailable', error);
    return [];
  }
}

export function saveComparison(record) {
  try {
    const comparisons = getAllComparisons();
    comparisons.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
  } catch (error) {
    console.warn('localStorage is unavailable', error);
  }
}

export function updateComparisonDecision(id, decisionData) {
  try {
    const comparisons = getAllComparisons();
    const index = comparisons.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const comparison = comparisons[index];
      comparison.status = decisionData.decision;
      
      if (decisionData.decision === 'approved') {
        comparison.label = "Approved by Underwriter";
      } else if (decisionData.decision === 'overridden') {
        comparison.label = "Overridden by Underwriter";
        comparison.final_policy_id = decisionData.override_policy_id;
      } else if (decisionData.decision === 'escalated') {
        comparison.label = "Escalated to Senior Review";
      }

      comparison.audit = {
        reviewer_name: decisionData.reviewer_name,
        decision: decisionData.decision,
        override_policy_id: decisionData.decision === 'overridden' ? decisionData.override_policy_id : null,
        comment: decisionData.comment,
        timestamp: new Date().toISOString()
      };

      comparisons[index] = comparison;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
      return comparison;
    }
  } catch (error) {
    console.warn('localStorage is unavailable', error);
  }
  return null;
}

export function clearAllComparisons() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('localStorage is unavailable', error);
  }
}
