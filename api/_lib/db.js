const fs = require('fs');
const path = require('path');

// IN-MEMORY MOCK DB FOR PROTOTYPE
// NOTE: For a real production version on Vercel, persistent storage 
// (e.g. Vercel KV, PostgreSQL, MongoDB) would be needed because 
// serverless functions are stateless and reset between cold starts.
// For this demo, in-memory per-request mock data is used as requested.
let db = { customers: [], policies: [], comparisons: [] };

try {
  // Load initial seed data from project root /data
  const dataPath = path.join(process.cwd(), 'data', 'seed.json');
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, 'utf8');
    const seed = JSON.parse(data);
    db.customers = seed.customers || [];
    db.policies = seed.policies || [];
  }
} catch (error) {
  console.error('Error loading seed data:', error);
}

module.exports = db;
