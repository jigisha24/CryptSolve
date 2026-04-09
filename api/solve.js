const { parsePuzzle, solvePuzzle_CSP } = require('../solver');

module.exports = async (req, res) => {
  // CORS configuration for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { puzzleString } = req.body || {};
    if (!puzzleString) {
      return res.status(400).json({ error: 'puzzleString is required' });
    }

    const puzzle = parsePuzzle(puzzleString);
    const result = solvePuzzle_CSP(puzzle);
    
    // Convert the Set back to an array to avoid Vercel edge runtime serialization errors
    if (puzzle.leading instanceof Set) {
      puzzle.leading = Array.from(puzzle.leading);
    }

    // Return safely parsed JSON
    return res.status(200).json({ puzzle, result });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
