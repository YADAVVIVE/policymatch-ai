const db = require('./_lib/db');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const sortedLog = [...db.comparisons].sort((a, b) => {
    return new Date(b.ai_timestamp) - new Date(a.ai_timestamp);
  });
  res.status(200).json(sortedLog);
};
