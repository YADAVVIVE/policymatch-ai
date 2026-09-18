const db = require('./_lib/db');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  res.status(200).json(db.customers);
};
